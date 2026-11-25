import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CommandPalette from './CommandPalette.svelte';
import type { CommandPaletteItem } from './command-palette.types';

describe('CommandPalette.svelte', () => {
	function createItems(onSelect = vi.fn()): {
		items: CommandPaletteItem[];
		onSelect: ReturnType<typeof vi.fn>;
	} {
		const items: CommandPaletteItem[] = [
			{
				id: 'nav:/dashboard',
				title: 'Dashboard',
				group: 'Navigasi',
				href: '/dashboard',
				onSelect: () => onSelect('dashboard')
			},
			{
				id: 'nav:/cashier',
				title: 'Kasir',
				group: 'TRANSAKSI',
				keywords: ['pos'],
				href: '/cashier',
				onSelect: () => onSelect('cashier')
			},
			{
				id: 'action:theme',
				title: 'Beralih ke Tema Gelap',
				group: 'AKSI CEPAT',
				onSelect: () => onSelect('theme')
			}
		];

		return { items, onSelect };
	}

	it('opens with Cmd+K, filters commands, navigates with arrows, and executes on Enter', async () => {
		const { items, onSelect } = createItems();
		render(CommandPalette, { items });

		// Trigger Cmd+K on window
		window.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'k', metaKey: true, cancelable: true, bubbles: true })
		);

		const combobox = page.getByRole('combobox', { name: 'Cari halaman atau aksi' });
		await expect.element(combobox).toBeVisible();

		// Type filter query
		await userEvent.fill(combobox, 'kasir');
		await expect.element(page.getByRole('option', { name: /Kasir/i })).toBeVisible();
		await expect.element(page.getByRole('option', { name: /Dashboard/i })).not.toBeInTheDocument();

		// Execute highlighted item with Enter
		await userEvent.keyboard('{Enter}');
		expect(onSelect).toHaveBeenCalledWith('cashier');
		await expect.element(combobox).not.toBeInTheDocument();
	});

	it('opens via trigger click, supports ArrowDown selection, and shows empty state when unmatched', async () => {
		const { items, onSelect } = createItems();
		render(CommandPalette, { items });

		await page.getByRole('button', { name: 'Buka Command Palette' }).click();

		const combobox = page.getByRole('combobox', { name: 'Cari halaman atau aksi' });
		await expect.element(combobox).toBeVisible();

		// Move down to Kasir (index 1) and press Enter
		await userEvent.keyboard('{ArrowDown}{Enter}');
		expect(onSelect).toHaveBeenCalledWith('cashier');

		// Re-open and test empty state
		await page.getByRole('button', { name: 'Buka Command Palette' }).click();
		await userEvent.fill(combobox, 'tidak-ada-menu');
		await expect.element(page.getByText('Tidak ada hasil')).toBeVisible();
	});
});
