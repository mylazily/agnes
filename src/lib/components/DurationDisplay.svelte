<script lang="ts">
	import { onMount } from 'svelte';

	let {
		startedAt,
		duration
	}: {
		startedAt: number;
		duration?: number;
	} = $props();

	let elapsedText = $state('0.0s');
	let timerInterval: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		if (duration != null) {
			elapsedText = `${duration.toFixed(1)}s`;
			return;
		}

		if (!startedAt) {
			elapsedText = '';
			return;
		}

		function tick() {
			const elapsed = (Date.now() - startedAt) / 1000;
			elapsedText = `${elapsed.toFixed(1)}s`;
		}

		tick();
		timerInterval = setInterval(tick, 100);

		return () => {
			if (timerInterval) clearInterval(timerInterval);
		};
	});
</script>

<span class="duration-display">
	{elapsedText}
</span>

<style>
	.duration-display {
		font-variant-numeric: tabular-nums;
		font-size: 11px;
		color: var(--dbx-text-quaternary);
	}
</style>
