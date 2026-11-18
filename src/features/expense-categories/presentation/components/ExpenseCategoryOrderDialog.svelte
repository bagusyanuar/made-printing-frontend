<script lang="ts">
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import IconArrowUpDown from '~icons/lucide/arrow-up-down';
	import IconX from '~icons/lucide/x';
	import type { ExpenseCategory } from '../../domain/expense-category.entity';

	interface Props {
		open: boolean;
		category: ExpenseCategory | null;
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
			class="relative z-10 w-full max-w-sm rounded-xl border border-border bg-app-surface p-5 shadow-2xl"
		>
			<div class="flex items-start justify-between border-b border-border pb-3.5">
				<div class="flex items-center gap-2.5">
					<div
						class="flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"
					>
						<IconArrowUpDown class="size-4" />
					</div>
					<div>
						<Typography variant="h4" as="h3" class="text-sm font-semibold text-foreground">
							Ubah Nomor Urut
						</Typography>
						<Typography variant="muted" as="p" class="text-[11px] text-foreground-subtle">
							{category.name}
						</Typography>
					</div>
				</div>
				<button
					type="button"
					onclick={onClose}
					class="flex size-7 items-center justify-center rounded-lg text-foreground-subtle hover:bg-surface-subtle hover:text-foreground"
					aria-label="Tutup"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<form onsubmit={handleSubmit} class="mt-4 flex flex-col gap-4">
				<div class="flex flex-col gap-1.5">
					<label for="category-order-input" class="text-xs font-medium text-foreground">
						Nomor Urut Baru (1 s/d {maxOrder})
					</label>
					<TextField
						id="category-order-input"
						type="number"
						size="sm"
						min="1"
						max={String(maxOrder)}
						value={String(orderValue)}
						onValueChange={(val) => {
							orderValue = Number(val);
							errorMessage = null;
						}}
						class="w-full"
					/>
					{#if errorMessage}
						<span class="text-[11px] text-danger">{errorMessage}</span>
					{/if}
				</div>

				<div class="flex items-center justify-end gap-2 border-t border-border pt-3.5">
					<Button type="button" variant="ghost" size="sm" onclick={onClose} disabled={isSubmitting}>
						Batal
					</Button>
					<Button type="submit" variant="default" size="sm" isLoading={isSubmitting}>Simpan</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
