import { isNavGroup, type NavSection } from '$lib/components/ui/sidebar/sidebar.types';
import type { CommandPaletteGroup, CommandPaletteItem } from './command-palette.types';

/**
 * Converts sidebar navigation sections (including nested groups) into flat command palette items.
 */
export function buildNavCommandItems(
	sections: NavSection[],
	onNavigate?: (href: string) => void
): CommandPaletteItem[] {
	const items: CommandPaletteItem[] = [];

	for (const section of sections) {
		const groupLabel = section.label.trim() || 'Navigasi';

		for (const entry of section.entries) {
			if (isNavGroup(entry)) {
				for (const child of entry.children) {
					items.push({
						id: `nav:${child.href}`,
						title: child.title,
						group: groupLabel,
						subtitle: entry.title,
						keywords: [entry.title, child.href, ...(child.keywords ?? [])],
						icon: child.icon,
						href: child.href,
						onSelect: () => onNavigate?.(child.href)
					});
				}
			} else {
				items.push({
					id: `nav:${entry.href}`,
					title: entry.title,
					group: groupLabel,
					keywords: [entry.href, ...(entry.keywords ?? [])],
					icon: entry.icon,
					href: entry.href,
					onSelect: () => onNavigate?.(entry.href)
				});
			}
		}
	}

	return items;
}

/**
 * Filters command palette items using case-insensitive multi-word matching across title, group, subtitle, keywords, and href.
 */
export function filterCommandItems(
	items: CommandPaletteItem[],
	query: string
): CommandPaletteItem[] {
	const tokens = query
		.trim()
		.toLowerCase()
		.split(/\s+/)
		.filter((token) => token.length > 0);

	if (tokens.length === 0) return items;

	return items.filter((item) => {
		const haystack = [
			item.title,
			item.group,
			item.subtitle ?? '',
			item.href ?? '',
			...(item.keywords ?? [])
		]
			.join(' ')
			.toLowerCase();

		return tokens.every((token) => haystack.includes(token));
	});
}

/**
 * Groups command palette items by their `group` property while preserving first-seen group order.
 */
export function groupCommandItems(items: CommandPaletteItem[]): CommandPaletteGroup[] {
	const groups = new Map<string, CommandPaletteItem[]>();

	for (const item of items) {
		const existing = groups.get(item.group);
		if (existing) {
			existing.push(item);
		} else {
			groups.set(item.group, [item]);
		}
	}

	return Array.from(groups.entries(), ([group, groupItems]) => ({
		group,
		items: groupItems
	}));
}

/**
 * Checks whether a keyboard event matches the Cmd+K (macOS) or Ctrl+K (Windows/Linux) shortcut.
 */
export function isCommandPaletteShortcut(
	event: Pick<KeyboardEvent, 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey' | 'key'>
): boolean {
	return (
		(event.metaKey || event.ctrlKey) &&
		!event.altKey &&
		!event.shiftKey &&
		event.key.toLowerCase() === 'k'
	);
}

/**
 * Returns true when running on an Apple platform so keyboard hints display Cmd instead of Ctrl.
 */
export function isMacPlatform(): boolean {
	if (typeof navigator === 'undefined') return false;
	const platform = navigator.platform || navigator.userAgent;
	return /Mac|iPhone|iPad|iPod/i.test(platform);
}
