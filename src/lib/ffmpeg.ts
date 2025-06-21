import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { parseWAV_PCM } from './wav';

class FFmpegHandler {
	readonly #base = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm';
	#ffmpeg = new FFmpeg();

	constructor() {
		// this.#ffmpeg.on('log', ({ message }) => {
		// 	console.log(message);
		// });
	}

	async load() {
		await this.#ffmpeg.load({
			coreURL: await toBlobURL(`${this.#base}/ffmpeg-core.js`, 'text/javascript'),
			wasmURL: await toBlobURL(`${this.#base}/ffmpeg-core.wasm`, 'application/wasm')
		});
	}

	async encode(file: File, index: number): Promise<Int16Array> {
		if (!this.#ffmpeg.loaded) {
			throw new Error('not_loaded');
		}

		const ext = file.name.split('.').pop() ?? 'wav';
		const inputFile = `${index}.${ext}`;
		const outputFile = `${index}_o.wav`;

		await this.#ffmpeg.writeFile(inputFile, await fetchFile(file));
		await this.#ffmpeg.exec([
			'-i',
			inputFile,
			'-acodec',
			'pcm_s16le',
			'-ac',
			'2',
			'-ar',
			'37800',
			outputFile
		]);
		const buffer = (await this.#ffmpeg.readFile(outputFile)) as Uint8Array;
		this.#ffmpeg.deleteFile(outputFile);

		const pcm = parseWAV_PCM(buffer);
		console.log(`[INFO] [FFMPEG] ${new Date().toISOString()} - Encode finished.`);
		return pcm;
	}
}

export const ffmpegHandler = new FFmpegHandler();
