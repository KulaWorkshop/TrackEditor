<script lang="ts">
	import { Button } from '$lib/components/ui/button/';
	import { Input } from '$lib/components/ui/input/';
	import { Label } from '$lib/components/ui/label/';
	import * as Select from '$lib/components/ui/select/';
	import { kEXE } from '$lib/exe';
	import { toast } from 'svelte-sonner';
	import { downloadFile } from '../utils/fs';

	const trackMap: { [key: string]: number[] } = {
		'0': [2, 2, 2, 2],
		'1': [0, 3, 11, 12],
		'2': [8, 1, 5, 6],
		'3': [10, 9, 4, 7]
	};
	let selectedTrackList = $state(0);
	let tracks: number[] | undefined = $state(undefined);
	let exe: kEXE | null = null;
	let filename = 'Untitled';

	const onFileChange = async (e: Event) => {
		const file = (e.target as HTMLInputElement).files![0];
		if (!file) {
			exe = null;
			tracks = undefined;
			return;
		}

		filename = file.name;
		const buffer = await file.arrayBuffer();
		exe = kEXE.fromBuffer(buffer);
		if (exe === null) {
			toast.error('Unsupported executable file.');
			return;
		}

		const trackData = exe.getTrackData();
		tracks = trackData.map((v) => Math.round((v * 4) / 75));
	};

	const patch = async () => {
		if (exe === null || tracks === undefined) {
			return;
		}

		// update track data
		const trackData = tracks.map((l) => Math.round((l * 75) / 4));
		exe.setTrackData(trackData);

		// download file
		downloadFile(exe.buffer, filename);
		toast.success('Successfully patched executable file.');
	};

	const convertSeconds = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	const onDurationChange = (value: string, index: number) => {
		let totalSeconds = 0;
		if (value.includes(':')) {
			const minutes = parseInt(value.split(':')[0]);
			const secs = parseInt(value.split(':')[1]);
			totalSeconds = minutes * 60 + secs;
		} else {
			totalSeconds = parseInt(value);
		}

		tracks![trackMap[selectedTrackList][index]] = totalSeconds;
	};
</script>

<div class="title prose">
	<h1>Track Durations</h1>
	<p>Modify each track's duration from an executable.</p>
</div>
<div class="prose mt-8">
	<div class="mb-6 grid w-full max-w-sm items-center gap-1.5">
		<Label for="exe-file">Executable File</Label>
		<Input id="exe-file" type="file" onchange={(e) => onFileChange(e)} />
		<span class="text-xs font-semibold text-neutral-400"
			>SCES-010.00, SLUS-007.24, SCPS-100.64, KULA.EXE, etc.</span
		>
	</div>
	{#if tracks !== undefined}
		<div class="mb-6 grid w-full max-w-sm items-center gap-1.5">
			<Label>Trackset File</Label>
			<Select.Root type="single" onValueChange={(x) => (selectedTrackList = parseInt(x))}>
				<Select.Trigger class="w-[180px] font-semibold"
					>{`MUSIC_${selectedTrackList}.XA`}</Select.Trigger
				>
				<Select.Content>
					<Select.Item value="0">MUSIC_0.XA</Select.Item>
					<Select.Item value="1">MUSIC_1.XA</Select.Item>
					<Select.Item value="2">MUSIC_2.XA</Select.Item>
					<Select.Item value="3">MUSIC_3.XA</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		{#each { length: 4 } as _, i}
			{@const index = i + 1}
			{@const duration = tracks[trackMap[selectedTrackList][i]]}
			<div class="mb-6 grid w-full max-w-sm items-center gap-1.5">
				<Label for="track-{index}">Track {index}</Label>
				<Input
					id="track-{index}"
					type="text"
					value={convertSeconds(duration)}
					onchange={(e) =>
						onDurationChange((e.target as HTMLInputElement).value as string, i)}
				/>
			</div>
		{/each}
		<Button onclick={patch}>Patch</Button>
	{/if}
</div>
