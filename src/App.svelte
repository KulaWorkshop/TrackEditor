<script lang="ts">
	import { ffmpegHandler } from '$lib/ffmpeg';
	import Interleave from '$lib/components/Interleave.svelte';
	import Durations from '$lib/components/Durations.svelte';
	import { Toaster, toast } from 'svelte-sonner';
	import * as Tabs from '$lib/components/ui/tabs/index.js';

	let ffmpegStatus = $state(false);

	const loadFFmpeg = async () => {
		await ffmpegHandler.load();
	};

	$effect(() => {
		toast.promise(loadFFmpeg, {
			loading: 'Loading FFmpeg...',
			success: () => {
				ffmpegStatus = true;
				return 'FFmpeg loaded.';
			},
			error: (err) => {
				return `Unable to load FFmpeg: ${(err as Error).message}`;
			}
		});
	});
</script>

<Toaster richColors />
<main>
	<div class="mt-20 flex w-full px-4">
		<Tabs.Root class="mx-auto w-full max-w-md" value="interleave">
			<Tabs.List>
				<Tabs.Trigger value="interleave">Interleave</Tabs.Trigger>
				<Tabs.Trigger value="durations">Durations</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="interleave">
				<Interleave bind:ffmpegStatus />
			</Tabs.Content>
			<Tabs.Content value="durations">
				<Durations />
			</Tabs.Content>
		</Tabs.Root>
	</div>
</main>
