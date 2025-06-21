export function parseWAV_PCM(buffer: Uint8Array) {
	const riffHeader = new TextDecoder().decode(buffer.subarray(0, 4));
	const waveHeader = new TextDecoder().decode(buffer.subarray(8, 12));
	if (riffHeader !== 'RIFF' || waveHeader !== 'WAVE') {
		throw new Error('invalid wav: missing headers.');
	}

	// find data chunk
	let dataChunkOffset = -1;
	let dataChunkSize = -1;
	let offset = 12;

	while (offset < buffer.length) {
		const chunkId = new TextDecoder().decode(buffer.subarray(offset, offset + 4));
		const view = new DataView(buffer.buffer, buffer.byteOffset + offset + 4, 4);
		const chunkSize = view.getUint32(0, true);

		if (chunkId === 'data') {
			dataChunkOffset = offset + 8; // data chunk ID
			dataChunkSize = chunkSize;
			break;
		}

		offset += 8 + chunkSize; // move to next chunk
	}

	if (dataChunkOffset === -1 || dataChunkSize === -1) {
		throw new Error('invalid wav: missing data chunk.');
	}

	// extract pcm data
	const pcmDataView = new DataView(
		buffer.buffer,
		buffer.byteOffset + dataChunkOffset,
		dataChunkSize
	);
	const numSamples = dataChunkSize / 2;
	const pcm16Array = new Int16Array(numSamples);

	for (let i = 0; i < numSamples; i++) {
		pcm16Array[i] = pcmDataView.getInt16(i * 2, true);
	}

	return pcm16Array;
}
