<script lang="ts">
	import { t, locale, toggleLocale } from '$lib/stores/language';
	import {
		sendMessage,
		resetChat,
		getStoredConversations,
		removeConversationFromStorage,
		loadConversation
	} from '$lib/stores/chat';
	import type { StoredConversation } from '$lib/stores/chat';
	import ChatInterface from './ChatInterface.svelte';

	let sidebarOpen = $state(false);

	let storedConversations: StoredConversation[] = $state(getStoredConversations());

	function handleNewChat() {
		resetChat();
		storedConversations = getStoredConversations();
	}

	function handleRemoveConversation(id: string) {
		removeConversationFromStorage(id);
		storedConversations = getStoredConversations();
	}

	function handleLoadConversation(id: string) {
		loadConversation(id);
		sidebarOpen = false;
	}
</script>

<div style="display: flex; height: 100vh; width: 100vw; overflow: hidden;">
	<!-- Sidebar overlay for mobile -->
	{#if sidebarOpen}
		<div class="sidebar-overlay" onclick={() => (sidebarOpen = false)} role="presentation"></div>
	{/if}

	<!-- Sidebar -->
	<aside class="sidebar {sidebarOpen ? '' : 'collapsed'}">
		<div class="sidebar-header">
			<button class="sidebar-new-chat-btn" onclick={handleNewChat}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 5v14M5 12h14" />
				</svg>
				{$locale === 'zh' ? '新对话' : 'New Chat'}
			</button>
		</div>

		<div class="sidebar-history">
			<div class="sidebar-section-label">{$locale === 'zh' ? '对话历史' : 'Chat History'}</div>
			{#if storedConversations.length > 0}
				{#each storedConversations as conv}
					<button
						class="sidebar-history-item"
						onclick={() => handleLoadConversation(conv.id)}
					>
						<span class="sidebar-history-item-title">{conv.title}</span>
						<span
							class="sidebar-history-item-delete"
							onclick={(e) => { e.stopPropagation(); handleRemoveConversation(conv.id); }}
							role="button"
							tabindex="0"
						>
							<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</span>
					</button>
				{/each}
			{:else}
				<div style="padding: 8px 12px; color: var(--dbx-text-quaternary); font-size: 12px;">
					{$locale === 'zh' ? '暂无对话' : 'No conversations yet'}
				</div>
			{/if}
		</div>

		<!-- Sidebar footer with language toggle -->
		<div style="padding: 12px 16px; border-top: 1px solid var(--dbx-line-7);">
			<button
				onclick={toggleLocale}
				class="sidebar-lang-btn"
				onmouseenter={(e) => (e.currentTarget.style.background = 'var(--dbx-fill-trans-10)')}
				onmouseleave={(e) => (e.currentTarget.style.background = 'transparent')}
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10" />
					<path d="M2 12h20" />
					<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
				</svg>
				{$locale === 'en' ? '中文' : 'English'}
			</button>
		</div>
	</aside>

	<!-- Main content -->
	<main style="flex: 1; display: flex; flex-direction: column; min-width: 0; background: var(--dbx-bg-body);">
		<ChatInterface
			onToggleSidebar={() => (sidebarOpen = !sidebarOpen)}
			{sidebarOpen}
		/>
	</main>
</div>

<style>
	.sidebar-lang-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		border-radius: var(--radius-lg);
		border: none;
		background: transparent;
		color: var(--dbx-text-tertiary);
		font-size: 12px;
		cursor: pointer;
		width: 100%;
		transition: background var(--transition-fast);
	}
</style>
