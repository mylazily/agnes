<script lang="ts">
	import { t } from '$lib/stores/language';
	import type { SubAgentGroup } from '$lib/types';
	import SubAgentCard from './SubAgentCard.svelte';

	let {
		group
	}: {
		group: SubAgentGroup;
	} = $props();

	let total = $derived(group.tasks.length);
	let completed = $derived(group.tasks.filter((t) => t.status === 'complete').length);
	let percent = $derived(total > 0 ? (completed / total) * 100 : 0);

	let expandedIds = $state(new Set<string>());
	let groupExpanded = $state(true);
	let manuallyToggled = new Set<string>();
	let prevStatusMap = new Map<string, string>();

	// Track task status changes as a derived string key
	let tasksKey = $derived(group.tasks.map((t) => `${t.id}:${t.status}`).join(','));

	$effect(() => {
		// Track tasksKey to trigger re-computation
		const _key = tasksKey;
		const next = new Set(expandedIds);
		let changed = false;

		for (const task of group.tasks) {
			const prevStatus = prevStatusMap.get(task.id);
			const statusChanged = prevStatus !== undefined && prevStatus !== task.status;
			prevStatusMap.set(task.id, task.status);

			if (manuallyToggled.has(task.id)) continue;

			if (task.status === 'running' && (statusChanged || prevStatus === undefined)) {
				if (!next.has(task.id)) {
					next.add(task.id);
					changed = true;
				}
			} else if (task.status === 'complete' && statusChanged) {
				if (next.has(task.id)) {
					next.delete(task.id);
					changed = true;
				}
			}
		}

		if (changed) {
			expandedIds = next;
		}
	});

	function toggleCard(id: string) {
		manuallyToggled.add(id);
		const next = new Set(expandedIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		expandedIds = next;
	}
</script>

<div class="subagent-group">
	<!-- Header -->
	<div
		class="subagent-group-header"
		onclick={() => (groupExpanded = !groupExpanded)}
	>
		<svg
			width="12"
			height="12"
			class="chevron"
			style="transform: rotate({groupExpanded ? 90 : 0}deg);"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width={2.5}
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
		</svg>
		<svg width="14" height="14" style="color: var(--dbx-fill-primary);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={1.5}>
			<path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
		</svg>
		<span class="group-label">
			{$t.specialistAgents}
		</span>
		<span class="group-count">
			{completed}/{total} {$t.completed}
		</span>
	</div>

	<!-- Progress bar -->
	<div class="progress-bar-track">
		<div
			class="progress-bar-fill"
			style="width: {percent}%;"
		></div>
	</div>

	<!-- Cards -->
	{#if groupExpanded}
		<div class="subagent-cards">
			{#each group.tasks as task, idx}
				<SubAgentCard
					{task}
					isOpen={expandedIds.has(task.id)}
					onToggle={() => toggleCard(task.id)}
					index={idx + 1}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.subagent-group {
		border-radius: var(--radius-xl);
		padding: 12px;
		background: var(--dbx-fill-trans-10);
	}
	.subagent-group-header {
		display: flex;
		cursor: pointer;
		align-items: center;
		gap: 8px;
		margin-bottom: 10px;
	}
	.chevron {
		color: var(--dbx-text-quaternary);
		transition: transform 0.2s ease;
	}
	.group-label {
		font-size: 13px;
		font-weight: 500;
		color: var(--dbx-text-secondary);
	}
	.group-count {
		font-size: 12px;
		color: var(--dbx-text-quaternary);
	}
	.progress-bar-track {
		height: 2px;
		width: 100%;
		overflow: hidden;
		border-radius: 1px;
		background: var(--dbx-line-divider-5);
		margin-bottom: 12px;
	}
	.progress-bar-fill {
		height: 100%;
		border-radius: 1px;
		transition: width 0.5s ease-out;
		background: var(--dbx-fill-primary);
	}
	.subagent-cards {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>
