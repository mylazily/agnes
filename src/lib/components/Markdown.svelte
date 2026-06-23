<script lang="ts">
	import { onMount } from 'svelte';
	import { marked } from 'marked';

	let {
		content,
		className = ''
	}: {
		content: string;
		className?: string;
	} = $props();

	/**
	 * Normalize streaming markdown:
	 * - Ensure headings always start on a new line
	 * - Collapse excessive blank lines
	 */
	function normalizeMarkdown(raw: string): string {
		return raw
			.replace(/([^\n])(\n?)(#{1,6}\s)/g, '$1\n\n$3')
			.replace(/\n{3,}/g, '\n\n');
	}

	let renderedHtml = $derived.by(() => {
		const normalized = normalizeMarkdown(content);
		return marked(normalized, { breaks: true, gfm: true }) as string;
	});
</script>

<div class="markdown-content {className}">
	{@html renderedHtml}
</div>
