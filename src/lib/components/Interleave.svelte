<script lang="ts">
	import { Button } from '$lib/components/ui/button/';
	import { Input } from '$lib/components/ui/input/';
	import { Label } from '$lib/components/ui/label/';
	import { ffmpegHandler } from '$lib/ffmpeg';
	import { XAEncoder, type InterleaveParam } from '$lib/xa';
	import { toast } from 'svelte-sonner';
	import { getDateTime, downloadFile } from '../utils/fs';

	let { ffmpegStatus = $bindable() } = $props();

	const files = new Map<number, File>();
	const encoder = new XAEncoder(4);
	let trackCount = $state(4);
	let tracksLoaded = $state(0);
	let interleaveStatus = $state(false);

	const onFileChange = async (e: Event, index: number) => {
		const file = (e.target as HTMLInputElement).files![0];
		files.set(index, file);
		tracksLoaded = files.size;
	};

	const interleave = async () => {
		// debug
		if (files.size === 1) {
			const file = files.get(0)!;
			files.set(1, file);
			files.set(2, file);
			files.set(3, file);
		}

		if (files.size !== 4) {
			return;
		}

		interleaveStatus = true;
		const buffers: Int16Array[] = [];
		for (let i = 0; i < 4; i++) {
			try {
				const file = files.get(i)!;
				const buffer = await ffmpegHandler.encode(file, i);
				buffers.push(buffer);
			} catch {
				interleaveStatus = false;
				throw new Error(`Invalid or unsupported audio file uploaded for track ${i + 1}.`);
			}
		}

		const encoded = await Promise.all(
			buffers.map(async (buffer, i) => {
				return await encoder.run({
					pcm: buffer,
					bitDepth: 4,
					channels: 2,
					frequency: 37800
				});
			})
		);

		const params: InterleaveParam[] = [];
		for (let i = 0; i < 4; i++) {
			params.push({
				buffer: encoded[i],
				channel: i,
				fileNumber: 1,
				position: 0
			});
		}

		const interleaved = XAEncoder.interleave(params);
		downloadFile(interleaved, `Interleaved-${getDateTime()}.XA`);
		interleaveStatus = false;
	};
</script>

<div class="title prose">
	<h1>XA Interleaver</h1>
	<p>This tool allows you to bundle multiple music files into a single XA file.</p>
</div>
<div class="prose mt-8">
	{#each { length: trackCount } as _, i}
		{@const index = i + 1}
		<div class="mb-6 grid w-full max-w-sm items-center gap-1.5">
			<Label for="track-{index}">Track {index}</Label>
			<Input id="track-{index}" type="file" onchange={(e) => onFileChange(e, i)} />
		</div>
	{/each}
</div>
{#if interleaveStatus}
	<Button disabled>Interleaving...</Button>
{:else if ffmpegStatus === true}
	<Button
		disabled={tracksLoaded !== 4}
		onclick={() => {
			toast.promise(interleave, {
				loading: 'Interleaving tracks...',
				success: () => {
					ffmpegStatus = true;
					return 'Successfully interleaved tracks.';
				},
				error: (err) => {
					return `${(err as Error).message}`;
				}
			});
		}}>Interleave</Button
	>
{:else}
	<Button disabled>Loading FFmpeg...</Button>
{/if}
