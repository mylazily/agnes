<div class="typing-indicator">
	{#each [0, 1, 2] as i}
		<span
			class="typing-dot"
			style="animation-delay: {i * 0.16}s;"
		></span>
	{/each}
</div>

<style>
	.typing-indicator {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 0;
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
