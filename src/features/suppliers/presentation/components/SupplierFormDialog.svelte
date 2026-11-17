<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import { Textarea } from 'dystopia-linear-lib/components/textarea';
	import { cn } from 'dystopia-linear-lib/utils/cn';
	import IconX from '~icons/lucide/x';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconTruck from '~icons/lucide/truck';
	import type { Supplier, SupplierInput } from '../../domain/supplier.entity';
	import { generateSupplierCode } from '../../domain/supplier.entity';
	import { supplierSchema } from '../../domain/supplier.schema';

	interface Props {
		open: boolean;
		supplier?: Supplier | null;
		onSave: (input: SupplierInput) => Promise<boolean>;
		onClose: () => void;
	}

	let { open = $bindable(false), supplier = null, onSave, onClose }: Props = $props();

	let name = $state('');
	let contactPerson = $state('');
	let email = $state('');
	let phone = $state('');
	let address = $state('');

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
			if (supplier) {
				name = supplier.name;
				contactPerson = supplier.contactPerson ?? '';
				email = supplier.email ?? '';
				phone = supplier.phone === '-' ? '' : (supplier.phone ?? '');
				address = supplier.address ?? '';
			} else {
				name = '';
				contactPerson = '';
				email = '';
				phone = '';
				address = '';
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
		if (!trimmedName) {
			fieldErrors = { name: 'Nama supplier wajib diisi' };
			return;
		}

		const finalCode = supplier ? supplier.code : generateSupplierCode(trimmedName);
		const finalContact = contactPerson.trim() || null;
		const finalPhone = phone.trim() || null;
		const finalEmail = email.trim() || null;
		const finalAddress = address.trim() || null;
		const finalNotes = supplier ? (supplier.notes ?? null) : null;

		const payload: SupplierInput = {
			code: finalCode,
			name: trimmedName,
			contactPerson: finalContact,
			phone: finalPhone,
			email: finalEmail,
			address: finalAddress,
			notes: finalNotes,
			isActive: supplier ? supplier.isActive : true,
			displayOrder: supplier ? supplier.displayOrder : undefined
		};

		const validation = supplierSchema.safeParse(payload);
		if (!validation.success) {
			const formatted = validation.error.format();
			fieldErrors = {
				name: formatted.name?._errors[0] ?? '',
				email: formatted.email?._errors[0] ?? '',
				phone: formatted.phone?._errors[0] ?? '',
				contactPerson: formatted.contactPerson?._errors[0] ?? ''
			};
			return;
		}

		isSubmitting = true;
		const success = await onSave(payload);
		isSubmitting = false;

		if (success) {
			onClose();
		} else {
			formError = 'Gagal menyimpan data supplier. Silakan periksa kembali formulir.';
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="supplier-form-title"
	>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
			onclick={onClose}
			aria-label="Tutup modal"
			tabindex="-1"
			transition:fade={{ duration: 150 }}
		></button>

		<!-- Modal Container -->
		<div
			class="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-border bg-app-surface shadow-2xl"
			transition:modalSlideIn={{ duration: 250 }}
		>
			<!-- Modal Header -->
			<div class="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
				<div class="flex items-center gap-3">
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary"
					>
						<IconTruck class="size-4.5" />
					</div>
					<div>
						<Typography
							id="supplier-form-title"
							variant="h3"
							as="h2"
							class="text-base font-bold text-foreground sm:text-lg"
						>
							{supplier ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}
						</Typography>
						<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
							{supplier
								? `Perbarui informasi profil vendor "${supplier.name}"`
								: 'Lengkapi informasi vendor pemasok bahan & perlengkapan'}
						</Typography>
					</div>
				</div>
				<button
					type="button"
					onclick={onClose}
					class="flex size-8 items-center justify-center rounded-lg border border-transparent text-foreground-subtle hover:border-border hover:bg-surface-subtle hover:text-foreground"
					aria-label="Tutup"
				>
					<IconX class="size-4" />
				</button>
			</div>

			<!-- Modal Body -->
			<form id="supplier-form" onsubmit={handleSubmit} class="flex-1 overflow-y-auto p-5 sm:p-6">
				<div class="flex flex-col gap-4">
					{#if formError}
						<div
							class="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger"
						>
							<IconAlertCircle class="size-4 shrink-0" />
							<span>{formError}</span>
						</div>
					{/if}

					<!-- 1. Nama Supplier (Required) -->
					<div class="flex flex-col gap-1.5">
						<label for="supplier-name" class="text-xs font-medium text-foreground">
							Nama Supplier / Badan Usaha <span class="text-danger">*</span>
						</label>
						<TextField
							id="supplier-name"
							size="sm"
							placeholder="Contoh: PT Surya Kencana Grafika"
							value={name}
							onValueChange={(val) => {
								name = val;
								fieldErrors = { ...fieldErrors, name: '' };
							}}
							class={cn('w-full', fieldErrors.name && 'border-danger focus:border-danger')}
						/>
						{#if fieldErrors.name}
							<span class="text-[11px] text-danger">{fieldErrors.name}</span>
						{/if}
					</div>

					<!-- 2. Kontak PIC / Sales (Optional) -->
					<div class="flex flex-col gap-1.5">
						<label for="supplier-pic" class="text-xs font-medium text-foreground">
							Nama PIC / Kontak Sales
						</label>
						<TextField
							id="supplier-pic"
							size="sm"
							placeholder="Contoh: Bambang Sutrisno"
							value={contactPerson}
							onValueChange={(val) => {
								contactPerson = val;
								fieldErrors = { ...fieldErrors, contactPerson: '' };
							}}
							class={cn('w-full', fieldErrors.contactPerson && 'border-danger focus:border-danger')}
						/>
						{#if fieldErrors.contactPerson}
							<span class="text-[11px] text-danger">{fieldErrors.contactPerson}</span>
						{/if}
					</div>

					<!-- 3. Dua Kolom: No. Telepon / WA & Email -->
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<!-- No. Telpon / WA (Optional) -->
						<div class="flex flex-col gap-1.5">
							<label for="supplier-phone" class="text-xs font-medium text-foreground">
								No. Telpon / WA
							</label>
							<TextField
								id="supplier-phone"
								size="sm"
								placeholder="Contoh: 081234567890"
								value={phone}
								onValueChange={(val) => {
									phone = val;
									fieldErrors = { ...fieldErrors, phone: '' };
								}}
								class={cn('w-full', fieldErrors.phone && 'border-danger focus:border-danger')}
							/>
							{#if fieldErrors.phone}
								<span class="text-[11px] text-danger">{fieldErrors.phone}</span>
							{/if}
						</div>

						<!-- Email (Optional) -->
						<div class="flex flex-col gap-1.5">
							<label for="supplier-email" class="text-xs font-medium text-foreground">
								Email
							</label>
							<TextField
								id="supplier-email"
								size="sm"
								type="email"
								placeholder="Contoh: sales@suryakencana.co.id"
								value={email}
								onValueChange={(val) => {
									email = val;
									fieldErrors = { ...fieldErrors, email: '' };
								}}
								class={cn('w-full', fieldErrors.email && 'border-danger focus:border-danger')}
							/>
							{#if fieldErrors.email}
								<span class="text-[11px] text-danger">{fieldErrors.email}</span>
							{/if}
						</div>
					</div>

					<!-- 4. Alamat (Optional) -->
					<div class="flex flex-col gap-1.5">
						<label for="supplier-address" class="text-xs font-medium text-foreground">
							Alamat Lengkap
						</label>
						<Textarea
							id="supplier-address"
							rows={2}
							placeholder="Contoh: Kawasan Industri Pulo Gadung Blok B2 No. 8, Jakarta Timur"
							bind:value={address}
							class="w-full text-xs"
						/>
					</div>
				</div>
			</form>

			<!-- Modal Footer -->
			<div class="flex items-center justify-end gap-2 border-t border-border px-5 py-3.5 sm:px-6">
				<Button type="button" variant="ghost" size="sm" onclick={onClose} disabled={isSubmitting}>
					Batal
				</Button>
				<Button
					type="submit"
					form="supplier-form"
					variant="default"
					size="sm"
					isLoading={isSubmitting}
				>
					{supplier ? 'Simpan Perubahan' : 'Tambah Supplier'}
				</Button>
			</div>
		</div>
	</div>
{/if}
