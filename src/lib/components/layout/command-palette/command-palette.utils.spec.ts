import { describe, expect, it, vi } from 'vitest';
import type { NavSection } from '$lib/components/ui/sidebar/sidebar.types';
import type { Component } from 'svelte';
import type { CommandPaletteItem } from './command-palette.types';
import {
	buildNavCommandItems,
	filterCommandItems,
	groupCommandItems,
	isCommandPaletteShortcut
} from './command-palette.utils';

const DummyIcon = (() => null) as unknown as Component;

describe('command-palette.utils', () => {
	describe('buildNavCommandItems', () => {
		it('flattens nav sections and nested nav groups into command items', () => {
			const navigate = vi.fn();
			const sections: NavSection[] = [
				{
					label: '',
					entries: [{ title: 'Dashboard', href: '/dashboard', icon: DummyIcon }]
				},
				{
					label: 'TRANSAKSI',
					entries: [
						{
							title: 'Tiket',
							href: '/tickets',
							icon: DummyIcon,
							keywords: ['tiket pesanan', 'spk']
						},
						{ title: 'Kasir', href: '/cashier', icon: DummyIcon },
						{
							id: 'reports',
							title: 'Laporan',
							icon: DummyIcon,
							children: [{ title: 'Arus Kas', href: '/reports/cash-flow', icon: DummyIcon }]
						}
					]
				}
			];

			const items = buildNavCommandItems(sections, navigate);

			expect(items).toHaveLength(4);
			expect(items[0]).toMatchObject({
				id: 'nav:/dashboard',
				title: 'Dashboard',
				group: 'Navigasi',
				href: '/dashboard'
			});
			expect(items[1]).toMatchObject({
				id: 'nav:/tickets',
				title: 'Tiket',
				group: 'TRANSAKSI',
				href: '/tickets',
				keywords: ['/tickets', 'tiket pesanan', 'spk']
			});
			expect(items[3]).toMatchObject({
				id: 'nav:/reports/cash-flow',
				title: 'Arus Kas',
				group: 'TRANSAKSI',
				subtitle: 'Laporan',
				href: '/reports/cash-flow'
			});

			items[2].onSelect?.();
			expect(navigate).toHaveBeenCalledWith('/cashier');
		});
	});

	describe('filterCommandItems', () => {
		const items: CommandPaletteItem[] = [
			{
				id: '1',
				title: 'Laporan Laba Rugi',
				group: 'LAPORAN',
				href: '/reports/profit-loss',
				keywords: ['profit', 'loss', 'keuangan']
			},
			{
				id: '2',
				title: 'Kasir',
				group: 'TRANSAKSI',
				href: '/cashier',
				keywords: ['pos', 'pembayaran']
			}
		];

		it('returns all items when query is empty or whitespace', () => {
			expect(filterCommandItems(items, '')).toHaveLength(2);
			expect(filterCommandItems(items, '   ')).toHaveLength(2);
		});

		it('matches multi-word queries across title, group, keywords, and href', () => {
			expect(filterCommandItems(items, 'laporan laba')).toHaveLength(1);
			expect(filterCommandItems(items, 'pos transaksi')).toHaveLength(1);
			expect(filterCommandItems(items, 'keuangan profit')).toHaveLength(1);
			expect(filterCommandItems(items, 'tidakada')).toHaveLength(0);
		});
	});

	describe('groupCommandItems', () => {
		it('groups items preserving first-seen group order', () => {
			const grouped = groupCommandItems([
				{ id: '1', title: 'A', group: 'First' },
				{ id: '2', title: 'B', group: 'Second' },
				{ id: '3', title: 'C', group: 'First' }
			]);

			expect(grouped).toEqual([
				{
					group: 'First',
					items: [
						{ id: '1', title: 'A', group: 'First' },
						{ id: '3', title: 'C', group: 'First' }
					]
				},
				{
					group: 'Second',
					items: [{ id: '2', title: 'B', group: 'Second' }]
				}
			]);
		});
	});

	describe('isCommandPaletteShortcut', () => {
		it('matches Cmd+K and Ctrl+K without extra modifiers', () => {
			expect(
				isCommandPaletteShortcut({
					metaKey: true,
					ctrlKey: false,
					altKey: false,
					shiftKey: false,
					key: 'k'
				})
			).toBe(true);
			expect(
				isCommandPaletteShortcut({
					metaKey: false,
					ctrlKey: true,
					altKey: false,
					shiftKey: false,
					key: 'K'
				})
			).toBe(true);
			expect(
				isCommandPaletteShortcut({
					metaKey: true,
					ctrlKey: false,
					altKey: false,
					shiftKey: true,
					key: 'k'
				})
			).toBe(false);
			expect(
				isCommandPaletteShortcut({
					metaKey: false,
					ctrlKey: false,
					altKey: false,
					shiftKey: false,
					key: 'k'
				})
			).toBe(false);
		});
	});
});
