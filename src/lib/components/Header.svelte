<script lang="ts">
	import { t } from '$lib/stores/language';
	import type { ResearchPhase } from '$lib/types';

	let {
		phase,
		hasMessages,
		onNewChat,
		onToggleSidebar,
		sidebarOpen
	}: {
		phase: ResearchPhase;
		hasMessages: boolean;
		onNewChat: () => void;
		onToggleSidebar?: () => void;
		sidebarOpen?: boolean;
	} = $props();
</script>

<header class="header">
	<!-- Sidebar toggle (hamburger) -->
	{#if onToggleSidebar}
		<button
			class="header-btn"
			onclick={onToggleSidebar}
			onmouseenter={(e) => {
				e.currentTarget.style.background = 'var(--dbx-fill-trans-10)';
				e.currentTarget.style.color = 'var(--dbx-text-secondary)';
			}}
			onmouseleave={(e) => {
				e.currentTarget.style.background = 'transparent';
				e.currentTarget.style.color = 'var(--dbx-text-tertiary)';
			}}
		>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M3 12h18M3 6h18M3 18h18" />
			</svg>
		</button>
	{/if}

	<!-- Current conversation title -->
	<div style="flex: 1; min-width: 0;">
		<h1 class="header-title">
			{$t.appTitle}
		</h1>
	</div>

	<!-- New chat button -->
	{#if hasMessages}
		<button
			class="header-btn"
			onclick={onNewChat}
			onmouseenter={(e) => {
				e.currentTarget.style.background = 'var(--dbx-fill-trans-10)';
				e.currentTarget.style.color = 'var(--dbx-text-secondary)';
			}}
			onmouseleave={(e) => {
				e.currentTarget.style.background = 'transparent';
				e.currentTarget.style.color = 'var(--dbx-text-tertiary)';
			}}
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M12 5v14M5 12h14" />
			</svg>
			{$t.newChatButton}
		</button>
	{/if}
</header>

<style>
	.header {
		height: 56px;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 0 16px;
		border-bottom: 1px solid var(--dbx-line-7);
		background: transparent;
		flex-shrink: 0;
	}
	.header-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 6px 12px;
		border-radius: var(--radius-lg);
		border: none;
		background: transparent;
		color: var(--dbx-text-tertiary);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: background var(--transition-fast), color var(--transition-fast);
		flex-shrink: 0;
	}
	.header-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--dbx-text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
