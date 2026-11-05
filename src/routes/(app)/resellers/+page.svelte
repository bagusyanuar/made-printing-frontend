<script lang="ts">
	import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Card, CardHeader, CardTitle, CardContent } from 'dystopia-linear-lib/components/card';
	import { Badge } from 'dystopia-linear-lib/components/badge';
	import { Button } from 'dystopia-linear-lib/components/button';
	import IconHandshake from '~icons/lucide/handshake';
	import IconPlus from '~icons/lucide/plus';
	import IconSearch from '~icons/lucide/search';
	import IconWallet from '~icons/lucide/wallet';
	import IconShieldAlert from '~icons/lucide/shield-alert';
	import IconAward from '~icons/lucide/award';

	pageTitleStore.set('Biro & Reseller');

	const stats = [
		{
			title: 'Total Biro & Reseller',
			value: '34 Mitra',
			subtitle: '28 aktif bertransaksi bulan ini',
			icon: IconHandshake
		},
		{
			title: 'Total Saldo Deposit Mitra',
			value: 'Rp 42.150.000',
			subtitle: 'Prepaid balance siap pakai',
			icon: IconWallet
		},
		{
			title: 'Plafon Piutang Terpakai',
			value: 'Rp 18.700.000',
			subtitle: 'Batas limit total Rp 50.000.000',
			icon: IconAward
		},
		{
			title: 'Overdue / Auto-Hold',
			value: '2 Mitra',
			subtitle: 'Tagihan tempo melewati batas TOP',
			icon: IconShieldAlert,
			alert: true
		}
	];

	const sampleResellers = [
		{
			code: 'RSL-001',
			name: 'Biro Iklan Mahakarya',
			owner: 'Hendra Setiawan',
			phone: '081298765432',
			tier: 'Gold Partner',
			creditLimit: 'Rp 15.000.000',
			usedCredit: 'Rp 6.200.000',
			depositBalance: 'Rp 2.500.000',
			top: '30 Hari',
			status: 'Aktif',
			statusVariant: 'success' as const
		},
		{
			code: 'RSL-002',
			name: 'Percetakan Sumber Rejeki',
			owner: 'Ahmad Fauzi',
			phone: '081345678901',
			tier: 'Silver Reseller',
			creditLimit: 'Rp 5.000.000',
			usedCredit: 'Rp 4.800.000',
			depositBalance: 'Rp 0',
			top: '14 Hari',
			status: 'Mendekati Limit',
			statusVariant: 'warning' as const
		},
		{
			code: 'RSL-003',
			name: 'Kreatif Visual Media',
			owner: 'Dian Anggraini',
			phone: '081122334455',
			tier: 'Gold Partner',
			creditLimit: 'Rp 10.000.000',
			usedCredit: 'Rp 7.500.000',
			depositBalance: 'Rp 1.000.000',
			top: '14 Hari (Overdue)',
			status: 'Auto-Hold',
			statusVariant: 'danger' as const
		}
	];
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<Typography variant="h3" as="h1" class="font-bold text-foreground">
				Manajemen Biro Iklan & Reseller
			</Typography>
			<Typography variant="muted" as="p" class="text-foreground-subtle">
				Kelola relasi mitra percetakan, penetapan tier harga reseller, plafon kredit tempo (TOP),
				dan saldo deposit.
			</Typography>
		</div>
		<Button size="sm">
			<IconPlus class="mr-1.5 size-4" />
			Daftarkan Reseller Baru
		</Button>
	</div>

	<!-- KPI Summary Metrics -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each stats as item (item.title)}
			{@const StatIcon = item.icon}
			<Card class="bg-app-surface shadow-xs">
				<CardContent class="p-4">
					<div class="flex items-center justify-between">
						<span class="text-xs font-medium text-foreground-subtle">{item.title}</span>
						<div
							class={`flex size-7 items-center justify-center rounded-md ${
								item.alert
									? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
									: 'bg-surface-subtle text-foreground-faint'
							}`}
						>
							<StatIcon class="size-4" />
						</div>
					</div>
					<div class="mt-2 flex items-baseline gap-2">
						<span
							class={`text-xl font-bold tracking-tight ${
								item.alert ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
							}`}
						>
							{item.value}
						</span>
					</div>
					<p class="mt-1 text-[11px] text-foreground-faint">{item.subtitle}</p>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Resellers Table Card -->
	<Card class="bg-app-surface shadow-xs">
		<CardHeader class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<CardTitle class="text-base font-semibold text-foreground">
				Daftar Mitra Biro & Reseller Terdaftar
			</CardTitle>
			<div class="relative w-full max-w-xs">
				<IconSearch
					class="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-foreground-faint"
				/>
				<input
					type="text"
					placeholder="Cari biro / nama PIC / WhatsApp..."
					class="h-8 w-full rounded-md border border-border bg-canvas pr-3 pl-8 text-xs text-foreground placeholder:text-foreground-faint focus:border-primary focus:outline-hidden"
				/>
			</div>
		</CardHeader>
		<CardContent class="p-0">
			<div class="overflow-x-auto">
				<table class="w-full text-left text-xs">
					<thead class="border-y border-border bg-surface-subtle text-foreground-subtle">
						<tr>
							<th class="px-4 py-2.5 font-medium">ID Mitra</th>
							<th class="px-4 py-2.5 font-medium">Nama Biro / Reseller</th>
							<th class="px-4 py-2.5 font-medium">Kontak PIC</th>
							<th class="px-4 py-2.5 font-medium">Tier Harga</th>
							<th class="px-4 py-2.5 font-medium">Plafon Kredit</th>
							<th class="px-4 py-2.5 font-medium">Piutang Terpakai</th>
							<th class="px-4 py-2.5 font-medium">Saldo Deposit</th>
							<th class="px-4 py-2.5 font-medium">Jatuh Tempo (TOP)</th>
							<th class="px-4 py-2.5 font-medium">Status Akun</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border text-foreground">
						{#each sampleResellers as rsl (rsl.code)}
							<tr class="transition-colors duration-150 hover:bg-surface-subtle">
								<td class="px-4 py-3 font-semibold text-primary">{rsl.code}</td>
								<td class="px-4 py-3 font-medium text-foreground">{rsl.name}</td>
								<td class="px-4 py-3 text-foreground-subtle">
									<div>{rsl.owner}</div>
									<div class="text-[11px] text-foreground-faint">{rsl.phone}</div>
								</td>
								<td class="px-4 py-3">
									<Badge variant="secondary" size="sm">
										{rsl.tier}
									</Badge>
								</td>
								<td class="px-4 py-3 text-foreground-subtle">{rsl.creditLimit}</td>
								<td class="px-4 py-3 font-semibold text-rose-600 dark:text-rose-400">
									{rsl.usedCredit}
								</td>
								<td class="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
									{rsl.depositBalance}
								</td>
								<td class="px-4 py-3 text-foreground-subtle">{rsl.top}</td>
								<td class="px-4 py-3">
									<Badge variant={rsl.statusVariant} size="sm">
										{rsl.status}
									</Badge>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</CardContent>
	</Card>
</div>
