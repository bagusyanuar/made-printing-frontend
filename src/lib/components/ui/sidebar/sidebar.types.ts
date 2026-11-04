import type { Component } from 'svelte';

/** A leaf entry: renders as a link and can be the active route. */
export interface NavLink {
	title: string;
	href: string;
	icon: Component;
	badge?: string | number;
	permission?: string | string[];
}

/**
 * A parent entry that owns child links. It is never a link itself.
 */
export interface NavGroup {
	id: string;
	title: string;
	icon: Component;
	children: NavLink[];
	permission?: string | string[];
}

export type NavEntry = NavLink | NavGroup;

/** A labelled block of entries. */
export interface NavSection {
	label: string;
	entries: NavEntry[];
	permission?: string | string[];
}

export function isNavGroup(entry: NavEntry): entry is NavGroup {
	return 'children' in entry;
}

export interface SidebarClasses {
	root?: string;
	rootRail?: string;
	header?: string;
	headerRail?: string;
	toggleButton?: string;
	nav?: string;
	navRail?: string;
	divider?: string;
	sectionLabel?: string;
	item?: string;
	itemRail?: string;
	itemActive?: string;
	itemInactive?: string;
	itemChild?: string;
	groupPanel?: string;
	flyoutPanel?: string;
	flyoutLabel?: string;
	chevron?: string;
}

