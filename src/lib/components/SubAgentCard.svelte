<script lang="ts">
	import { t } from '$lib/stores/language';
	import type { SubAgentTask } from '$lib/types';
	import StatusBadge from './StatusBadge.svelte';
	import DurationDisplay from './DurationDisplay.svelte';
	import Markdown from './Markdown.svelte';

	let {
		task,
		isOpen,
		onToggle,
		index
	}: {
		task: SubAgentTask;
		isOpen: boolean;
		onToggle: () => void;
		index: number;
	} = $props();

	let contentEl: HTMLElement | undefined = $state();
	let isAtBottom = true;
	let isProgrammaticScroll = false;

	function checkIsAtBottom() {
		if (isProgrammaticScroll) return;
		const el = contentEl;
		if (!el) return;
		isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
	}

	$effect(() => {
		const _content = task.content;
		const _status = task.status;
		const _isOpen = isOpen;
		if (task.status === 'running' && isOpen && contentEl && isAtBottom) {
			isProgrammaticScroll = true;
			contentEl.scrollTop = contentEl.scrollHeight;
			requestAnimationFrame(() => {
				isProgrammaticScroll = false;
			});
		}
	});

	function resolveDescription(desc: string): string {
		if (desc === '__PENDING__') return $t.taskPending;
		if (desc === '__SUMMARIZING__') return $t.taskSummarizing;
		if (!desc) return `${task.subagentType || 'researcher'} agent`;
		return stripMarkdown(desc);
	}

	/** Strip common Markdown syntax for clean plain-text display. */
	function stripMarkdown(text: string): string {
		return text
			.replace(/\*\*(.+?)\*\*/g, '$1')
			.replace(/\*(.+?)\*/g, '$1')
			.replace(/#{1,6}\s+/g, '')
			.replace(/`(.+?)`/g, '$1')
			.replace(/!\[.*?\]\(.*?\)/g, '')
			.replace(/\[(.+?)\]\(.*?\)/g, '$1')
			.trim();
	}

	const borderColorMap: Record<string, string> = {
		pending: 'var(--dbx-line-7)',
		running: 'var(--dbx-line-7)',
		complete: 'var(--dbx-line-highlight)',
		error: 'rgba(255,59,48,0.2)',
		cancelled: 'var(--dbx-line-divider-5)'
	};

	let borderColor = $derived(borderColorMap[task.status] || 'var(--dbx-line-7)');
</script>

<div
	class="subagent-card"
	style="border-color: {borderColor};"
>
	<!-- Card Header -->
	<button
		class="subagent-card-header"
		onclick={onToggle}
		onmouseenter={(e) => (e.currentTarget.style.background = 'var(--dbx-fill-trans-10)')}
		onmouseleave={(e) => (e.currentTarget.style.background = 'transparent')}
	>
		<svg
			width="12"
			height="12"
			class="chevron"
			style="transform: rotate({isOpen ? 90 : 0}deg);"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width={2.5}
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
		</svg>

		<span class="card-index">
			{index}
		</span>

		<!-- Phase-based icon -->
		{#if task.description === '__PENDING__'}
			<span class="spinner"></span>
		{:else if task.description === '__SUMMARIZING__'}
			<svg width="14" height="14" style="color: var(--dbx-fill-primary); flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={1.5}>
				<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
			</svg>
		{:else if task.status === 'complete'}
			<svg width="14" height="14" style="color: var(--dbx-fill-primary); flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2}>
				<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
			</svg>
		{:else}
			<svg width="14" height="14" style="color: var(--dbx-text-quaternary); flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={1.5}>
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
			</svg>
		{/if}

		<span class="card-title" title={resolveDescription(task.description)}>
			{resolveDescription(task.description)}
		</span>

		<DurationDisplay startedAt={task.startedAt} duration={task.duration} />
		<StatusBadge status={task.status} />
	</button>

	<!-- Collapsible content -->
	{#if isOpen}
		<div class="subagent-card-content-wrapper">
			<!-- Tool calls -->
			{#if task.toolCalls.length > 0}
				<ul class="tool-calls-list">
					{#each task.toolCalls as tc}
						<li
							class="tool-call-item"
							onmouseenter={(e) => (e.currentTarget.style.background = 'var(--dbx-fill-trans-10)')}
							onmouseleave={(e) => (e.currentTarget.style.background = 'var(--dbx-bg-surface)')}
						>
							<span class="tool-call-icon">
								{#if tc.status === 'pending'}
									<span class="spinner-sm"></span>
								{:else if tc.status === 'completed'}
									<svg width="14" height="14" style="color: var(--dbx-fill-primary);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2.5}>
										<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
									</svg>
								{:else}
									<svg width="14" height="14" style="color: var(--dbx-function-danger);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2.5}>
										<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
									</svg>
								{/if}
							</span>

							<span class="tool-call-name">
								{tc.name}
							</span>

							{#if tc.argSummary}
								<span class="tool-call-args" title={tc.argSummary}>
									{tc.argSummary}
								</span>
							{:else}
								<span style="min-width: 0; flex: 1;"></span>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}

			<!-- Content -->
			<div
				bind:this={contentEl}
				onscroll={checkIsAtBottom}
				class="subagent-card-content"
			>
				{#if task.content}
					<Markdown content={task.content} />
					{#if task.status === 'running'}
						<span class="streaming-cursor"></span>
					{/if}
				{:else}
					<div class="subagent-empty-content">
						{#if task.status === 'running' || task.status === 'pending'}
							<span style="display: flex; gap: 4px;">
								{#each [0, 1, 2] as i}
									<span
										class="typing-dot"
										style="animation-delay: {i * 0.16}s;"
									></span>
								{/each}
							</span>
						{:else if task.status === 'cancelled'}
							<span style="font-size: 12px; color: var(--dbx-text-quaternary);">{$t.taskCancelled}</span>
						{:else}
							<span style="font-size: 12px;">{$t.noContentYet}</span>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.subagent-card {
		border-radius: var(--radius-xl);
		overflow: hidden;
		transition: all 0.2s ease;
		border: 1px solid;
		background: var(--dbx-bg-surface);
	}
	.subagent-card-header {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		text-align: left;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background 0.15s ease;
		color: inherit;
	}
	.chevron {
		color: var(--dbx-text-quaternary);
		flex-shrink: 0;
		transition: transform 0.2s ease;
	}
	.card-index {
		display: flex;
		width: 20px;
		height: 20px;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		background: var(--dbx-bg-elevated);
		color: var(--dbx-text-quaternary);
		font-size: 10px;
		font-weight: 600;
	}
	.card-title {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 13px;
		font-weight: 500;
		color: var(--dbx-text-secondary);
	}
	.spinner {
		display: inline-block;
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		border-radius: 50%;
		border: 1.5px solid var(--dbx-line-7);
		border-top-color: var(--dbx-fill-primary);
		animation: spin 1s linear infinite;
	}
	.spinner-sm {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1.5px solid var(--dbx-line-7);
		border-top-color: var(--dbx-fill-primary);
		animation: spin 1s linear infinite;
	}
	.subagent-card-content-wrapper {
		border-top: 1px solid var(--dbx-line-divider-5);
	}
	.tool-calls-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 8px 12px;
		max-height: 88px;
		overflow-y: auto;
		overscroll-behavior: contain;
		border-bottom: 1px solid var(--dbx-line-divider-5);
		margin: 0;
		list-style: none;
	}
	.tool-call-item {
		display: flex;
		align-items: center;
		gap: 8px;
		border-radius: var(--radius-lg);
		border: 1px solid var(--dbx-line-divider-5);
		padding: 6px 10px;
		font-size: 12px;
		background: var(--dbx-bg-surface);
		transition: background 0.15s ease;
	}
	.tool-call-icon {
		display: flex;
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
	}
	.tool-call-name {
		flex-shrink: 0;
		border-radius: var(--radius-sm);
		padding: 2px 6px;
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 500;
		background: var(--dbx-bg-elevated);
		color: var(--dbx-text-tertiary);
	}
	.tool-call-args {
		min-width: 0;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--dbx-text-quaternary);
	}
	.subagent-card-content {
		max-height: 256px;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 12px 16px;
		font-size: 13px;
		line-height: 1.6;
		color: var(--dbx-text-secondary);
	}
	.subagent-empty-content {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 0;
		color: var(--dbx-text-quaternary);
	}
	.streaming-cursor {
		display: inline-block;
		width: 2px;
		height: 16px;
		margin-left: 2px;
		vertical-align: middle;
		background: var(--dbx-fill-primary);
		animation: pulse 1.5s infinite;
	}
	.typing-dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--dbx-fill-primary);
		animation: bounce 1.4s infinite ease-in-out both;
	}
</style>
