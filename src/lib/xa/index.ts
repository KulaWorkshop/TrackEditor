import MyWorker from './worker?worker';

export type InterleaveParam = {
	buffer: Uint8Array;
	fileNumber: number;
	channel: number;
	position: number;
};

export type XAEncodeOptions = {
	pcm: Int16Array;
	frequency: 18900 | 37800;
	channels: 1 | 2;
	bitDepth: 4 | 8;
};

export class XAEncoder {
	static readonly SECTOR_SIZE = 2336;
	#workers: Worker[];
	#queue: (() => void)[] = [];
	#available: Worker[];

	constructor(workers: number) {
		this.#workers = Array.from({ length: workers }, () => new MyWorker());
		this.#available = [...this.#workers];
	}

	async run(options: XAEncodeOptions): Promise<Uint8Array> {
		if (this.#available.length === 0) {
			await new Promise<void>((resolve) => this.#queue.push(resolve));
		}

		const worker = this.#available.pop()!;
		return new Promise((resolve, reject) => {
			worker.onmessage = (e) => {
				this.#available.push(worker);
				if (this.#queue.length > 0) this.#queue.shift()!();
				resolve(new Uint8Array(e.data));
			};
			worker.onerror = (err) => {
				this.#available.push(worker);
				if (this.#queue.length > 0) this.#queue.shift()!();
				reject(err);
			};

			worker.postMessage(options, [options.pcm.buffer]);
		});
	}

	terminate() {
		this.#workers.forEach((w) => w.terminate());
	}

	static interleave(entries: InterleaveParam[]) {
		const sectors: Uint8Array[] = [];

		// write sectors
		let moreData = true;
		while (moreData) {
			moreData = false;

			for (const entry of entries) {
				if (entry.position < entry.buffer.length) {
					moreData = true;

					// read sector
					const sector = new Uint8Array(XAEncoder.SECTOR_SIZE);
					const size = Math.min(
						XAEncoder.SECTOR_SIZE,
						entry.buffer.length - entry.position
					);
					sector.set(entry.buffer.subarray(entry.position, entry.position + size));

					// set headers
					if (entry.fileNumber >= 0) {
						sector[0x00] = sector[0x04] = entry.fileNumber;
					}
					if (entry.channel >= 0) {
						sector[0x01] = sector[0x05] = entry.channel & 0x1f;
					}

					// Set EDC flag
					sector[0x91f] = 0xff;

					sectors.push(sector);
					entry.position += size;
				} else {
					// null sector
					const nullSector = new Uint8Array(XAEncoder.SECTOR_SIZE);
					sectors.push(nullSector);
				}
			}
		}

		// combine sectors
		const buffer = new Uint8Array(sectors.length * XAEncoder.SECTOR_SIZE);
		let offset = 0;
		for (const sector of sectors) {
			buffer.set(sector, offset);
			offset += XAEncoder.SECTOR_SIZE;
		}

		return buffer;
	}
}
