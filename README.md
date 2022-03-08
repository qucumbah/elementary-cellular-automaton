# Elementary Cellular Automaton renderer

[**Check it out on GitHub pages!**](https://qucumbah.github.io/elementary-cellular-automaton/)

[![screenshot of rule 110 simulation](https://user-images.githubusercontent.com/39967396/157229163-231151b1-cbd5-40f8-85b9-4564dfa9cdc6.png)](https://qucumbah.github.io/elementary-cellular-automaton/)

A visualization of elementary cellular automaton written in WebAssembly text format.

## Features

![screenshot of rule 193 simulation with panning and zooming](https://user-images.githubusercontent.com/39967396/157230622-6a0757a7-0d85-4f0b-b661-505258f33704.png)

You may try out any of the 256 possible rules.

Board size is customizable, and you may also pan and zoom the generated image.

Initialization can be random, or it can happen from a single `1` value on the right side of the board.

## Explanation

There is a [wikipedia article](https://en.wikipedia.org/wiki/Elementary_cellular_automaton) that explains what an elementary cellular automaton is.

## Technical details

The main functionality - rule generation and rendering - are written in WebAssembly text format.

WAST code is located in the [main.wast](https://github.com/qucumbah/elementary-cellular-automaton/blob/main/src/main.wat) file.

Pattern generation happens on the first `board_width * board_height` bytes of memory, where each byte is either a 0 or a 1.

After these bytes, there are `canvas_width * canvas_height * 4` bytes that are used to store the rendered image.

The rendered image is converted from binary to `ImageData` and put to a canvas.
