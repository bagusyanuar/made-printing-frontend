<script lang="ts">
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { Combobox, type ComboboxOption } from 'dystopia-linear-lib/components/combobox';
	import IconLayers from '~icons/lucide/layers';
	import IconX from '~icons/lucide/x';
	import type { ProductCategory } from '../../domain/product-category.entity';

	interface Props {
		open: boolean;
		category: ProductCategory | null;
		allCategories: ProductCategory[];
		onSave: (targetSpk: string | null) => Promise<boolean>;
		onClose: () => void;
	}

	let { open = $bindable(false), category, allCategories = [], onSave, onClose }: Props = $props();

	let selectedValue = $state<string>('default');
	let isSubmitting = $state(false);

	$effect(() => {
		if (open && category) {
			selectedValue = category.spkCategory ? category.spkCategory : 'default';
		}
	});

	const spkOptions = $derived.by<ComboboxOption<string>[]>(() => {
		const list: ComboboxOption<string>[] = [
			{
				value: 'default',
				label: 'Default (Kategori Sendiri)'
			}
		];

		if (!category) return list;

		allCategories
			.filter((c) => c.id !== category.id)
			.forEach((c) => {
				list.push({
					value: c.name,
					label: c.name
				});
			});

		return list;
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		isSubmitting = true;
		const targetSpk = selectedValue === 'default' ? null : selectedValue;
		const success = await onSave(targetSpk);
		isSubmitting = false;

		if (success) {
			onClose();
		}
	}
</script>

{#if open && category}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
			onclick={onClose}
			aria-label="Tutup dialog"
		></button>

		<!-- Dialog Container -->
		<div
			class="relative z-10 w-full max-w-md rounded-xl border border-border bg-app-surface p-6 shadow-xl"
		>
			<!-- Header -->
			<div class="flex items-start justify-between">
				<div class="flex items-start gap-3">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-500"
					>
						<IconLayers class="size-5" />
					</div>
					<div>
						<Typography variant="h3" as="h2" class="text-base font-bold text-foreground">
							Atur Kategori SPK
						</Typography>
						<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle">
							Kelompokkan item dari kategori ini ke dalam lembar kerja SPK tertentu.
						</Typography>
					</div>
				</div>

				<button
					type="button"
					class="rounded-lg p-1.5 text-foreground-subtle transition-colors hover:bg-surface-hover hover:text-foreground"
					onclick={onClose}
					aria-label="Tutup"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<!-- Alert Box (Orange with border dashed as requested) -->
			<div
				class="mt-4 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
			>
				<div>
					Kategori Asal: <strong class="font-bold text-amber-600 dark:text-amber-400"
						>{category.name}</strong
					>
				</div>
				<p class="mt-1 leading-relaxed text-foreground-subtle dark:text-amber-200/80">
					Jika diarahkan ke kategori tujuan, seluruh item produk dari kategori ini otomatis dicetak
					bersama lembar kerja SPK kategori tujuan tersebut.
				</p>
			</div>

			<!-- Form Content -->
			<form onsubmit={handleSubmit} class="mt-4 flex flex-col gap-4">
				<div class="flex flex-col gap-1.5">
					<label for="spk-combobox" class="text-xs font-semibold text-foreground">
						Tujuan Kelompok SPK
					</label>
					<Combobox
						id="spk-combobox"
						options={spkOptions}
						bind:value={selectedValue}
						size="md"
						clearable={false}
						labels={{
							placeholder: 'Pilih Tujuan Kelompok SPK',
							searchPlaceholder: 'Cari kategori SPK...',
							empty: 'Tidak ada kategori ditemukan'
						}}
						classes={{ content: 'z-60' }}
						class="w-full"
					/>
				</div>

				<!-- Actions -->
				<div class="mt-2 flex items-center justify-end gap-2.5">
					<Button type="button" variant="ghost" size="sm" onclick={onClose} disabled={isSubmitting}>
						Batal
					</Button>
					<Button
						type="submit"
						size="sm"
						isLoading={isSubmitting}
						class="gap-1.5 bg-amber-600 font-medium text-white shadow-xs hover:bg-amber-700"
					>
						<IconLayers class="size-4" />
						<span>Simpan Pengaturan SPK</span>
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
