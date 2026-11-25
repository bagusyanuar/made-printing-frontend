import type { Component } from 'svelte';

export interface CommandPaletteItem {
	id: string;
	title: string;
	group: string;
	subtitle?: string;
	keywords?: string[];
	icon?: Component;
	shortcut?: string;
	href?: string;
	onSelect?: () => void;
}

export interface CommandPaletteGroup {
	group: string;
	items: CommandPaletteItem[];
}
