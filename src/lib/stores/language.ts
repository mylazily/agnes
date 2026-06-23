import { writable, derived } from 'svelte/store';
import type { Locale, Translations } from '../../i18n/types';
import { en, zh } from '../../i18n';

const translations: Record<Locale, Translations> = { en, zh };

function detectLocale(): Locale {
	if (typeof navigator === 'undefined') return 'en';
	const lang = navigator.language || '';
	return lang.startsWith('zh') ? 'zh' : 'en';
}

export const locale = writable<Locale>(detectLocale());

export const t = derived(locale, ($locale) => translations[$locale]);

export function toggleLocale() {
	locale.update((v) => (v === 'en' ? 'zh' : 'en'));
}
