# Track Editor

A web-based tool for modifying soundtrack information from **Kula Quest**.

## Showcase

## Usage

Getting started is pretty straightforward with this editor, as all you need is a modern web browser. Originally, various desktop tools were needed to encode and interleave XA files, but this is no longer needed as I have ported this process to the web.

### Encoding XA Files

Soundtracks in the game are stored in .XA files, which can be built containing custom tracks and played. Each XA file stores **4 tracks**, and how they're structured can be referenced [here](https://example.com). You can utilize decoder tools such as [jPSXdec](https://github.com/m35/jpsxdec) as well to view the contents of existing XA files. To create your own, simply navigate to the [track editor](https://example.com) and select 4 music files to build an XA file. As of this time, you cannot replace a single track inside a multi-track XA file, they can only be built from scratch.

It is worth noting that when importing custom .XA files into any game, it's **strongly** recommended to use a tool like [mkpsxiso](https://github.com/Lameguy64/mkpsxiso) to build your game, instead of injecting the file with a tool such as psx-mode2. I demonstrate how to use mkpsxiso in my [randomizer tutorial](https://www.youtube.com/watch?v=ebwn7yB1bUc).

### Track Durations

The game will restart background soundtracks after they have ended during gameplay, but this is unfortunately not done automatically. Each soundtrack in the XA file has its duration hardcoded inside the game's main executable file, and is patchable in the "Durations" tab in the editor.

## Credits

This project uses both **psxavenc** and **xainterleave** to perform the encode process. The source code of these programs was gathered from the original [candyk-psx-tools repository](https://github.com/ChenThread/candyk-psx).

- Copyright (c) 2019, 2020 Adrian "asie" Siekierka
- Copyright (c) 2019 Ben "GreaseMonkey" Russell
