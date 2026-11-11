<script lang="ts">
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import IconArrowUpDown from '~icons/lucide/arrow-up-down';
	import IconX from '~icons/lucide/x';
	import type { ProductCategory } from '../../domain/product-category.entity';

	interface Props {
		open: boolean;
		category: ProductCategory | null;
		maxOrder: number;
		onSave: (newOrder: number) => Promise<boolean>;
		onClose: () => void;
	}

	let { open = $bindable(false), category, maxOrder, onSave, onClose }: Props = $props();

	let orderValue = $state(1);
	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);

	$effect(() => {
		if (open && category) {
			orderValue = category.displayOrder;
			errorMessage = null;
		}
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const val = Number(orderValue);
		if (isNaN(val) || val < 1) {
			errorMessage = 'Nomor urutan minimal 1';
			return;
		}

		isSubmitting = true;
		const success = await onSave(val);
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
			class="relative z-10 w-full max-w-sm rounded-xl border border-border bg-app-surface p-5 shadow-xl"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2.5">
					<div
						class="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"
					>
						<IconArrowUpDown class="size-4" />
					</div>
					<div>
						<Typography variant="h3" as="h2" class="text-base font-bold text-foreground">
							Ubah Urutan Display
						</Typography>
						<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
							{category.name}
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

			<form onsubmit={handleSubmit} class="mt-4 flex flex-col gap-3">
				<div class="flex flex-col gap-1.5">
					<label for="order-input" class="text-xs font-semibold text-foreground">
						Nomor Urut Baru (1 – {maxOrder})
					</label>
					<TextField
						id="order-input"
						type="number"
						size="sm"
						value={String(orderValue)}
						onValueChange={(val) => (orderValue = Number(val) || 1)}
						class="w-full"
						disabled={isSubmitting}
					/>
					{#if errorMessage}
						<span class="text-xs text-danger">{errorMessage}</span>
					{/if}
					<span class="text-[11px] text-foreground-subtle">
						Urutan saat ini: <strong class="font-semibold text-foreground"
							>{category.displayOrder}</strong
						>. Kategori lain akan otomatis digeser sesuai posisi baru.
					</span>
				</div>

				<div class="mt-2 flex items-center justify-end gap-2">
					<Button type="button" variant="ghost" size="sm" onclick={onClose} disabled={isSubmitting}>
						Batal
					</Button>
					<Button type="submit" variant="default" size="sm" isLoading={isSubmitting}>
						Simpan Urutan
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
