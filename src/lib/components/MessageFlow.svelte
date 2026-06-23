<script lang="ts">
	import { t } from '$lib/stores/language';
	import type { FlowItem } from '$lib/types';
	import Markdown from './Markdown.svelte';
	import SubAgentCardGroup from './SubAgentCardGroup.svelte';
	import TypingIndicator from './TypingIndicator.svelte';

	let {
		items,
		isStreaming,
		phase
	}: {
		items: FlowItem[];
		isStreaming: boolean;
		phase?: string;
	} = $props();

	let bottomEl: HTMLElement | undefined = $state();
	let scrollContainerEl: HTMLElement | undefined = $state();
	let isAtBottom = $state(true);
	let isProgrammaticScroll = false;

	function checkIsAtBottom() {
		if (isProgrammaticScroll) return;
		const el = scrollContainerEl;
		if (!el) return;
		isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
	}

	$effect(() => {
		// Track items and isStreaming changes
		const _items = items;
		const _streaming = isStreaming;
		if (isAtBottom && bottomEl) {
			isProgrammaticScroll = true;
			bottomEl.scrollIntoView({ behavior: 'instant' });
			requestAnimationFrame(() => {
				isProgrammaticScroll = false;
			});
		}
	});
</script>

<div
	bind:this={scrollContainerEl}
	onscroll={checkIsAtBottom}
	class="message-flow-scroll"
>
	<div class="message-flow-content">
		{#each items as item, idx}
			{#if item.type === 'user_message'}
				<div class="msg-user" style="animation: fadeIn 0.2s ease;">
					<div class="msg-user-content">
						{item.message.content}
					</div>
				</div>

			{:else if item.type === 'ai_message'}
				{@const msg = item.message}

				<!-- Image generation message -->
				{#if msg.multimodalType === 'image'}
					<div class="msg-ai" style="animation: fadeIn 0.2s ease;">
						<div class="msg-ai-inner">
							{#if msg.generationStatus === 'generating'}
								<div class="gen-card">
									<div class="gen-card-status">
										<svg width="16" height="16" style="animation: spin 1s linear infinite;" fill="none" viewBox="0 0 24 24">
											<circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
											<path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
										</svg>
										{$t.imageGenerating}
									</div>
									<div class="gen-skeleton gen-skeleton-square"></div>
								</div>
							{/if}

							{#if msg.generationStatus === 'ready' && msg.imageUrl}
								<div class="gen-card">
									<img src={msg.imageUrl} alt="generated" class="gen-image" />
									<a href={msg.imageUrl} download class="gen-download-btn">
										<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2}>
											<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
										</svg>
										{$t.downloadButton}
									</a>
								</div>
							{/if}

							{#if msg.generationStatus === 'error'}
								<div class="gen-error">
									<svg width="16" height="16" style="flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2}>
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
									</svg>
									{msg.generationError || $t.generationError}
								</div>
							{/if}
						</div>
					</div>

				<!-- Video generation message -->
				{:else if msg.multimodalType === 'video'}
					<div class="msg-ai" style="animation: fadeIn 0.2s ease;">
						<div class="msg-ai-inner">
							{#if msg.generationStatus === 'generating' || msg.generationStatus === 'polling'}
								<div class="gen-card">
									<div class="gen-card-status">
										<svg width="16" height="16" style="animation: spin 1s linear infinite;" fill="none" viewBox="0 0 24 24">
											<circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
											<path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
										</svg>
										{msg.generationStatus === 'generating' ? $t.videoGenerating : $t.videoPollingChat}
									</div>
									<div class="gen-skeleton gen-skeleton-video"></div>
								</div>
							{/if}

							{#if msg.generationStatus === 'ready' && msg.videoUrl}
								<div class="gen-card">
									<video src={msg.videoUrl} controls class="gen-video"></video>
									<a href={msg.videoUrl} download class="gen-download-btn">
										<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2}>
											<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
										</svg>
										{$t.downloadButton}
									</a>
								</div>
							{/if}

							{#if msg.generationStatus === 'error'}
								<div class="gen-error">
									<svg width="16" height="16" style="flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2}>
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
									</svg>
									{msg.generationError || $t.generationError}
								</div>
							{/if}
						</div>
					</div>

				<!-- Stopped message -->
				{:else if msg.content === '__STOPPED__'}
					<div class="msg-stopped" style="animation: fadeIn 0.2s ease;">
						<svg width="16" height="16" style="color: var(--dbx-text-quaternary); flex-shrink: 0;" fill="currentColor" viewBox="0 0 24 24">
							<rect x="6" y="6" width="12" height="12" rx="2" />
						</svg>
						{$t.researchStopped}
					</div>

				<!-- Normal text message -->
				{:else}
					<div class="msg-ai" style="animation: fadeIn 0.2s ease;">
						<div class="msg-ai-inner">
							<div class="msg-bot-color">
								{#if msg.content}
									<Markdown content={msg.content} />
									{#if isStreaming && idx === items.length - 1 && !msg.hasSubAgents}
										<span class="streaming-cursor"></span>
									{/if}
								{:else}
									<TypingIndicator />
								{/if}
							</div>
						</div>
					</div>
				{/if}

			{:else if item.type === 'subagent_group'}
				<div style="animation: slideUp 0.3s ease;">
					<SubAgentCardGroup group={item.group} />
				</div>

			{:else if item.type === 'synthesizing'}
				<div class="msg-synthesizing" style="animation: fadeIn 0.2s ease;">
					<svg width="16" height="16" style="color: var(--dbx-function-warning); animation: spin 1s linear infinite;" fill="none" viewBox="0 0 24 24">
						<circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
						<path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
					</svg>
					{$t.synthesizingResults}
				</div>

			{:else if item.type === 'typing'}
				<div class="msg-typing">
					<TypingIndicator />
				</div>
			{/if}
		{/each}

		<!-- Thinking indicator: shown when streaming but no AI response yet -->
		{#if isStreaming && items.length > 0 && items[items.length - 1].type === 'user_message'}
			<div class="msg-ai" style="animation: fadeIn 0.2s ease;">
				<div class="msg-bot-color">
					<TypingIndicator />
				</div>
			</div>
		{/if}

		<!-- Synthesizing indicator -->
		{#if isStreaming && phase === 'synthesizing' && items.length > 0 && items[items.length - 1].type !== 'ai_message'}
			<div class="msg-ai" style="animation: fadeIn 0.2s ease;">
				<div class="msg-bot-color">
					<TypingIndicator />
				</div>
			</div>
		{/if}

		{#if bottomEl}
			<div bind:this={bottomEl}></div>
		{/if}
	</div>
</div>

<style>
	.message-flow-scroll {
		flex: 1;
		overflow-y: auto;
	}
	.message-flow-content {
		max-width: 680px;
		margin: 0 auto;
		padding: 24px 16px;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.msg-user {
		display: flex;
		justify-content: flex-end;
	}
	.msg-user-content {
		max-width: 80%;
		font-size: 16px;
		line-height: 1.6;
		color: var(--user-msg-color);
		text-align: right;
		word-break: break-word;
	}
	.msg-ai {
		display: flex;
		justify-content: flex-start;
	}
	.msg-ai-inner {
		max-width: 90%;
	}
	.msg-bot-color {
		color: var(--bot-msg-color);
	}
	.msg-stopped {
		display: flex;
		align-items: center;
		gap: 10px;
		border-radius: var(--radius-xl);
		padding: 10px 16px;
		font-size: 13px;
		background: var(--dbx-fill-trans-10);
		color: var(--dbx-text-tertiary);
	}
	.msg-synthesizing {
		display: flex;
		align-items: center;
		gap: 10px;
		border-radius: var(--radius-xl);
		padding: 10px 16px;
		font-size: 13px;
		background: rgba(255, 149, 0, 0.06);
		color: var(--dbx-function-warning);
	}
	.msg-typing {
		display: flex;
		justify-content: flex-start;
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
	.gen-card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 20px;
		background: var(--dbx-bg-surface);
		border: 1px solid var(--dbx-line-7);
		border-radius: var(--radius-2xl);
	}
	.gen-card-status {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 13px;
		color: var(--dbx-text-tertiary);
	}
	.gen-skeleton {
		width: 100%;
		border-radius: var(--radius-xl);
		background: var(--dbx-fill-trans-10);
		animation: pulse 2s ease-in-out infinite;
	}
	.gen-skeleton-square {
		aspect-ratio: 1/1;
		max-width: 400px;
	}
	.gen-skeleton-video {
		aspect-ratio: 16/9;
		max-width: 480px;
	}
	.gen-image {
		width: 100%;
		max-width: 400px;
		border-radius: var(--radius-xl);
		object-fit: contain;
	}
	.gen-video {
		width: 100%;
		max-width: 480px;
		border-radius: var(--radius-xl);
	}
	.gen-download-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		cursor: pointer;
		padding: 8px 16px;
		font-size: 12px;
		font-weight: 600;
		border-radius: var(--radius-xl);
		background: var(--dbx-text-primary);
		color: var(--dbx-bg-surface);
		text-decoration: none;
		transition: opacity 0.15s ease;
		width: fit-content;
	}
	.gen-error {
		display: flex;
		align-items: center;
		gap: 10px;
		border-radius: var(--radius-lg);
		border: 1px solid rgba(255, 59, 48, 0.15);
		background: rgba(255, 59, 48, 0.06);
		padding: 10px 16px;
		font-size: 13px;
		color: var(--dbx-function-danger);
	}
</style>
