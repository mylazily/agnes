<script lang="ts">
	import { t } from '$lib/stores/language';

	let {
		onSelect
	}: {
		onSelect: (question: string) => void;
		onLoadConversation?: (id: string) => void;
		storedConversations?: Array<{ id: string; title: string; timestamp: number }>;
		onRemoveConversation?: (id: string) => void;
	} = $props();
</script>

<div class="welcome-screen">
	<!-- Title -->
	<h2 class="welcome-title">
		{$t.welcomeTitle}
	</h2>

	<!-- Suggestion cards grid -->
	<div class="suggestion-grid">
		{#each $t.presetQuestions as q, i}
			<button
				class="suggestion-card"
				onclick={() => onSelect(q)}
				style="animation: slideUp 0.3s ease {i * 0.06}s both;"
			>
				{q}
			</button>
		{/each}
	</div>
</div>

<style>
	.welcome-screen {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow-y: auto;
		padding: 12vh 16px 32px;
		max-width: 680px;
		margin: 0 auto;
		width: 100%;
	}
	.welcome-title {
		font-size: 28px;
		font-weight: 600;
		color: var(--dbx-text-primary);
		margin-bottom: 32px;
		text-align: center;
		animation: fadeIn 0.4s ease;
	}
	.suggestion-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
		width: 100%;
		max-width: 560px;
	}
</style>
