/// <reference lib="webworker" />

import createModule from './libpsxav/xa_encoder';
import type { MainModule } from './libpsxav/interface';

let wasm: MainModule;

export type XAEncodeOptions = {
	pcm: Int16Array;
	frequency: 18900 | 37800;
	channels: 1 | 2;
	bitDepth: 4 | 8;
};

onmessage = async (e: MessageEvent<XAEncodeOptions>) => {
	const { pcm, frequency, channels, bitDepth } = e.data;

	// Load WASM only once
	if (!wasm) wasm = (await createModule()) as MainModule;

	const sampleCount = pcm.length / channels;

	const HEAP32 = wasm.HEAP32;
	const settings = wasm._malloc(24);
	HEAP32[settings >> 2] = 0;
	HEAP32[(settings >> 2) + 1] = +!!(channels === 2);
	HEAP32[(settings >> 2) + 2] = frequency;
	HEAP32[(settings >> 2) + 3] = bitDepth;
	HEAP32[(settings >> 2) + 4] = 1;
	HEAP32[(settings >> 2) + 5] = 1;

	const pcmPtr = wasm._malloc(pcm.length * 2);
	wasm.HEAP16.set(pcm, pcmPtr >> 1);

	const getSize = wasm.cwrap('psx_audio_xa_get_buffer_size', 'number', ['number', 'number']);
	const bufferSize = getSize(settings, sampleCount);

	const outPtr = wasm._malloc(bufferSize);
	const encode = wasm.cwrap('psx_audio_xa_encode_simple', 'number', [
		'number',
		'number',
		'number',
		'number'
	]);
	const outLength = encode(settings, pcmPtr, sampleCount, outPtr);
	const output = wasm.HEAPU8.slice(outPtr, outPtr + outLength);

	wasm._free(settings);
	wasm._free(pcmPtr);
	wasm._free(outPtr);

	console.log(`[INFO] [XA] ${new Date().toISOString()} - Encode finished.`);

	postMessage(output, [output.buffer]);
};
