<script lang="ts">
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import { Select } from 'dystopia-linear-lib/components/select';
	import IconX from '~icons/lucide/x';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import {
		CALCULATION_TYPES,
		type CalculationType,
		type ProductCategory,
		type ProductCategoryInput
	} from '../../domain/product-category.entity';
	import { productCategorySchema } from '../../domain/product-category.schema';

	interface Props {
		open: boolean;
		category?: ProductCategory | null;
		onSave: (input: ProductCategoryInput) => Promise<boolean>;
		onClose: () => void;
	}

	let { open = $bindable(false), category = null, onSave, onClose }: Props = $props();

	let code = $state('');
	let name = $state('');
	let calculationType = $state<CalculationType>('square_meter');
	let description = $state('');
	let isActive = $state(true);

	let isSubmitting = $state(false);
	let formError = $state<string | null>(null);
	let fieldErrors = $state<Record<string, string>>({});

	$effect(() => {
		if (open) {
			if (category) {
				code = category.code;
				name = category.name;
				calculationType = category.calculationType;
				description = category.description ?? '';
				isActive = category.isActive;
			} else {
				code = '';
				name = '';
				calculationType = 'square_meter';
				description = '';
				isActive = true;
			}
			formError = null;
			fieldErrors = {};
		}
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		formError = null;
		fieldErrors = {};

		const payload: ProductCategoryInput = {
			code: code.trim().toUpperCase(),
			name: name.trim(),
			calculationType,
			description: description.trim() || null,
			isActive
		};

		const validation = productCategorySchema.safeParse(payload);
		if (!validation.success) {
			const formatted = validation.error.format();
			fieldErrors = {
				code: formatted.code?._errors[0] ?? '',
				name: formatted.name?._errors[0] ?? '',
				calculationType: formatted.calculationType?._errors[0] ?? '',
				description: formatted.description?._errors[0] ?? ''
			};
			return;
		}

		isSubmitting = true;
		const success = await onSave(validation.data);
		isSubmitting = false;

		if (success) {
			onClose();
		}
	}
</script>

{#if open}
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
			aria-label="Tutup modal"
		></button>

		<!-- Dialog Modal Container -->
		<div
			class="relative z-10 w-full max-w-lg rounded-xl border border-border bg-app-surface p-6 shadow-xl"
		>
			<!-- Header -->
			<div class="flex items-start justify-between border-b border-border pb-4">
				<div>
					<Typography variant="h3" as="h2" class="font-bold text-foreground">
						{category ? 'Edit Kategori Produk' : 'Tambah Kategori Produk Baru'}
					</Typography>
					<Typography variant="muted" as="p" class="mt-1 text-xs text-foreground-subtle">
						Tentukan kode unik, nama, dan formula kalkulasi satuan cetak percetakan.
					</Typography>
				</div>
				<button
					type="button"
					class="rounded-lg p-1.5 text-foreground-subtle transition-colors hover:bg-surface-hover hover:text-foreground"
					onclick={onClose}
					aria-label="Tutup"
				>
					<IconX class="size-5" />
				</button>
			</div>

			<!-- Error Alert -->
			{#if formError}
				<div
					class="mt-4 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/10 p-3 text-xs text-danger"
				>
					<IconAlertCircle class="size-4 shrink-0" />
					<span>{formError}</span>
				</div>
			{/if}

			<!-- Form Content -->
			<form onsubmit={handleSubmit} class="mt-4 flex flex-col gap-4">
				<!-- Kode Kategori -->
				<div class="flex flex-col gap-1.5">
					<label for="category-code" class="text-xs font-semibold text-foreground">
						Kode Kategori <span class="text-danger">*</span>
					</label>
					<TextField
						id="category-code"
						bind:value={code}
						placeholder="Contoh: LF-OUT, A3-DOC, DTF"
						invalid={Boolean(fieldErrors.code)}
						disabled={isSubmitting}
						class="w-full uppercase"
					/>
					{#if fieldErrors.code}
						<span class="text-xs text-danger">{fieldErrors.code}</span>
					{/if}
					<span class="text-[11px] text-foreground-subtle">
						Format singkatan unik untuk identifikasi produk & SPK.
					</span>
				</div>

				<!-- Nama Kategori -->
				<div class="flex flex-col gap-1.5">
					<label for="category-name" class="text-xs font-semibold text-foreground">
						Nama Kategori <span class="text-danger">*</span>
					</label>
					<TextField
						id="category-name"
						bind:value={name}
						placeholder="Contoh: Large Format Outdoor / Spanduk"
						invalid={Boolean(fieldErrors.name)}
						disabled={isSubmitting}
						class="w-full"
					/>
					{#if fieldErrors.name}
						<span class="text-xs text-danger">{fieldErrors.name}</span>
					{/if}
				</div>

				<!-- Model Satuan Hitung -->
				<div class="flex flex-col gap-1.5">
					<label for="category-calc" class="text-xs font-semibold text-foreground">
						Model Satuan Hitung <span class="text-danger">*</span>
					</label>
					<Select
						id="category-calc"
						value={calculationType}
						onValueChange={(val) => (calculationType = val as CalculationType)}
						disabled={isSubmitting}
						class="w-full"
					>
						{#each CALCULATION_TYPES as opt (opt.value)}
							<option value={opt.value}>
								{opt.label} — {opt.unit}
							</option>
						{/each}
					</Select>
					{#if fieldErrors.calculationType}
						<span class="text-xs text-danger">{fieldErrors.calculationType}</span>
					{/if}
					<span class="text-[11px] text-foreground-subtle">
						{CALCULATION_TYPES.find((c) => c.value === calculationType)?.description}
					</span>
				</div>

				<!-- Keterangan / Deskripsi -->
				<div class="flex flex-col gap-1.5">
					<label for="category-desc" class="text-xs font-semibold text-foreground">
						Keterangan (Opsional)
					</label>
					<TextField
						id="category-desc"
						bind:value={description}
						placeholder="Catatan tambahan mengenai kategori bahan atau armada mesin..."
						disabled={isSubmitting}
						class="w-full"
					/>
					{#if fieldErrors.description}
						<span class="text-xs text-danger">{fieldErrors.description}</span>
					{/if}
				</div>

				<!-- Toggle Status Aktif -->
				<div
					class="flex items-center justify-between rounded-lg border border-border bg-surface-subtle p-3"
				>
					<div>
						<div class="text-xs font-semibold text-foreground">Status Kategori</div>
						<div class="text-[11px] text-foreground-subtle">
							Kategori aktif dapat dipilih saat pembuatan produk baru dan transaksi kasir.
						</div>
					</div>
					<label class="relative inline-flex cursor-pointer items-center">
						<input
							type="checkbox"
							bind:checked={isActive}
							disabled={isSubmitting}
							class="peer sr-only"
						/>
						<div
							class="peer h-6 w-11 rounded-full bg-border peer-checked:bg-primary peer-focus:outline-hidden after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
						></div>
					</label>
				</div>

				<!-- Footer Buttons -->
				<div class="mt-4 flex items-center justify-end gap-2 border-t border-border pt-4">
					<Button type="button" variant="ghost" size="sm" onclick={onClose} disabled={isSubmitting}>
						Batal
					</Button>
					<Button type="submit" variant="default" size="sm" isLoading={isSubmitting}>
						{category ? 'Simpan Perubahan' : 'Buat Kategori'}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
