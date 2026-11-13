<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import { Textarea } from 'dystopia-linear-lib/components/textarea';
	import { Combobox, type ComboboxOption } from 'dystopia-linear-lib/components/combobox';
	import { Radio } from 'dystopia-linear-lib/components/radio';
	import { cn } from 'dystopia-linear-lib/utils/cn';
	import IconX from '~icons/lucide/x';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import {
		CALCULATION_TYPES,
		generateCategoryCode,
		type CalculationType,
		type CategoryType,
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

	let name = $state('');
	let type = $state<CategoryType>('production');
	let calculationType = $state<CalculationType>('square_meter');
	let description = $state('');

	let isSubmitting = $state(false);
	let formError = $state<string | null>(null);
	let fieldErrors = $state<Record<string, string>>({});

	const calculationOptions: ComboboxOption<CalculationType>[] = CALCULATION_TYPES.map((opt) => ({
		value: opt.value,
		label: `${opt.label} — ${opt.unit}`,
		keywords: [opt.unit, opt.label, opt.description]
	}));

	function modalSlideIn(node: Element, { duration = 280 } = {}) {
		return {
			duration,
			css: (t: number) => {
				// Quintic ease-out curve for natural, buttery-smooth deceleration
				const eased = 1 - Math.pow(1 - t, 4);
				const y = (1 - eased) * -44;
				const scale = 0.95 + 0.05 * eased;
				return `
					transform: translateY(${y}px) scale(${scale});
					opacity: ${eased};
				`;
			}
		};
	}

	$effect(() => {
		if (open) {
			if (category) {
				name = category.name;
				type = category.type;
				calculationType = category.calculationType;
				description = category.description ?? '';
			} else {
				name = '';
				type = 'production';
				calculationType = 'square_meter';
				description = '';
			}
			formError = null;
			fieldErrors = {};
		}
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		formError = null;
		fieldErrors = {};

		const trimmedName = name.trim();
		const finalCode = category ? category.code : generateCategoryCode(trimmedName);
		const finalDisplayOrder = category ? category.displayOrder : undefined;
		const finalSpkCategory = category ? (category.spkCategory ?? null) : null;
		const finalIsActive = category ? category.isActive : true;

		const payload: ProductCategoryInput = {
			code: finalCode,
			name: trimmedName,
			type,
			spkCategory: finalSpkCategory,
			displayOrder: finalDisplayOrder,
			calculationType,
			description: description.trim() || null,
			isActive: finalIsActive
		};

		const validation = productCategorySchema.safeParse(payload);
		if (!validation.success) {
			const formatted = validation.error.format();
			fieldErrors = {
				name: formatted.name?._errors[0] ?? '',
				type: formatted.type?._errors[0] ?? '',
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
		} else {
			formError = 'Gagal menyimpan kategori produk. Silakan coba lagi.';
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && open && !isSubmitting) {
			onClose();
		}
	}}
/>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop with Fade Entrance Transition -->
		<button
			type="button"
			class="fixed inset-0 bg-black/50 backdrop-blur-sm"
			transition:fade={{ duration: 220 }}
			onclick={onClose}
			aria-label="Tutup modal"
		></button>

		<!-- Dialog Modal Container with Smooth Slide-In & Depth Transition -->
		<div
			class="relative z-10 w-full max-w-lg rounded-xl border border-border bg-app-surface p-6 shadow-xl"
			transition:modalSlideIn={{ duration: 280 }}
		>
			<!-- Header -->
			<div class="flex items-start justify-between border-b border-border pb-4">
				<div>
					<Typography variant="h3" as="h2" class="font-bold text-foreground">
						{category ? 'Edit Kategori Produk' : 'Tambah Kategori Produk Baru'}
					</Typography>
					<Typography variant="muted" as="p" class="mt-1 text-xs text-foreground-subtle">
						{category
							? 'Perbarui nama kelompok produk dan formula kalkulasi satuan cetak.'
							: 'Tentukan nama kelompok produk dan formula kalkulasi satuan cetak percetakan.'}
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
				<!-- Nama Kategori -->
				<div class="flex flex-col gap-1.5">
					<label for="category-name" class="text-xs font-semibold text-foreground">
						Nama Kategori <span class="text-danger">*</span>
					</label>
					<TextField
						id="category-name"
						bind:value={name}
						placeholder="Contoh: Large Format Outdoor, Digital Press A3+, Merchandise"
						invalid={Boolean(fieldErrors.name)}
						disabled={isSubmitting}
						class="w-full"
					/>
					{#if fieldErrors.name}
						<span class="text-xs text-danger">{fieldErrors.name}</span>
					{/if}
				</div>

				<!-- Tipe Kategori (Radio Button) -->
				<div role="group" aria-labelledby="category-type-label" class="flex flex-col gap-1.5">
					<span id="category-type-label" class="text-xs font-semibold text-foreground">
						Tipe Kategori <span class="text-danger">*</span>
					</span>
					<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
						<div
							role="presentation"
							class={cn(
								'cursor-pointer rounded-lg border p-3 transition-all',
								type === 'production'
									? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
									: 'border-border bg-surface-subtle/40 hover:border-border-hover hover:bg-surface-subtle'
							)}
							onclick={() => {
								if (!isSubmitting) type = 'production';
							}}
						>
							<Radio
								id="type-production"
								name="category-type"
								value="production"
								bind:group={type}
								disabled={isSubmitting}
								label="Produksi"
								description="Item cetak fisik yang diproses mesin percetakan."
								classes={{
									field: 'w-full cursor-pointer',
									label: 'font-medium text-foreground cursor-pointer text-xs',
									description: 'text-[11px] text-foreground-subtle cursor-pointer'
								}}
							/>
						</div>

						<div
							role="presentation"
							class={cn(
								'cursor-pointer rounded-lg border p-3 transition-all',
								type === 'non_production'
									? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
									: 'border-border bg-surface-subtle/40 hover:border-border-hover hover:bg-surface-subtle'
							)}
							onclick={() => {
								if (!isSubmitting) type = 'non_production';
							}}
						>
							<Radio
								id="type-non-production"
								name="category-type"
								value="non_production"
								bind:group={type}
								disabled={isSubmitting}
								label="Non Produksi"
								description="Jasa desain, instalasi/ongkos pasang, dan produk non-mesin."
								classes={{
									field: 'w-full cursor-pointer',
									label: 'font-medium text-foreground cursor-pointer text-xs',
									description: 'text-[11px] text-foreground-subtle cursor-pointer'
								}}
							/>
						</div>
					</div>
					{#if fieldErrors.type}
						<span class="text-xs text-danger">{fieldErrors.type}</span>
					{/if}
				</div>

				<!-- Satuan (Combobox) -->
				<div class="flex flex-col gap-1.5">
					<label for="category-calc" class="text-xs font-semibold text-foreground">
						Satuan <span class="text-danger">*</span>
					</label>
					<Combobox
						id="category-calc"
						options={calculationOptions}
						bind:value={calculationType}
						size="md"
						clearable={false}
						disabled={isSubmitting}
						invalid={Boolean(fieldErrors.calculationType)}
						labels={{
							placeholder: 'Pilih Satuan',
							searchPlaceholder: 'Cari satuan...',
							empty: 'Satuan tidak ditemukan'
						}}
						classes={{ content: 'z-60' }}
						class="w-full"
					/>
					{#if fieldErrors.calculationType}
						<span class="text-xs text-danger">{fieldErrors.calculationType}</span>
					{/if}
					<span class="text-[11px] text-foreground-subtle">
						{CALCULATION_TYPES.find((c) => c.value === calculationType)?.description}
					</span>
				</div>

				<!-- Keterangan (Textarea) -->
				<div class="flex flex-col gap-1.5">
					<label for="category-desc" class="text-xs font-semibold text-foreground">
						Keterangan (Opsional)
					</label>
					<Textarea
						id="category-desc"
						bind:value={description}
						placeholder="Catatan tambahan mengenai kategori bahan atau armada mesin..."
						disabled={isSubmitting}
						invalid={Boolean(fieldErrors.description)}
						rows={3}
						maxlength={255}
						class="w-full"
					/>
					{#if fieldErrors.description}
						<span class="text-xs text-danger">{fieldErrors.description}</span>
					{/if}
				</div>

				<!-- Footer Buttons -->
				<div class="mt-2 flex items-center justify-end gap-2 border-t border-border pt-4">
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
