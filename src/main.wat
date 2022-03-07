(module
  ;; Memory will be imported from js for easier modification on the UI side
  (import "util" "memory" (memory 1))

  ;; Console log for debugging
  (import "console" "log" (func $console_log (param i32)))

  ;; Function to get cell address in memory
  (func $memaddr
    (param $width i32) ;; Board width; height does not affect calculations
    (param $row i32)
    (param $col i32)
    (result i32)
    ;; address = row * width + col
    local.get $width
    local.get $row
    i32.mul
    local.get $col
    i32.add
  )

  ;; Convinience: duplicate current value on the stack
  (func $dup
    (param $value i32)
    (result i32 i32)
    local.get $value
    local.get $value
  )

  ;; Convinience: log current value on the stack and put it back
  (func $debug
    (param $value i32)
    (result i32)
    local.get $value
    call $console_log
    local.get $value
  )

  ;; Function to execute elementary cellular automaton with rule N
  (func (export "rule_n")
    ;; Rule number
    (param $rule i32)
    ;; Board width
    (param $width i32)
    ;; Board height
    (param $height i32)

    ;; Current row and column
    (local $row i32)
    (local $col i32)
    ;; The three-bit pattern: prev cell, cur cell, next cell
    (local $pattern i32)

    ;; Start from the row with index 1 since we've already initialized row with index 0
    i32.const 1
    local.set $row

    ;; Iterate over each row starting from 1
    (loop $rows
      ;; Initialize pattern with prev cell (0 for the first cell of the row) and cur cell
      ;; Previous cell is out of bounds so we assume it's 0
      ;; Leftshifting 0 does not change it, so we don't have to do anything here
      ;; Current cell
      ;; Get memory address
      local.get $width ;; Board width
      local.get $row ;; Row
      i32.const 0 ;; Col
      call $memaddr
      ;; Read value from the current cell's memory address
      i32.load8_s
      ;; No leftshift needed - we'll do it while we iterate over columns
      ;; Just store this as pattern
      local.set $pattern

      ;; Set current cell's col to 0
      i32.const 0
      local.set $col

      ;; Iterate over each column starting from 0 to width - 2
      ;; We need a special case for the last cell since it has no next cell
      (loop $cols
        ;; Calculate cell address first
        ;; We'll write cell's value using this address later
        local.get $width
        local.get $row
        local.get $col
        call $memaddr

        ;; We'll leftshift this bit by pattern to get the current cell's value later
        i32.const 1

        ;; Need to leftshift the current pattern by one and truncate it
        ;; Leftshift
        local.get $pattern
        i32.const 1
        i32.shl
        ;; Truncate: pattern = pattern & 0b111
        i32.const 7
        i32.and

        ;; Now we can add the value of the next cell to the pattern: pattern = pattern | next
        ;; Next cells address
        local.get $width
        ;; We get next cell from the previous row, so need to decrease row index
        local.get $row
        i32.const 1
        i32.sub
        ;; Next cell has col index of current cell + 1
        local.get $col
        i32.const 1
        i32.add
        ;; Get address
        call $memaddr
        ;; Read from this address
        i32.load8_s
        ;; We have our pattern and the value of the next cell on the stack, so we can just 'or'
        i32.or

        ;; Store pattern
        call $dup
        local.set $pattern

        ;; Now we calculate the current cell's value
        ;; If 1 << pattern & rule != 0, we set it to 1, otherwise 0
        ;; We've pushed this 1 to the stack previously
        i32.shl
        local.get $rule
        i32.and
        ;; Compare to 0
        i32.const 0
        i32.ne

        ;; No we have cell's address and value on the stack; write it
        i32.store8

        ;; Push col value onto the stack
        local.get $col
        ;; Add one to it on the stack
        i32.const 1
        i32.add
        ;; Store the increased col value back into the local, but keep it on the stack
        local.tee $col
        ;; Compare the increased col value with $width - 1
        ;; The last cell should be handled separately since it has no next cell
        local.get $width
        i32.const 1
        i32.sub
        i32.ne
        ;; Until not equal, keep looping
        br_if $cols
      )

      ;; Handle the last cell: currently, col == width - 1
      ;; Get it's address first
      local.get $width
      local.get $row
      local.get $col
      call $memaddr

      ;; We'll leftshift this bit by pattern to get the current cell's value later
      i32.const 1

      ;; For the last cell we should only leftshift the pattern and truncate it
      ;; Leftshift
      local.get $pattern
      i32.const 1
      i32.shl
      ;; Truncate: pattern = pattern & 0b111
      i32.const 7
      i32.and

      ;; Can't add the next cell since it's absent
      ;; Just set the current cell's value with pattern
      ;; If 1 << pattern & rule != 0, we set it to 1, otherwise 0
      ;; We've pushed this 1 to the stack previously
      i32.shl
      local.get $rule
      i32.and
      ;; Compare to 0
      i32.const 0
      i32.ne

      ;; No we have cell's address and value on the stack; write it
      i32.store8

      ;; Push row value onto the stack
      local.get $row
      ;; Add one to it on the stack
      i32.const 1
      i32.add
      ;; Store the increased row value back into the local, but keep it on the stack
      local.tee $row
      ;; Compare the increased row value with the total number of rows
      local.get $height
      i32.ne
      ;; Until not equal, keep looping
      br_if $rows
    )
  )

  ;; Function for checking if provided value v is in range [a; b)
  (func $check_if_in_bounds
    ;; Value
    (param $v i32)
    ;; Lower boundary (inclusive)
    (param $a i32)
    ;; Upper boundary (exclusive)
    (param $b i32)
    ;; Check result - boolean
    (result i32)

    ;; Check if v >= a
    local.get $v
    local.get $a
    i32.ge_s

    ;; Check if v < b
    local.get $v
    local.get $b
    i32.lt_s

    ;; Return (v >= a) && (v < b)
    i32.and
  )

  ;; This creates imageData that can be put as an image to canvas
  (func (export "render_to_canvas")
    (param $board_width i32)
    (param $board_height i32)
    (param $canvas_width i32)
    (param $canvas_height i32)
    (param $center_x i32)
    (param $center_y i32)
    ;; (param $zoom f32)

    ;; We render a rectangle that could be outside or inside of the board
    ;; Need to store the extact boundaries of that board rectangle
    (local $board_left i32)
    (local $board_right i32)
    (local $board_top i32)
    (local $board_bottom i32)

    ;; X and Y coordinates of current pixels of the image data
    (local $x i32)
    (local $y i32)

    ;; X and Y coordinates of current pixels of the image data
    (local $board_x i32)
    (local $board_y i32)

    ;; Canvas pixel color intensity
    (local $intensity i32)

    ;; Canvas pixel address
    (local $pixel_address i32)

    ;; Calculate board rectangle borders
    
    ;; board_left = center_x - canvas_width / 2 * zoom
    local.get $center_x
    local.get $canvas_width
    ;; local.get $zoom
    ;; i32.mul
    i32.const 2
    i32.div_s
    i32.sub
    local.set $board_left
    
    ;; board_right = center_x + canvas_width / 2 * zoom
    local.get $center_x
    local.get $canvas_width
    ;; local.get $zoom
    ;; i32.mul
    i32.const 2
    i32.div_s
    i32.add
    local.set $board_right
    
    ;; board_top = center_y - canvas_height / 2 * zoom
    local.get $center_y
    local.get $canvas_height
    ;; local.get $zoom
    ;; i32.mul
    i32.const 2
    i32.div_s
    i32.sub
    local.set $board_top
    
    ;; board_right = center_y + canvas_height / 2 * zoom
    local.get $center_y
    local.get $canvas_height
    ;; local.get $zoom
    ;; i32.mul
    i32.const 2
    i32.div_s
    i32.add
    local.set $board_bottom

    ;; Put every pixel on canvas
    ;; Iterate for y: 0..canvas_height
    ;; Iterate for x: 0..canvas_width
    i32.const 0
    local.set $y
    (loop $y_loop
      i32.const 0
      local.set $x
      (loop $x_loop
        ;; Main body of the loop

        ;; Calculate board_x and board_y

        ;; board_x = board_left + (board_right - board_left) * (x / canvas_width)
        local.get $board_left
        ;; board_right - board_left
        local.get $board_right
        local.get $board_left
        i32.sub
        ;; (board_right - board_left) * x
        local.get $x
        i32.mul
        ;; (board_right - board_left) * x / canvas_width
        local.get $canvas_width
        i32.div_s
        ;; board_left + (board_right - board_left) * (x / canvas_width)
        i32.add
        ;; Store board_x
        local.set $board_x

        ;; board_y = board_top + (board_bottom - board_top) * (y / canvas_height)
        local.get $board_top
        ;; board_bottom - board_top
        local.get $board_bottom
        local.get $board_top
        i32.sub
        ;; (board_bottom - board_top) * y
        local.get $y
        i32.mul
        ;; (board_bottom - board_top) * y / canvas_height
        local.get $canvas_height
        i32.div_s
        ;; board_top + (board_bottom - board_top) * (y / canvas_height)
        i32.add
        ;; Store board_y
        local.set $board_y

        ;; Color intensity:
        ;; If cell coordinates are outside of the board: gray (100)
        ;; If cell is empty: white (255)
        ;; If cell is filled: black (0)

        ;; Check if cell's X coordinate is inside the board
        local.get $board_x
        i32.const 0
        local.get $board_width
        call $check_if_in_bounds

        ;; Check if cell's Y coordinate is inside the board
        local.get $board_y
        i32.const 0
        local.get $board_height
        call $check_if_in_bounds

        ;; Check if cell's X or Y are inside the board
        i32.or

        ;; Calculate color intensity conditionally
        (if
          ;; If inside, check cell value
          (then
            ;; Get cell address
            local.get $board_width
            local.get $board_x
            local.get $board_y
            call $memaddr

            ;; Get cell value
            i32.load8_s

            ;; If value is 0, intensity should be 255
            ;; If value is 1, intensity should be 0
            ;; Change 0 to 1 and 1 to 0: compare value to 0
            i32.const 0
            i32.eq
            ;; Multiply this value by 255 to get the correct intensity
            i32.const 255
            i32.mul
            local.set $intensity
          )
          ;; If outside, pixel color should be gray - intensity 100
          (else
            i32.const 100
            local.set $intensity
          )
        )

        ;; Memory map:
        ;; [0; board_width*board_height) - this is where the generated board is stored
        ;; [board_width*board_height; board_width*board_height + canvas_width*canvas_height*4) - this is where image data is stored

        ;; Calculate image data pixel address:
        ;; Image data is stored right after the board
        ;; There are 4 bytes for each color
        ;; i = board_width*board_height + (y * canvas_width + x) * 4
        ;; board_width*board_height
        local.get $board_width
        local.get $board_height
        i32.mul
        ;; y * canvas_width + x
        local.get $y
        ;; call $debug
        local.get $canvas_width
        i32.mul
        local.get $x
        ;; call $debug
        i32.add
        ;; (y * canvas_width + x) * 4
        i32.const 4
        i32.mul
        ;; board_width*board_height + (y * canvas_width + x) * 4
        i32.add
        ;; call $debug
        ;; Store calculated pixel address
        local.set $pixel_address

        ;; Set R, G, B bytes to intensity
        ;; R
        local.get $pixel_address
        local.get $intensity
        i32.store8
        ;; G
        local.get $pixel_address
        i32.const 1
        i32.add
        local.get $intensity
        i32.store8
        ;; B
        local.get $pixel_address
        i32.const 2
        i32.add
        local.get $intensity
        i32.store8
        ;; Set opacity byte to 255
        local.get $pixel_address
        i32.const 3
        i32.add
        i32.const 255
        i32.store8

        ;; End of main body of the loop

        ;; x += 1
        local.get $x
        i32.const 1
        i32.add
        local.set $x

        ;; Compare x to canvas_width
        local.get $x
        local.get $canvas_width

        ;; Loop until x equals canvas_width
        i32.ne
        br_if $x_loop
      )

      ;; y += 1
      local.get $y
      i32.const 1
      i32.add
      local.set $y

      ;; Compare y to canvas_height
      local.get $y
      local.get $canvas_height

      ;; Loop until y equals canvas_height
      i32.ne
      br_if $y_loop
    )
  )
)
