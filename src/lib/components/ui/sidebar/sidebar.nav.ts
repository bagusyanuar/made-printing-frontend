import { isNavGroup, type NavSection } from './sidebar.types';

/**
 * Route matching logic.
 */
export function isActiveHref(pathname: string, href: string): boolean {
	if (pathname === href) return true;
	if (href === '/' || href === '/dashboard') return false;
	return pathname.startsWith(`${href}/`);
}

/**
 * Returns a set of group IDs that contain the currently active route.
 */
export function sectionContainsActive(sections: NavSection[], pathname: string): Set<string> {
	const open = new Set<string>();
	for (const section of sections) {
		for (const entry of section.entries) {
			if (!isNavGroup(entry)) continue;
			if (entry.children.some((child) => isActiveHref(pathname, child.href))) {
				open.add(entry.id);
			}
		}
	}
	return open;
}
