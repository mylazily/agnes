<script lang="ts">
	import { t } from '$lib/stores/language';
	import { onMount } from 'svelte';

	let {
		onSend,
		onStop,
		isStreaming
	}: {
		onSend: (text: string) => void;
		onStop: () => void;
		isStreaming: boolean;
	} = $props();

	let value = $state('');
	let textareaEl: HTMLTextAreaElement | undefined = $state();

	// Auto-resize textarea
	$effect(() => {
		// Track value changes
		const _ = value;
		if (textareaEl) {
			textareaEl.style.height = 'auto';
			textareaEl.style.height = Math.min(textareaEl.scrollHeight, 200) + 'px';
		}
	});

	function handleSubmit(e?: Event) {
		if (e) e.preventDefault();
		const trimmed = value.trim();
		if (!trimmed) return;
		onSend(trimmed);
		value = '';
		if (textareaEl) {
			textareaEl.style.height = 'auto';
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey && !(e as KeyboardEvent & { isComposing?: boolean }).isComposing) {
			e.preventDefault();
			handleSubmit();
		}
	}
</script>

<div class="chat-input-container">
	<form onsubmit={handleSubmit} class="chat-input-form">
		<div class="chat-input-wrapper">
			<!-- Textarea -->
			<textarea
				bind:this={textareaEl}
				bind:value
				onkeydown={handleKeyDown}
				placeholder={$t.inputPlaceholder}
				disabled={isStreaming}
				rows={1}
				class="chat-textarea"
			></textarea>

			<!-- Action button (inside textarea, right side) -->
			<div class="chat-action-btn-container">
				{#if isStreaming}
					<button
						type="button"
						onclick={onStop}
						class="chat-action-btn chat-action-btn-stop"
						onmouseenter={(e) => (e.currentTarget.style.opacity = '0.8')}
						onmouseleave={(e) => (e.currentTarget.style.opacity = '1')}
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
							<rect x="6" y="6" width="12" height="12" rx="2" />
						</svg>
					</button>
				{:else}
					<button
						type="submit"
						disabled={!value.trim()}
						class="chat-action-btn {value.trim() ? 'chat-action-btn-active' : 'chat-action-btn-inactive'}"
					>
						<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2}>
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
						</svg>
					</button>
				{/if}
			</div>

			<!-- Bottom toolbar -->
			<div class="chat-toolbar">
				<!-- Left: attach button -->
				<div style="display: flex; align-items: center; gap: 4px;">
					<button
						type="button"
						class="chat-attach-btn"
						onmouseenter={(e) => (e.currentTarget.style.color = 'var(--dbx-text-tertiary)')}
						onmouseleave={(e) => (e.currentTarget.style.color = 'var(--dbx-text-quaternary)')}
						title={$t.attachFile}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
						</svg>
					</button>
				</div>

				<!-- Right: hint text -->
				<span class="chat-hint">
					Enter {$t.sendButton}, Shift + Enter
				</span>
			</div>
		</div>
	</form>
</div>

<style>
	.chat-input-container {
		padding: 12px 16px 16px;
		flex-shrink: 0;
	}
	.chat-input-form {
		max-width: 680px;
		margin: 0 auto;
		width: 100%;
	}
	.chat-textarea {
		width: 100%;
		padding: 12px 52px 12px 16px;
		font-size: 14px;
		line-height: 1.5;
		color: var(--dbx-text-primary);
		background: transparent;
		border: none;
		outline: none;
		resize: none;
		font-family: var(--font-sans);
		min-height: 44px;
		max-height: 200px;
	}
	.chat-action-btn-container {
		position: absolute;
		right: 8px;
		bottom: 6px;
		display: flex;
		align-items: center;
	}
	.chat-action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		border: none;
		cursor: pointer;
		transition: all var(--transition-fast);
	}
	.chat-action-btn-stop {
		background: var(--dbx-text-primary);
		color: var(--dbx-bg-surface);
	}
	.chat-action-btn-active {
		background: var(--dbx-text-primary);
		color: var(--dbx-bg-surface);
		cursor: pointer;
	}
	.chat-action-btn-inactive {
		background: var(--dbx-neutral-200);
		color: var(--dbx-text-quaternary);
		cursor: default;
	}
	.chat-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 4px 12px 8px;
	}
	.chat-attach-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: var(--radius-sm);
		border: none;
		background: transparent;
		color: var(--dbx-text-quaternary);
		cursor: pointer;
		transition: color var(--transition-fast);
	}
	.chat-hint {
		font-size: 11px;
		color: var(--dbx-text-quaternary);
	}
</style>
