(module
  ;; Memory will be imported from js for easier modification on the UI size
  (import "util" "memory" (memory 1))

  ;; Console log for debugging
  (import "console" "log" (func $console_log (param i32)))

  ;; Function to get cell address in memory
  (func $memaddr
    (param $size i32) ;; Board size (square)
    (param $row i32)
    (param $col i32)
    (result i32)
    ;; address = row * size + col
    local.get $size
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
    ;; Board size (square)
    (param $size i32)

    ;; Current row and column
    (local $row i32)
    (local $col i32)
    ;; The three-bit pattern: prev cell, cur cell, next cell
    (local $pattern i32)

    ;; Starting condition: set the rightmost cell in the first row to 1
    ;; Board size
    local.get $size
    ;; Row = 0
    i32.const 0
    ;; Col = size - 1
    local.get $size
    i32.const 1
    i32.sub
    ;; Get memory address
    call $memaddr
    ;; Set 1
    i32.const 1
    i32.store8

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
      local.get $size ;; Board size
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

      ;; Iterate over each column starting from 0 to size - 2
      ;; We need a special case for the last cell since it has no next cell
      (loop $cols
        ;; Calculate cell address first
        ;; We'll write cell's value using this address later
        local.get $size
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
        local.get $size
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
        ;; Compare the increased col value with $size - 1
        ;; The last cell should be handled separately since it has no next cell
        local.get $size
        i32.const 1
        i32.sub
        i32.ne
        ;; Until not equal, keep looping
        br_if $cols
      )

      ;; Handle the last cell: currently, col == size - 1
      ;; Get it's address first
      local.get $size
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
      local.get $size
      i32.ne
      ;; Until not equal, keep looping
      br_if $rows
    )
  )
)
