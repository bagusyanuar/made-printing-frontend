<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import IconX from '~icons/lucide/x';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconGripVertical from '~icons/lucide/grip-vertical';
	import {
		generateSlug,
		type ProductAttribute,
		type ProductAttributeInput,
		type ProductAttributeVariantBatchItem
	} from '../../domain/attribute-variant.entity';
	import { attributeInputSchema } from '../../domain/attribute-variant.schema';

	interface Props {
		open: boolean;
		attribute?: ProductAttribute | null;
		onSave: (input: ProductAttributeInput) => Promise<boolean>;
		onClose: () => void;
	}

	let { open = $bindable(false), attribute = null, onSave, onClose }: Props = $props();

	let name = $state('');
	let variantInput = $state('');
	let variants = $state<string[]>([]);

	let draggedIndex = $state<number | null>(null);
	let dragOverIndex = $state<number | null>(null);

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
			if (attribute) {
				name = attribute.name;
				variants = [...attribute.variants]
					.sort((a, b) => a.displayOrder - b.displayOrder)
					.map((v) => v.name);
			} else {
				name = '';
				variants = [];
			}
			variantInput = '';
			draggedIndex = null;
			dragOverIndex = null;
			formError = null;
			fieldErrors = {};
		}
	});

	function addVariant() {
		const trimmed = variantInput.trim();
		if (!trimmed) return;

		// Hindari duplikasi case-insensitive
		if (variants.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
			fieldErrors.variant = 'Opsi varian ini sudah ada dalam daftar.';
			return;
		}

		variants = [...variants, trimmed];
		variantInput = '';
		fieldErrors.variant = '';
	}

	function handleVariantKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addVariant();
		}
	}

	function removeVariant(index: number) {
		variants = variants.filter((_, idx) => idx !== index);
	}

	function handleDragStart(index: number, e: DragEvent) {
		draggedIndex = index;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', String(index));
		}
	}

	function handleDragOver(e: DragEvent, index: number) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		dragOverIndex = index;
	}

	function handleDragLeave(index: number) {
		if (dragOverIndex === index) {
			dragOverIndex = null;
		}
	}

	function handleDrop(index: number, e: DragEvent) {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === index) {
			draggedIndex = null;
			dragOverIndex = null;
			return;
		}

		const updated = [...variants];
		const [moved] = updated.splice(draggedIndex, 1);
		updated.splice(index, 0, moved);
		variants = updated;

		draggedIndex = null;
		dragOverIndex = null;
	}

	function handleDragEnd() {
		draggedIndex = null;
		dragOverIndex = null;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		formError = null;
		fieldErrors = {};

		const trimmedName = name.trim();
		const finalCode = attribute ? attribute.code : generateSlug(trimmedName);

		const batchVariants: ProductAttributeVariantBatchItem[] = variants.map((vName, idx) => ({
			name: vName,
			displayOrder: idx + 1
		}));

		const parseResult = attributeInputSchema.safeParse({
			name: trimmedName,
			code: finalCode,
			variants: batchVariants
		});

		if (!parseResult.success) {
			const formatted = parseResult.error.format();
			fieldErrors = {
				name: formatted.name?._errors[0] ?? ''
			};
			return;
		}

		isSubmitting = true;
		const payload: ProductAttributeInput = {
			name: trimmedName,
			code: finalCode,
			variants: batchVariants,
			isActive: attribute ? attribute.isActive : true
		};

		const success = await onSave(payload);
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
						{attribute ? 'Edit Atribut' : 'Tambah Atribut Baru'}
					</Typography>
					<Typography variant="muted" as="p" class="mt-1 text-xs text-foreground-subtle">
						Definisikan nama atribut spesifikasi baru beserta opsi nilainya.
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
					<p>{formError}</p>
				</div>
			{/if}

			<!-- Body -->
			<form id="attribute-form" onsubmit={handleSubmit} class="mt-5 space-y-4">
				<!-- Nama Atribut -->
				<div>
					<label for="attr-name" class="mb-1.5 block text-xs font-semibold text-foreground">
						Nama Atribut <span class="text-danger">*</span>
					</label>
					<TextField
						id="attr-name"
						name="name"
						bind:value={name}
						placeholder="Contoh: Sisi Cetak, Pilihan Laminasi, Gramatur"
						classes={{ input: 'text-sm' }}
					/>
					{#if fieldErrors.name}
						<p class="mt-1 text-xs text-danger">{fieldErrors.name}</p>
					{/if}
				</div>

				<!-- Daftar Pilihan Nilai (Opsional) -->
				<div>
					<div class="mb-1">
						<span class="text-xs font-semibold text-foreground">
							Daftar Pilihan Nilai & Urutan Kasir (Opsional)
						</span>
						<p class="mt-0.5 text-xs text-foreground-subtle">
							Biarkan kosong jika atribut ini berupa input teks bebas.
						</p>
					</div>

					<!-- Input Tambah Varian (Keyboard First / Enter) -->
					<div class="mt-2">
						<TextField
							placeholder="Ketik opsi varian lalu tekan Enter ↵"
							bind:value={variantInput}
							onkeydown={handleVariantKeydown}
							classes={{ input: 'text-sm' }}
							class="w-full"
						>
							{#snippet suffix()}
								<span
									class="inline-flex select-none items-center rounded border border-border/80 bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground-subtle shadow-2xs"
								>
									Enter ↵
								</span>
							{/snippet}
						</TextField>
					</div>

					{#if fieldErrors.variant}
						<p class="mt-1 text-xs text-danger">{fieldErrors.variant}</p>
					{/if}

					<!-- Vertical Micro-Card Stack with Drag & Drop Reorder (Usulan 1) -->
					{#if variants.length > 0}
						<div
							class="mt-3 flex max-h-[220px] flex-col gap-1.5 overflow-y-auto rounded-md border border-border bg-surface-subtle/50 p-2"
						>
							{#each variants as item, index (item)}
								{@const isDragging = draggedIndex === index}
								{@const isOver = dragOverIndex === index}
								<div
									draggable="true"
									role="listitem"
									ondragstart={(e) => handleDragStart(index, e)}
									ondragover={(e) => handleDragOver(e, index)}
									ondragleave={() => handleDragLeave(index)}
									ondrop={(e) => handleDrop(index, e)}
									ondragend={handleDragEnd}
									class="group flex cursor-grab select-none items-center justify-between rounded-md border border-primary/20 bg-primary/[0.04] px-3 py-2 text-xs font-medium text-foreground shadow-2xs transition-all duration-150 hover:border-primary/40 hover:bg-primary/[0.08] active:cursor-grabbing dark:bg-primary/[0.08] dark:hover:bg-primary/[0.12] {isDragging
										? 'scale-98 opacity-35'
										: ''} {isOver && !isDragging
										? 'ring-2 ring-primary ring-offset-1 ring-offset-app-surface'
										: ''}"
									title="Seret ke atas/bawah untuk mengubah urutan prioritas kasir"
								>
									<div class="flex min-w-0 flex-1 items-center gap-2.5">
										<!-- Grip Handle Icon -->
										<IconGripVertical
											class="size-3.5 shrink-0 text-primary/50 transition-colors group-hover:text-primary"
										/>

										<!-- Order Index Number (01, 02...) -->
										<span
											class="flex h-5 min-w-5 shrink-0 items-center justify-center rounded bg-primary/15 px-1 text-[11px] font-semibold text-primary dark:bg-primary/25"
										>
											{String(index + 1).padStart(2, '0')}
										</span>

										<!-- Variant Name -->
										<span class="truncate font-medium text-foreground">{item}</span>
									</div>

									<!-- Icon-only Remove Action -->
									<button
										type="button"
										onclick={() => removeVariant(index)}
										class="ml-2 rounded p-1 text-primary/60 transition-colors hover:bg-danger/10 hover:text-danger"
										title={`Hapus ${item}`}
										aria-label={`Hapus ${item}`}
									>
										<IconX class="size-3.5" />
									</button>
								</div>
							{/each}
						</div>
						<p class="mt-2 text-[11px] text-foreground-subtle">
							Seret (drag & drop) kartu ke atas/bawah untuk mengatur urutan prioritas di kasir (atas = opsi pertama).
						</p>
					{/if}
				</div>

				<!-- Footer Buttons -->
				<div class="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
					<Button type="button" variant="ghost" size="sm" onclick={onClose} disabled={isSubmitting}>
						Batal
					</Button>
					<Button type="submit" variant="default" size="sm" isLoading={isSubmitting}>
						{attribute ? 'Simpan Perubahan' : 'Simpan Atribut'}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
