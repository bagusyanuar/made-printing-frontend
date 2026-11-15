<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import { Textarea } from 'dystopia-linear-lib/components/textarea';
	import { Checkbox } from 'dystopia-linear-lib/components/checkbox';
	import IconX from '~icons/lucide/x';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import {
		generateSlug,
		type ProductAttributeVariant,
		type ProductAttributeVariantInput
	} from '../../domain/attribute-variant.entity';
	import { variantInputSchema } from '../../domain/attribute-variant.schema';

	interface Props {
		open: boolean;
		attributeId: string;
		attributeName: string;
		variant?: ProductAttributeVariant | null;
		onSave: (input: ProductAttributeVariantInput) => Promise<boolean>;
		onClose: () => void;
	}

	let {
		open = $bindable(false),
		attributeId,
		attributeName,
		variant = null,
		onSave,
		onClose
	}: Props = $props();

	let name = $state('');
	let code = $state('');
	let description = $state('');
	let isActive = $state(true);

	let isSubmitting = $state(false);
	let formError = $state<string | null>(null);
	let fieldErrors = $state<Record<string, string>>({});

	function modalSlideIn(node: Element, { duration = 280 } = {}) {
		return {
			duration,
			css: (t: number) => {
				const eased = 1 - Math.pow(1 - t, 4);
				const y = (1 - eased) * -40;
				const scale = 0.96 + 0.04 * eased;
				return `
					transform: translateY(${y}px) scale(${scale});
					opacity: ${eased};
				`;
			}
		};
	}

	$effect(() => {
		if (open) {
			if (variant) {
				name = variant.name;
				code = variant.code;
				description = variant.description ?? '';
				isActive = variant.isActive;
			} else {
				name = '';
				code = '';
				description = '';
				isActive = true;
			}
			formError = null;
			fieldErrors = {};
		}
	});

	function handleNameBlur() {
		if (!variant && !code.trim() && name.trim()) {
			code = generateSlug(name);
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		formError = null;
		fieldErrors = {};

		const trimmedName = name.trim();
		const finalCode = code.trim() || generateSlug(trimmedName);

		const parseResult = variantInputSchema.safeParse({
			attributeId,
			name: trimmedName,
			code: finalCode,
			description: description.trim() || null,
			isActive,
			displayOrder: variant?.displayOrder ?? 1
		});

		if (!parseResult.success) {
			const formatted = parseResult.error.format();
			fieldErrors = {
				name: formatted.name?._errors[0] ?? '',
				code: formatted.code?._errors[0] ?? ''
			};
			return;
		}

		isSubmitting = true;
		const payload: ProductAttributeVariantInput = {
			attributeId,
			name: trimmedName,
			code: finalCode,
			description: description.trim() || null,
			isActive,
			displayOrder: variant?.displayOrder
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
		class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
		role="dialog"
		aria-modal="true"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
			onclick={onClose}
			aria-label="Tutup modal"
			transition:fade={{ duration: 200 }}
		></button>

		<!-- Modal Card -->
		<div
			class="relative z-10 flex max-h-[92vh] w-full max-w-md flex-col rounded-2xl border border-border bg-app-surface shadow-2xl"
			transition:modalSlideIn
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-border px-6 py-5">
				<div>
					<Typography variant="h3" as="h2" class="font-bold text-foreground">
						{variant ? 'Edit Opsi Varian' : 'Tambah Opsi Varian'}
					</Typography>
					<Typography variant="muted" as="p" class="mt-0.5 text-xs text-foreground-subtle">
						Atribut Induk: <strong class="text-foreground">{attributeName}</strong>
					</Typography>
				</div>
				<button
					type="button"
					onclick={onClose}
					class="rounded-lg p-2 text-foreground-subtle transition-colors hover:bg-surface-muted hover:text-foreground"
					aria-label="Tutup"
				>
					<IconX class="size-5" />
				</button>
			</div>

			<!-- Body -->
			<form id="variant-form" onsubmit={handleSubmit} class="flex-1 overflow-y-auto px-6 py-5">
				{#if formError}
					<div
						class="mb-5 flex items-center gap-3 rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-xs text-danger"
					>
						<IconAlertCircle class="size-4 shrink-0" />
						<p>{formError}</p>
					</div>
				{/if}

				<div class="space-y-4">
					<!-- Nama Varian -->
					<div>
						<label for="var-name" class="mb-1.5 block text-xs font-semibold text-foreground">
							Nama Varian <span class="text-danger">*</span>
						</label>
						<TextField
							id="var-name"
							name="name"
							bind:value={name}
							onblur={handleNameBlur}
							placeholder="Contoh: 1 Sisi (4/0), Doff 1 Sisi, Kiss Cut"
							classes={{ input: 'text-sm' }}
						/>
						{#if fieldErrors.name}
							<p class="mt-1 text-xs text-danger">{fieldErrors.name}</p>
						{/if}
					</div>

					<!-- Kode Slug -->
					<div>
						<div class="mb-1.5 flex items-center justify-between">
							<label for="var-code" class="text-xs font-semibold text-foreground">
								Kode / Slug Varian
							</label>
							<span class="text-[11px] text-foreground-subtle">Auto-generate jika kosong</span>
						</div>
						<TextField
							id="var-code"
							name="code"
							bind:value={code}
							placeholder="contoh: 1_sisi"
							classes={{ input: 'text-sm' }}
						/>
						{#if fieldErrors.code}
							<p class="mt-1 text-xs text-danger">{fieldErrors.code}</p>
						{/if}
					</div>

					<!-- Deskripsi -->
					<div>
						<label for="var-desc" class="mb-1.5 block text-xs font-semibold text-foreground">
							Keterangan / Instruksi Teknis
						</label>
						<Textarea
							id="var-desc"
							name="description"
							bind:value={description}
							rows={3}
							placeholder="Petunjuk spesifikasi bagi kasir & operator cetak..."
							classes={{ textarea: 'text-sm' }}
						/>
					</div>

					<!-- Status Toggle -->
					<div class="rounded-xl border border-border/80 bg-surface-muted/40 p-4">
						<Checkbox
							bind:checked={isActive}
							label="Status Aktif"
							description="Opsi varian ini dapat dipilih pada produk di katalog."
							classes={{
								label: 'text-xs font-semibold text-foreground',
								description: 'text-[11px] leading-relaxed text-foreground-subtle'
							}}
						/>
					</div>
				</div>
			</form>

			<!-- Footer -->
			<div class="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
				<Button type="button" variant="ghost" size="sm" onclick={onClose} disabled={isSubmitting}>
					Batal
				</Button>
				<Button
					type="submit"
					form="variant-form"
					variant="default"
					size="sm"
					isLoading={isSubmitting}
					disabled={isSubmitting}
				>
					{variant ? 'Simpan Perubahan' : 'Tambah Varian'}
				</Button>
			</div>
		</div>
	</div>
{/if}
