<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import { NumberField } from 'dystopia-linear-lib/components/number-field';
	import { Textarea } from 'dystopia-linear-lib/components/textarea';
	import { Radio } from 'dystopia-linear-lib/components/radio';
	import { Switch } from 'dystopia-linear-lib/components/switch';
	import { Combobox, type ComboboxOption } from 'dystopia-linear-lib/components/combobox';
	import { cn } from 'dystopia-linear-lib/utils/cn';
	import IconX from '~icons/lucide/x';
	import IconCheck from '~icons/lucide/check';
	import IconArrowRight from '~icons/lucide/arrow-right';
	import IconArrowLeft from '~icons/lucide/arrow-left';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconLayers from '~icons/lucide/layers';
	import IconSlidersHorizontal from '~icons/lucide/sliders-horizontal';
	import IconBox from '~icons/lucide/box';
	import IconTag from '~icons/lucide/tag';
	import IconUser from '~icons/lucide/user';
	import IconUsers from '~icons/lucide/users';
	import IconTrash from '~icons/lucide/trash';
	import IconPlus from '~icons/lucide/plus';
	import {
		type Product,
		type ProductInput,
		type CalculationType,
		type ProductAttributeSelection,
		type PriceTierItem,
		type VariantTierPricing,
		type ProductTierPricing,
		CALCULATION_TYPES,
		formatCurrency,
		getCalculationUnit,
		generateProductCode
	} from '../../domain/product.entity';
	import {
		productSchema,
		productStep1Schema,
		productStep3Schema
	} from '../../domain/product.schema';
	import { attributeVariantStore } from '$features/attribute-variants/application/attribute-variant.store.svelte';

	interface CategoryOptionItem {
		id: string;
		name: string;
	}

	interface Props {
		open: boolean;
		product?: Product | null;
		categories?: CategoryOptionItem[];
		onSave: (input: ProductInput) => Promise<boolean>;
		onClose: () => void;
	}

	let {
		open = $bindable(false),
		product = null,
		categories = [],
		onSave,
		onClose
	}: Props = $props();

	type StepId = 1 | 2 | 3;
	let currentStep = $state<StepId>(1);

	const steps = [
		{ id: 1 as StepId, title: 'Informasi Produk', desc: 'Identitas & Model Hitung' },
		{ id: 2 as StepId, title: 'Konfigurasi Varian', desc: 'Atribut & Spesifikasi' },
		{ id: 3 as StepId, title: 'Harga & Tiering', desc: 'Retail & Reseller B2B' }
	];

	// Step 1: Info Produk State (Hanya nama, kategori, satuan, deskripsi)
	let name = $state('');
	let categoryId = $state<string>('');
	let calculationType = $state<CalculationType>('square_meter');
	let description = $state('');

	// Nilai tersimpan / default untuk spesifikasi produk
	let code = $state('');
	let baseMaterial = $state('');
	let minOrderQty = $state(1);
	let leadTimeHours = $state<number | null>(null);
	let isActive = $state(true);

	// Step 2: Konfigurasi Varian State (1 Produk = 1 Atribut)
	let hasVariants = $state(false);
	let selectedAttributeId = $state<string>('');
	let selectedVariantIds = $state<string[]>([]);

	const selectedAttribute = $derived.by(() => {
		if (!selectedAttributeId) return null;
		return attributeVariantStore.items.find((a) => a.id === selectedAttributeId) ?? null;
	});

	// Step 3: Matriks Harga & Tiering Varian State
	interface FormTierItem {
		minQty: number | undefined;
		maxQty: number | undefined;
		price: number | undefined;
	}

	interface FormVariantTier {
		variantId: string;
		variantName: string;
		resellerTiers: FormTierItem[];
		endUserTiers: FormTierItem[];
	}

	let variantTiers = $state<FormVariantTier[]>([]);

	let isSubmitting = $state(false);
	let formError = $state<string | null>(null);
	let fieldErrors = $state<Record<string, string>>({});

	function modalSlideIn(node: Element, { duration = 280 } = {}) {
		return {
			duration,
			css: (t: number) => {
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
			attributeVariantStore.load();
			currentStep = 1;

			if (product) {
				name = product.name;
				code = product.code;
				categoryId = product.categoryId;
				baseMaterial = product.baseMaterial ?? '';
				calculationType = product.calculationType;
				minOrderQty = product.minOrderQty;
				leadTimeHours = product.leadTimeHours;
				description = product.description ?? '';
				isActive = product.isActive;

				// Step 3 values (Matriks Harga & Tiering Varian)
				if (product.tierPricing?.variantTiers && product.tierPricing.variantTiers.length > 0) {
					variantTiers = product.tierPricing.variantTiers.map((vt) => ({
						variantId: vt.variantId,
						variantName: vt.variantName,
						resellerTiers: vt.resellerTiers.map((t) => ({
							minQty: t.minQty,
							maxQty: t.maxQty,
							price: t.price
						})),
						endUserTiers: vt.endUserTiers.map((t) => ({
							minQty: t.minQty,
							maxQty: t.maxQty,
							price: t.price
						}))
					}));
				} else {
					const defaultEndUserPrice = product.basePrice || 0;
					const defaultResellerPrice = product.tierPricing?.resellerPrice ?? defaultEndUserPrice;
					variantTiers = [
						{
							variantId: 'default',
							variantName: 'Default',
							resellerTiers: [{ minQty: 1, maxQty: 999999, price: defaultResellerPrice }],
							endUserTiers: [{ minQty: 1, maxQty: 999999, price: defaultEndUserPrice }]
						}
					];
				}

				// Step 2 values (1 Product = 1 Attribute)
				if (product.assignedAttributes && product.assignedAttributes.length > 0) {
					hasVariants = true;
					const primaryAttr = product.assignedAttributes[0];
					selectedAttributeId = primaryAttr.attributeId;
					selectedVariantIds = [...primaryAttr.selectedVariantIds];
				} else {
					hasVariants = false;
					selectedAttributeId = '';
					selectedVariantIds = [];
				}
			} else {
				name = '';
				code = '';
				categoryId = categories.length > 0 ? categories[0].id : '';
				baseMaterial = '';
				calculationType = 'square_meter';
				minOrderQty = 1;
				leadTimeHours = null;
				description = '';
				isActive = true;

				hasVariants = false;
				selectedAttributeId = '';
				selectedVariantIds = [];
				variantTiers = [
					{
						variantId: 'default',
						variantName: 'Default',
						resellerTiers: [{ minQty: 1, maxQty: 999999, price: 0 }],
						endUserTiers: [{ minQty: 1, maxQty: 999999, price: 0 }]
					}
				];
			}
			formError = null;
			fieldErrors = {};
		}
	});

	const categoryOptions = $derived.by<ComboboxOption<string>[]>(() => {
		return categories.map((c) => ({
			value: c.id,
			label: c.name
		}));
	});

	const attributeOptions = $derived.by<ComboboxOption<string>[]>(() => {
		return attributeVariantStore.items.map((attr) => ({
			value: attr.id,
			label: `${attr.name} (${attr.variants.length} opsi)`
		}));
	});

	// Step 1 Validation & Proceed to Step 2
	function handleNextToStep2() {
		formError = null;
		fieldErrors = {};

		const step1Data = {
			name: name.trim(),
			categoryId,
			calculationType,
			description: description.trim() || null
		};

		const validation = productStep1Schema.safeParse(step1Data);
		if (!validation.success) {
			const errors: Record<string, string> = {};
			for (const issue of validation.error.issues) {
				const field = issue.path[0] as string;
				if (field && !errors[field]) {
					errors[field] = issue.message;
				}
			}
			fieldErrors = errors;
			formError = 'Mohon lengkapi data produk pada Step 1 terlebih dahulu.';
			return;
		}

		currentStep = 2;
	}

	// Step 2 Proceed to Step 3
	function handleNextToStep3() {
		formError = null;
		fieldErrors = {};

		if (hasVariants) {
			if (!selectedAttributeId) {
				fieldErrors = { attributeId: 'Mohon pilih atribut varian terlebih dahulu.' };
				formError = 'Mohon pilih atribut varian untuk produk ini.';
				return;
			}
			if (selectedVariantIds.length === 0) {
				formError = 'Mohon pilih minimal satu opsi varian aktif untuk produk ini.';
				return;
			}
		}

		syncVariantTiers();
		currentStep = 3;
	}

	function syncVariantTiers() {
		if (!hasVariants || !selectedAttribute) {
			if (variantTiers.length === 1 && variantTiers[0].variantId === 'default') {
				return;
			}
			variantTiers = [
				{
					variantId: 'default',
					variantName: 'Default',
					resellerTiers: [{ minQty: 1, maxQty: 999999, price: 0 }],
					endUserTiers: [{ minQty: 1, maxQty: 999999, price: 0 }]
				}
			];
			return;
		}

		const activeVariants = selectedAttribute.variants.filter((v) =>
			selectedVariantIds.includes(v.id)
		);

		const existingMap = new Map(variantTiers.map((vt) => [vt.variantId, vt]));
		const updatedList: FormVariantTier[] = [];

		for (const v of activeVariants) {
			const existing = existingMap.get(v.id);
			if (existing) {
				updatedList.push(existing);
			} else {
				updatedList.push({
					variantId: v.id,
					variantName: v.name,
					resellerTiers: [{ minQty: 1, maxQty: 999999, price: 0 }],
					endUserTiers: [{ minQty: 1, maxQty: 999999, price: 0 }]
				});
			}
		}

		variantTiers = updatedList;
	}

	function addTier(vIndex: number, type: 'reseller' | 'endUser') {
		const targetVariant = variantTiers[vIndex];
		if (!targetVariant) return;

		const list = type === 'reseller' ? targetVariant.resellerTiers : targetVariant.endUserTiers;
		const lastIndex = list.length - 1;
		const lastTier = list[lastIndex];

		let newMin = 1;
		if (lastTier) {
			const parsedMax = Number(lastTier.maxQty) || 1;
			const parsedMin = Number(lastTier.minQty) || 1;
			if (parsedMax >= 999999) {
				const suggestedMax = Math.max(parsedMin, parsedMin + 9);
				lastTier.maxQty = suggestedMax;
				newMin = suggestedMax + 1;
			} else {
				newMin = parsedMax + 1;
			}
		}

		const newTier: FormTierItem = {
			minQty: newMin,
			maxQty: 999999,
			price: lastTier ? lastTier.price : 0
		};

		if (type === 'reseller') {
			targetVariant.resellerTiers = [...targetVariant.resellerTiers, newTier];
		} else {
			targetVariant.endUserTiers = [...targetVariant.endUserTiers, newTier];
		}
	}

	function removeTier(vIndex: number, type: 'reseller' | 'endUser', tIndex: number) {
		const targetVariant = variantTiers[vIndex];
		if (!targetVariant) return;

		if (type === 'reseller') {
			if (targetVariant.resellerTiers.length <= 1) return;
			targetVariant.resellerTiers = targetVariant.resellerTiers.filter((_, idx) => idx !== tIndex);
		} else {
			if (targetVariant.endUserTiers.length <= 1) return;
			targetVariant.endUserTiers = targetVariant.endUserTiers.filter((_, idx) => idx !== tIndex);
		}
	}

	function handleAttributeChange(attrId: string | number | (string | number)[] | undefined) {
		const resolvedId = typeof attrId === 'string' ? attrId : '';
		selectedAttributeId = resolvedId;
		fieldErrors = { ...fieldErrors, attributeId: '' };
		const found = attributeVariantStore.items.find((a) => a.id === resolvedId);
		if (found) {
			selectedVariantIds = found.variants.map((v) => v.id);
		} else {
			selectedVariantIds = [];
		}
	}

	function toggleVariantSelection(variantId: string) {
		if (selectedVariantIds.includes(variantId)) {
			selectedVariantIds = selectedVariantIds.filter((id) => id !== variantId);
		} else {
			selectedVariantIds = [...selectedVariantIds, variantId];
		}
	}

	// Final Submit on Step 3
	async function handleFinalSubmit(e: SubmitEvent) {
		e.preventDefault();
		formError = null;
		fieldErrors = {};

		// Compile variant tiers & prices
		const compiledVariantTiers: VariantTierPricing[] = [];
		let primaryBasePrice = 0;
		let primaryResellerPrice: number | null = null;

		for (const vt of variantTiers) {
			const resellerTiers: PriceTierItem[] = vt.resellerTiers.map((t) => ({
				minQty: Number(t.minQty) || 1,
				maxQty: Number(t.maxQty) || 999999,
				price: Number(t.price) || 0
			}));

			const endUserTiers: PriceTierItem[] = vt.endUserTiers.map((t) => ({
				minQty: Number(t.minQty) || 1,
				maxQty: Number(t.maxQty) || 999999,
				price: Number(t.price) || 0
			}));

			if (compiledVariantTiers.length === 0) {
				primaryBasePrice = endUserTiers[0]?.price ?? 0;
				primaryResellerPrice = resellerTiers[0]?.price ?? null;
			}

			compiledVariantTiers.push({
				variantId: vt.variantId,
				variantName: vt.variantName,
				resellerTiers,
				endUserTiers
			});
		}

		const tierPricing: ProductTierPricing = {
			retailPrice: primaryBasePrice,
			resellerPrice: primaryResellerPrice,
			variantTiers: compiledVariantTiers
		};

		const step3Validation = productStep3Schema.safeParse({
			basePrice: primaryBasePrice,
			tierPricing
		});

		if (!step3Validation.success) {
			formError = 'Mohon periksa kembali input matriks harga & tiering pada Step 3.';
			return;
		}

		// Compile assigned attributes (1 Product = 1 Attribute model)
		let assignedAttributes: ProductAttributeSelection[] | null = null;
		if (hasVariants && selectedAttribute && selectedVariantIds.length > 0) {
			assignedAttributes = [
				{
					attributeId: selectedAttribute.id,
					attributeName: selectedAttribute.name,
					selectedVariantIds: [...selectedVariantIds]
				}
			];
		}

		const resolvedCode = code.trim() || generateProductCode(name);
		const targetCategory = categories.find((c) => c.id === categoryId);
		const categoryName = targetCategory ? targetCategory.name : 'Tanpa Kategori';

		const rawInput: ProductInput = {
			name: name.trim(),
			code: resolvedCode,
			categoryId,
			categoryName,
			baseMaterial: baseMaterial.trim() || null,
			calculationType,
			basePrice: primaryBasePrice,
			tierPricing,
			assignedAttributes,
			minOrderQty: minOrderQty || 1,
			leadTimeHours: leadTimeHours !== null ? leadTimeHours : null,
			description: description.trim() || null,
			isActive
		};

		const finalValidation = productSchema.safeParse(rawInput);
		if (!finalValidation.success) {
			formError = 'Terdapat data produk yang belum valid. Mohon periksa kembali.';
			return;
		}

		isSubmitting = true;
		const success = await onSave(rawInput);
		isSubmitting = false;

		if (success) {
			onClose();
		}
	}

	const unitLabel = $derived(getCalculationUnit(calculationType));

	const totalConfiguredVariants = $derived.by(() => {
		if (!hasVariants) return 0;
		return selectedVariantIds.length;
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
			onclick={onClose}
			aria-label="Tutup dialog"
			transition:fade={{ duration: 220 }}
		></button>

		<!-- Dialog Body with Stepper (Widened to max-w-4xl) -->
		<div
			class="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-border bg-app-surface shadow-xl"
			transition:modalSlideIn={{ duration: 280 }}
		>
			<!-- Top Header: Title & Close Button matching Master Data standard -->
			<div class="flex items-start justify-between border-b border-border px-6 py-4">
				<div class="flex items-start gap-3">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary"
					>
						<IconLayers class="size-5" />
					</div>
					<div>
						<Typography variant="h3" as="h2" class="font-bold text-foreground">
							{product ? 'Edit Produk Cetak' : 'Tambah Produk Baru'}
						</Typography>
						<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle">
							{product
								? `Perbarui spesifikasi, varian, dan tier harga untuk ${product.code}.`
								: 'Konfigurasi produk bertahap dari identitas, varian, hingga harga kemitraan.'}
						</Typography>
					</div>
				</div>
				<button
					type="button"
					onclick={onClose}
					class="rounded-lg p-1.5 text-foreground-subtle transition-colors hover:bg-surface-hover hover:text-foreground"
					aria-label="Tutup"
				>
					<IconX class="size-5" />
				</button>
			</div>

			<!-- Stepper Progress Header with unified solid border-border divider -->
			<div class="grid grid-cols-3 border-b border-border bg-surface-subtle/30 px-6 py-3">
				{#each steps as s, idx (s.id)}
					{@const isCurrent = currentStep === s.id}
					{@const isCompleted = currentStep > s.id}

					<div class="flex items-center gap-2.5 {idx > 0 ? 'pl-2 sm:pl-4' : ''}">
						<div
							class={cn(
								'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all',
								isCompleted
									? 'bg-primary text-white'
									: isCurrent
										? 'border border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
										: 'border border-border bg-surface text-foreground-subtle'
							)}
						>
							{#if isCompleted}
								<IconCheck class="size-3.5" />
							{:else}
								<span>{s.id}</span>
							{/if}
						</div>
						<div class="hidden flex-col leading-tight sm:flex">
							<span
								class={cn(
									'text-xs font-medium',
									isCurrent ? 'font-bold text-foreground' : 'text-foreground-subtle'
								)}
							>
								{s.title}
							</span>
							<span class="text-[10px] text-foreground-faint">{s.desc}</span>
						</div>
					</div>
				{/each}
			</div>

			<!-- Main Form Content Area (Scrollable per step) -->
			<form
				id="product-stepper-form"
				onsubmit={handleFinalSubmit}
				class="flex-1 overflow-y-auto px-6 py-5"
			>
				{#if formError}
					<div
						class="mb-4 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/10 px-3.5 py-2.5 text-xs text-danger"
					>
						<IconAlertCircle class="size-4 shrink-0" />
						<span>{formError}</span>
					</div>
				{/if}

				<!-- ============================================== -->
				<!-- STEP 1 : INFORMASI PRODUK                      -->
				<!-- ============================================== -->
				{#if currentStep === 1}
					<div class="flex flex-col gap-4">
						<!-- 1. Nama Produk -->
						<div class="flex flex-col gap-1.5">
							<label for="product-name" class="text-xs font-semibold text-foreground">
								Nama Produk <span class="text-danger">*</span>
							</label>
							<TextField
								id="product-name"
								placeholder="Contoh: Banner Flexy Outdoor 280g"
								bind:value={name}
								invalid={Boolean(fieldErrors.name)}
								disabled={isSubmitting}
								class="w-full"
							/>
							{#if fieldErrors.name}
								<span class="text-xs text-danger">{fieldErrors.name}</span>
							{/if}
						</div>

						<!-- 2. Kategori Produk -->
						<div class="flex flex-col gap-1.5">
							<label for="product-category" class="text-xs font-semibold text-foreground">
								Kategori Produk <span class="text-danger">*</span>
							</label>
							{#if categoryOptions.length > 0}
								<Combobox
									id="product-category"
									options={categoryOptions}
									bind:value={categoryId}
									size="md"
									clearable={false}
									labels={{
										placeholder: 'Pilih Kategori Produk',
										searchPlaceholder: 'Cari kategori...',
										empty: 'Tidak ada kategori ditemukan'
									}}
									classes={{ content: 'z-60' }}
									class="w-full"
								/>
							{:else}
								<TextField
									id="product-category"
									placeholder="Masukkan ID / Kategori"
									bind:value={categoryId}
									disabled={isSubmitting}
									class="w-full"
								/>
							{/if}
							{#if fieldErrors.categoryId}
								<span class="text-xs text-danger">{fieldErrors.categoryId}</span>
							{/if}
						</div>

						<!-- 3. Satuan / Model Perhitungan Satuan -->
						<div role="group" aria-labelledby="calc-model-label" class="flex flex-col gap-1.5">
							<span id="calc-model-label" class="text-xs font-semibold text-foreground">
								Satuan Hitung <span class="text-danger">*</span>
							</span>
							<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
								{#each CALCULATION_TYPES as ct (ct.value)}
									<div
										role="presentation"
										class={cn(
											'cursor-pointer rounded-lg border p-3 transition-all',
											calculationType === ct.value
												? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
												: 'border-border bg-surface-subtle/40 hover:border-border-hover hover:bg-surface-subtle'
										)}
										onclick={() => {
											if (!isSubmitting) calculationType = ct.value;
										}}
									>
										<Radio
											id="calc-{ct.value}"
											name="calculation-type"
											value={ct.value}
											bind:group={calculationType}
											disabled={isSubmitting}
											label={ct.label}
											description={ct.description}
											classes={{
												field: 'w-full cursor-pointer',
												label: 'font-medium text-foreground cursor-pointer text-xs',
												description: 'text-[11px] text-foreground-subtle cursor-pointer'
											}}
										/>
									</div>
								{/each}
							</div>
						</div>

						<!-- 4. Deskripsi -->
						<div class="flex flex-col gap-1.5">
							<label for="product-desc" class="text-xs font-semibold text-foreground">
								Deskripsi (Opsional)
							</label>
							<Textarea
								id="product-desc"
								placeholder="Catatan pengerjaan atau spesifikasi teknis produk..."
								bind:value={description}
								disabled={isSubmitting}
								rows={3}
								class="w-full resize-none text-xs"
							/>
						</div>
					</div>
				{/if}

				<!-- ============================================== -->
				<!-- STEP 2 : KONFIGURASI VARIAN                    -->
				<!-- ============================================== -->
				{#if currentStep === 2}
					<div class="flex flex-col gap-4">
						<!-- Toggle Switch Card -->
						<div
							class="flex items-center justify-between rounded-xl border border-border bg-surface-subtle/20 p-4 transition-colors"
						>
							<div class="flex flex-col gap-1 pr-4">
								<span class="text-xs font-semibold text-foreground sm:text-sm">
									Produk memiliki variasi (Varian)?
								</span>
								<span class="text-xs leading-relaxed text-foreground-subtle">
									Aktifkan jika produk memiliki opsi variasi (seperti: 1 Sisi/2 Sisi). Matikan jika
									produk bersifat standar (tanpa varian).
								</span>
							</div>
							<Switch id="toggle-has-variants" bind:checked={hasVariants} disabled={isSubmitting} />
						</div>

						<!-- State A: Toggle OFF - Produk Tanpa Varian (Screenshot 1) -->
						{#if !hasVariants}
							<div
								class="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-subtle/10 px-6 py-12 text-center"
							>
								<div
									class="mb-3 flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger"
								>
									<IconBox class="size-6 text-danger" />
								</div>
								<h4 class="text-sm font-semibold text-foreground">Produk Tanpa Varian Terpilih</h4>
								<p class="mt-1.5 max-w-md text-xs leading-relaxed text-foreground-subtle">
									Sistem akan membuat satu varian bawaan secara otomatis bernama <span
										class="font-semibold text-danger">"Default"</span
									> dengan daftar attributes kosong. Anda dapat langsung melangkah ke penentuan harga
									di Step 3.
								</p>
							</div>
						{:else}
							<!-- State B: Toggle ON - 1 Product = 1 Attribute (Screenshot 2) -->
							<div class="flex flex-col gap-4">
								<!-- Dropdown Pilih Atribut Menggunakan Combobox -->
								<div class="flex flex-col gap-1.5">
									<label for="select-attribute" class="text-xs font-semibold text-foreground">
										Pilih Atribut <span class="text-danger">*</span>
									</label>
									<Combobox
										id="select-attribute"
										options={attributeOptions}
										bind:value={selectedAttributeId}
										onValueChange={handleAttributeChange}
										disabled={isSubmitting || attributeVariantStore.items.length === 0}
										size="md"
										clearable={false}
										labels={{
											placeholder: '-- Pilih Atribut --',
											searchPlaceholder: 'Cari atribut varian...',
											empty: 'Tidak ada atribut ditemukan'
										}}
										classes={{ content: 'z-60' }}
										class="w-full"
									/>
									{#if fieldErrors.attributeId}
										<span class="text-xs text-danger">{fieldErrors.attributeId}</span>
									{/if}
								</div>

								<!-- Opsi Varian Card saat Atribut Dipilih (Sesuai Desain Baru) -->
								{#if selectedAttribute}
									<div class="rounded-xl border border-border bg-app-surface p-4">
										<div
											class="mb-3.5 flex items-start justify-between border-b border-border pb-3"
										>
											<div>
												<span class="text-xs font-bold text-foreground sm:text-sm">
													Opsi Nilai untuk {selectedAttribute.name}:
												</span>
												<p class="mt-0.5 text-xs text-foreground-subtle">
													Klik opsi untuk mengaktifkan atau menonaktifkannya pada produk ini.
												</p>
											</div>
											<div class="shrink-0">
												<span
													class="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
												>
													{selectedVariantIds.length} terpilih
												</span>
											</div>
										</div>

										{#if selectedAttribute.variants.length > 0}
											<div class="flex flex-wrap gap-2">
												{#each selectedAttribute.variants as v (v.id)}
													{@const isVariantActive = selectedVariantIds.includes(v.id)}
													<button
														type="button"
														onclick={() => toggleVariantSelection(v.id)}
														class={cn(
															'flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
															isVariantActive
																? 'border-primary/70 bg-primary/10 text-primary shadow-2xs'
																: 'border-border/80 bg-surface-subtle/30 text-foreground-subtle hover:border-border hover:bg-surface-subtle hover:text-foreground'
														)}
													>
														<span
															class={cn(
																'size-2 shrink-0 rounded-full transition-colors',
																isVariantActive ? 'bg-primary' : 'bg-foreground-subtle/40'
															)}
														></span>
														<span>{v.name}</span>
													</button>
												{/each}
											</div>
										{:else}
											<div class="py-4 text-center text-xs text-foreground-faint italic">
												Atribut ini tidak memiliki opsi varian di Master Data.
											</div>
										{/if}
									</div>
								{:else if attributeVariantStore.items.length === 0}
									<div
										class="flex flex-col items-center justify-center rounded-xl border border-border bg-surface-subtle/10 py-8 text-center"
									>
										<IconSlidersHorizontal class="size-8 text-foreground-faint" />
										<span class="mt-2 text-xs font-semibold text-foreground">
											Belum Ada Master Data Atribut
										</span>
										<p class="mt-1 max-w-sm text-[11px] text-foreground-subtle">
											Tambahkan atribut terlebih dahulu melalui menu Master Data Atribut & Varian.
										</p>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/if}

				<!-- ============================================== -->
				<!-- STEP 3 : MATRIKS HARGA & TIERING VARIAN        -->
				<!-- ============================================== -->
				{#if currentStep === 3}
					<div class="flex flex-col gap-5">
						<!-- Header Matriks Harga & Tiering Varian -->
						<div class="flex items-start gap-3">
							<div
								class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"
							>
								<IconTag class="size-5 text-primary" />
							</div>
							<div>
								<h3 class="text-base font-bold text-foreground">Matriks Harga & Tiering Varian</h3>
								<p class="mt-0.5 text-xs text-foreground-subtle">
									Tentukan tier harga grosir bertingkat secara terpisah untuk kategori kemitraan
									Reseller dan End User.
								</p>
							</div>
						</div>

						<!-- Daftar Card Konfigurasi Per Varian -->
						<div class="flex flex-col gap-4">
							{#each variantTiers as vTier, vIndex (vTier.variantId)}
								<div
									class="flex flex-col gap-4 rounded-xl border border-border bg-app-surface p-4 shadow-2xs sm:p-5"
								>
									<!-- Variant Header Info -->
									<div class="flex items-center gap-3">
										<div
											class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-sm font-bold text-primary"
										>
											{vIndex + 1}
										</div>
										<div>
											<h4 class="text-sm font-bold text-foreground">
												Varian: {vTier.variantName}
											</h4>
											<p class="text-xs text-foreground-subtle">
												Konfigurasi harga bertingkat untuk opsi varian cetak ini.
											</p>
										</div>
									</div>

									<!-- 2 Kolom Grid: Reseller & End User -->
									<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
										<!-- Kolom 1: TIER HARGA RESELLER -->
										<div
											class="flex flex-col justify-between rounded-xl border border-border/70 bg-surface-subtle/20 p-4"
										>
											<div class="flex flex-col gap-3">
												<div class="flex items-center gap-2">
													<IconUsers class="size-4 text-primary" />
													<span class="text-xs font-bold tracking-wider text-primary uppercase">
														TIER HARGA RESELLER
													</span>
												</div>

												<!-- Header Kolom Tier -->
												<div
													class="grid grid-cols-12 gap-2 px-1 text-[10px] font-bold tracking-wider text-foreground-subtle uppercase"
												>
													<div class="col-span-3">MIN QTY</div>
													<div class="col-span-4">MAX QTY</div>
													<div class="col-span-4">HARGA (RP)</div>
													<div class="col-span-1"></div>
												</div>

												<!-- Baris Tier Reseller -->
												<div class="flex flex-col gap-2">
													{#each vTier.resellerTiers as tier, tIndex (tIndex)}
														<div class="grid grid-cols-12 items-center gap-2">
															<div class="col-span-3">
																<NumberField
																	bind:value={tier.minQty}
																	thousandSeparator
																	disabled={isSubmitting}
																	classes={{ input: 'text-center text-xs' }}
																/>
															</div>
															<div class="col-span-4">
																<NumberField
																	bind:value={tier.maxQty}
																	thousandSeparator
																	disabled={isSubmitting}
																	classes={{ input: 'text-center text-xs' }}
																/>
															</div>
															<div class="col-span-4">
																<NumberField
																	bind:value={tier.price}
																	thousandSeparator
																	disabled={isSubmitting}
																	classes={{ input: 'text-right text-xs font-bold text-primary' }}
																/>
															</div>
															<div class="col-span-1 flex justify-center">
																{#if vTier.resellerTiers.length > 1}
																	<button
																		type="button"
																		onclick={() => removeTier(vIndex, 'reseller', tIndex)}
																		class="rounded p-1 text-foreground-subtle transition-colors hover:bg-danger/10 hover:text-danger"
																		title="Hapus Tier"
																	>
																		<IconTrash class="size-3.5" />
																	</button>
																{/if}
															</div>
														</div>
													{/each}
												</div>
											</div>

											<!-- Tombol Tambah Tier Reseller -->
											<button
												type="button"
												onclick={() => addTier(vIndex, 'reseller')}
												class="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border/80 bg-surface-subtle/30 py-2 text-xs font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
											>
												<IconPlus class="size-3.5" />
												<span>Tambah Tier Reseller</span>
											</button>
										</div>

										<!-- Kolom 2: TIER HARGA END USER -->
										<div
											class="flex flex-col justify-between rounded-xl border border-border/70 bg-surface-subtle/20 p-4"
										>
											<div class="flex flex-col gap-3">
												<div class="flex items-center gap-2">
													<IconUser class="size-4 text-primary" />
													<span class="text-xs font-bold tracking-wider text-primary uppercase">
														TIER HARGA END USER
													</span>
												</div>

												<!-- Header Kolom Tier -->
												<div
													class="grid grid-cols-12 gap-2 px-1 text-[10px] font-bold tracking-wider text-foreground-subtle uppercase"
												>
													<div class="col-span-3">MIN QTY</div>
													<div class="col-span-4">MAX QTY</div>
													<div class="col-span-4">HARGA (RP)</div>
													<div class="col-span-1"></div>
												</div>

												<!-- Baris Tier End User -->
												<div class="flex flex-col gap-2">
													{#each vTier.endUserTiers as tier, tIndex (tIndex)}
														<div class="grid grid-cols-12 items-center gap-2">
															<div class="col-span-3">
																<NumberField
																	bind:value={tier.minQty}
																	thousandSeparator
																	disabled={isSubmitting}
																	classes={{ input: 'text-center text-xs' }}
																/>
															</div>
															<div class="col-span-4">
																<NumberField
																	bind:value={tier.maxQty}
																	thousandSeparator
																	disabled={isSubmitting}
																	classes={{ input: 'text-center text-xs' }}
																/>
															</div>
															<div class="col-span-4">
																<NumberField
																	bind:value={tier.price}
																	thousandSeparator
																	disabled={isSubmitting}
																	classes={{ input: 'text-right text-xs font-bold text-primary' }}
																/>
															</div>
															<div class="col-span-1 flex justify-center">
																{#if vTier.endUserTiers.length > 1}
																	<button
																		type="button"
																		onclick={() => removeTier(vIndex, 'endUser', tIndex)}
																		class="rounded p-1 text-foreground-subtle transition-colors hover:bg-danger/10 hover:text-danger"
																		title="Hapus Tier"
																	>
																		<IconTrash class="size-3.5" />
																	</button>
																{/if}
															</div>
														</div>
													{/each}
												</div>
											</div>

											<!-- Tombol Tambah Tier End User -->
											<button
												type="button"
												onclick={() => addTier(vIndex, 'endUser')}
												class="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border/80 bg-surface-subtle/30 py-2 text-xs font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
											>
												<IconPlus class="size-3.5" />
												<span>Tambah Tier End User</span>
											</button>
										</div>
									</div>
								</div>
							{/each}
						</div>

						<!-- Ringkasan Konfigurasi -->
						<div
							class="rounded-xl border border-border bg-surface-subtle/30 p-3.5 text-xs text-foreground-subtle"
						>
							<div class="mb-1.5 font-semibold text-foreground">Ringkasan Konfigurasi Produk:</div>
							<div class="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
								<div>
									<span class="block text-foreground-faint">Nama:</span>
									<span class="font-medium text-foreground">{name || '-'}</span>
								</div>
								<div>
									<span class="block text-foreground-faint">Model Hitung:</span>
									<span class="font-medium text-foreground">{unitLabel}</span>
								</div>
								<div>
									<span class="block text-foreground-faint">Varian Aktif:</span>
									<span class="font-medium text-foreground">
										{#if !hasVariants}
											Default (1 SKU)
										{:else}
											{totalConfiguredVariants} Varian ({selectedAttribute?.name ?? '-'})
										{/if}
									</span>
								</div>
								<div>
									<span class="block text-foreground-faint">Patokan Retail:</span>
									<span class="font-bold text-primary">
										{formatCurrency(variantTiers[0]?.endUserTiers[0]?.price ?? 0)}
									</span>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</form>

			<!-- Stepper Navigation Footer -->
			<div class="flex items-center justify-between border-t border-border px-6 py-4">
				{#if currentStep === 1}
					<Button type="button" variant="ghost" size="sm" onclick={onClose} disabled={isSubmitting}>
						Batal
					</Button>
					<Button
						type="button"
						variant="default"
						size="sm"
						onclick={handleNextToStep2}
						class="gap-1.5"
					>
						<span>Lanjut: Konfigurasi Varian</span>
						<IconArrowRight class="size-4" />
					</Button>
				{:else if currentStep === 2}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => (currentStep = 1)}
						class="gap-1.5"
					>
						<IconArrowLeft class="size-4" />
						<span>Kembali</span>
					</Button>
					<Button
						type="button"
						variant="default"
						size="sm"
						onclick={handleNextToStep3}
						class="gap-1.5"
					>
						<span>Lanjut: Harga & Tiering</span>
						<IconArrowRight class="size-4" />
					</Button>
				{:else if currentStep === 3}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => (currentStep = 2)}
						disabled={isSubmitting}
						class="gap-1.5"
					>
						<IconArrowLeft class="size-4" />
						<span>Kembali</span>
					</Button>
					<Button
						type="submit"
						form="product-stepper-form"
						variant="default"
						size="sm"
						isLoading={isSubmitting}
						class="gap-1.5"
					>
						<IconCheck class="size-4" />
						<span>{product ? 'Simpan Perubahan' : 'Simpan Produk Cetak'}</span>
					</Button>
				{/if}
			</div>
		</div>
	</div>
{/if}
