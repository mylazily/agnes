<script lang="ts">
	import { t } from '$lib/stores/language';
	import { messages, phase, isStreaming, isLoadingHistory, loadError, dismissLoadError, sendMessage, stopStreaming, resetChat, flowItems, loadConversation, getStoredConversations, removeConversationFromStorage } from '$lib/stores/chat';
	import Header from '$lib/components/Header.svelte';
	import WelcomeScreen from '$lib/components/WelcomeScreen.svelte';
	import MessageFlow from '$lib/components/MessageFlow.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import { onMount } from 'svelte';
	import { autoRestore } from '$lib/stores/chat';

	let { onToggleSidebar, sidebarOpen }: { onToggleSidebar: () => void; sidebarOpen: boolean } = $props();

	let loadErrorTimer: ReturnType<typeof setTimeout> | null = null;

	// Auto-restore conversation on mount
	onMount(() => {
		autoRestore();
	});

	// Auto-dismiss load error after 3s
	$effect(() => {
		if ($loadError) {
			loadErrorTimer = setTimeout(() => dismissLoadError(), 3000);
			return () => {
				if (loadErrorTimer) clearTimeout(loadErrorTimer);
			};
		}
	});

	let loadErrorText = $derived(
		$loadError
			? $loadError === 'empty'
				? $t.loadHistoryEmpty
				: `${$t.loadHistoryFailed}: ${$loadError}`
			: null
	);

	let hasMessages = $derived($messages.length > 0);

	function handleSend(text: string) {
		if ($isStreaming) return;
		sendMessage(text);
	}

	function handleStop() {
		if ($isStreaming) {
			stopStreaming();
		}
	}

	function handleResetChat() {
		resetChat();
	}

	function handleRemoveConversation(id: string) {
		removeConversationFromStorage(id);
	}
</script>

<div style="display: flex; flex-direction: column; height: 100%; background: var(--dbx-bg-body);">
	<Header
		phase={$phase}
		{hasMessages}
		onNewChat={handleResetChat}
		onToggleSidebar={onToggleSidebar}
		{sidebarOpen}
	/>

	<!-- Floating error toast -->
	{#if loadErrorText}
		<div style="position: absolute; top: 64; left: 0; right: 0; display: flex; justify-content: center; z-index: 50;">
			<div class="error-toast">
				<svg width="16" height="16" style="color: var(--dbx-function-danger); flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2}>
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
				<span style="font-size: 13; color: var(--dbx-function-danger);">{loadErrorText}</span>
				<button
					onclick={dismissLoadError}
					class="error-toast-close"
				>
					<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width={2}>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	{/if}

	<div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
		{#if $isLoadingHistory}
			<div style="flex: 1; display: flex; align-items: center; justify-content: center;">
				<div style="display: flex; align-items: center; gap: 10; font-size: 13; color: var(--dbx-text-tertiary);">
					<svg width="16" height="16" style="animation: spin 1s linear infinite;" fill="none" viewBox="0 0 24 24">
						<circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
						<path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
					</svg>
					{$t.loadingHistory}
				</div>
			</div>
		{:else if hasMessages}
			<MessageFlow items={$flowItems} isStreaming={$isStreaming} phase={$phase} />
		{:else}
			<WelcomeScreen
				onSelect={handleSend}
				onLoadConversation={loadConversation}
				storedConversations={getStoredConversations()}
				onRemoveConversation={handleRemoveConversation}
			/>
		{/if}

		<ChatInput
			onSend={handleSend}
			onStop={handleStop}
			isStreaming={$isStreaming}
		/>
	</div>
</div>

<style>
	.error-toast {
		display: flex;
		align-items: center;
		gap: 10px;
		border-radius: var(--radius-lg);
		border: 1px solid rgba(255, 59, 48, 0.15);
		background: rgba(255, 59, 48, 0.06);
		padding: 10px 16px;
		box-shadow: var(--shadow-md);
		animation: fade-in-up 0.3s ease;
	}
	.error-toast-close {
		cursor: pointer;
		margin-left: 4px;
		border-radius: var(--radius-xs);
		padding: 2px;
		background: transparent;
		border: none;
		color: rgba(255, 59, 48, 0.4);
	}
</style>
