import { describe, expect, it } from 'vitest';
import IconHome from '~icons/lucide/home';

import { isActiveHref, sectionContainsActive } from './sidebar.nav';
import type { NavSection } from './sidebar.types';

const testSections: NavSection[] = [
	{
		label: 'PRODUKSI',
		entries: [
			{ title: 'Dashboard', href: '/dashboard', icon: IconHome },
			{
				id: 'production-group',
				title: 'Produksi',
				icon: IconHome,
				children: [
					{ title: 'Antrean Mesin', href: '/production/queues', icon: IconHome },
					{ title: 'Finishing', href: '/production/finishing', icon: IconHome }
				]
			}
		]
	}
];

describe('isActiveHref', () => {
	it('matches the exact route', () => {
		expect(isActiveHref('/production/queues', '/production/queues')).toBe(true);
	});

	it('matches a nested child route', () => {
		expect(isActiveHref('/production/queues/12', '/production/queues')).toBe(true);
	});

	it('does not let /dashboard claim subpages outside exact match', () => {
		expect(isActiveHref('/production/queues', '/dashboard')).toBe(false);
	});

	it('does not match an unrelated route with shared prefix string', () => {
		expect(isActiveHref('/production/queues-archive', '/production/queues')).toBe(false);
	});

	it('activates /tickets on /tickets/new but leaves /cashier inactive', () => {
		expect(isActiveHref('/tickets/new', '/tickets')).toBe(true);
		expect(isActiveHref('/tickets/new', '/cashier')).toBe(false);
	});

	it('activates /cashier and leaves /tickets inactive when on /cashier', () => {
		expect(isActiveHref('/cashier', '/cashier')).toBe(true);
		expect(isActiveHref('/cashier', '/tickets')).toBe(false);
	});

	it('activates /expenses and leaves /orders and /finance/expenses inactive when on /expenses', () => {
		expect(isActiveHref('/expenses', '/expenses')).toBe(true);
		expect(isActiveHref('/expenses', '/orders')).toBe(false);
		expect(isActiveHref('/expenses', '/finance/expenses')).toBe(false);
	});

	it('activates parent /finance and /reports hub links on nested subpages', () => {
		expect(isActiveHref('/finance/transfers', '/finance')).toBe(true);
		expect(isActiveHref('/reports/profit-loss', '/reports')).toBe(true);
	});
});

describe('sectionContainsActive', () => {
	it('reports the group id holding the active route', () => {
		expect(sectionContainsActive(testSections, '/production/queues')).toEqual(
			new Set(['production-group'])
		);
	});

	it('reports empty set when the active route sits outside any group', () => {
		expect(sectionContainsActive(testSections, '/dashboard')).toEqual(new Set());
	});
});
