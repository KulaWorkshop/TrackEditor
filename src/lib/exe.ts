type Identifier = {
	offset: number;
	value: string;
	trackOffset: number;
};

export class kEXE {
	static readonly IDS: Identifier[] = [
		{ offset: 0x8fde4, value: 'BISC', trackOffset: 0x666de }, // SCPS-10064
		{ offset: 0x927b4, value: 'BESC', trackOffset: 0x62c02 }, // SCES-01000
		{ offset: 0x93d0c, value: 'BASL', trackOffset: 0x63d2e } // SLUS-00724
	];
	#view: DataView;

	static fromBuffer(buffer: ArrayBuffer): kEXE | null {
		let trackOffset = -1;
		for (const { offset, value, trackOffset: currentTrackOffset } of kEXE.IDS) {
			const slice = buffer.slice(offset, offset + 4);
			if (new TextDecoder().decode(slice) === value) {
				trackOffset = currentTrackOffset;
				break;
			}
		}

		if (trackOffset === -1) {
			return null;
		}

		return new kEXE(trackOffset, buffer);
	}

	constructor(
		private trackOffset: number,
		public buffer: ArrayBuffer
	) {
		this.#view = new DataView(buffer);
	}

	getTrackData(): number[] {
		const trackData: number[] = [];

		let index = this.trackOffset;
		for (let i = 0; i < 13; i++) {
			const value = this.#view.getUint16(index, true);
			trackData.push(value);
			index += 8;
		}

		return trackData;
	}

	setTrackData(data: number[]): boolean {
		let index = this.trackOffset;
		for (let i = 0; i < 13; i++) {
			this.#view.setUint16(index, data[i], true);
			index += 8;
		}

		return true;
	}
}
