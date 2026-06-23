<script lang="ts">
	import { t } from '$lib/stores/language';
	import type { SubAgentStatus } from '$lib/types';

	let {
		status
	}: {
		status: SubAgentStatus;
	} = $props();

	const statusLabels: Record<SubAgentStatus, string> = {
		pending: 'pending',
		running: 'running',
		complete: 'complete',
		error: 'error',
		cancelled: 'cancelled'
	};

	const statusColors: Record<SubAgentStatus, string> = {
		pending: 'var(--dbx-text-quaternary)',
		running: 'var(--dbx-fill-primary)',
		complete: 'var(--dbx-function-success)',
		error: 'var(--dbx-function-danger)',
		cancelled: 'var(--dbx-text-tertiary)'
	};

	let color = $derived(statusColors[status]);
	let label = $derived(statusLabels[status]);
	let pulse = $derived(status === 'running');
</script>

<span
	class="status-badge"
	style="color: {color}; {pulse ? 'animation: pulse 2s infinite;' : ''}"
>
	{#if status === 'pending'}
		<svg width="10" height="10" fill="currentColor" viewBox="0 0 8 8">
			<circle cx="4" cy="4" r="3" fill="none" stroke="currentColor" stroke-width="1.5" />
		</svg>
	{:else if status === 'running'}
		<svg width="10" height="10" fill="currentColor" viewBox="0 0 8 8">
			<circle cx="4" cy="4" r="3" />
		</svg>
	{:else if status === 'complete'}
		<svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={3}>
			<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
		</svg>
	{:else if status === 'error'}
		<svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={3}>
			<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
		</svg>
	{:else}
		<svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={3}>
			<path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
		</svg>
	{/if}
	{label}
</span>

<style>
	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		border-radius: var(--radius-sm);
		padding: 2px 8px;
		font-size: 11px;
		font-weight: 500;
		background: var(--dbx-fill-trans-10);
	}
</style>
