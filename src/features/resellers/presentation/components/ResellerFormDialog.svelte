<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Button } from 'dystopia-linear-lib/components/button';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import { NumberField } from 'dystopia-linear-lib/components/number-field';
	import { Textarea } from 'dystopia-linear-lib/components/textarea';
	import { cn } from 'dystopia-linear-lib/utils/cn';
	import IconX from '~icons/lucide/x';
	import IconAlertCircle from '~icons/lucide/alert-circle';
	import IconHandshake from '~icons/lucide/handshake';
	import type { Reseller, ResellerInput } from '../../domain/reseller.entity';
	import { generateResellerCode } from '../../domain/reseller.entity';
	import { resellerSchema } from '../../domain/reseller.schema';

	interface Props {
		open: boolean;
		reseller?: Reseller | null;
		onSave: (input: ResellerInput) => Promise<boolean>;
		onClose: () => void;
	}

	let { open = $bindable(false), reseller = null, onSave, onClose }: Props = $props();

	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let creditLimit = $state<number>(0);
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
			if (reseller) {
				name = reseller.ownerName || reseller.name;
				email = reseller.email ?? '';
				phone = reseller.phone === '-' ? '' : (reseller.phone ?? '');
				creditLimit = reseller.creditLimit;
				address = reseller.address ?? '';
			} else {
				name = '';
				email = '';
				phone = '';
				creditLimit = 0;
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
			fieldErrors = { name: 'Nama reseller wajib diisi' };
			return;
		}

		const finalCode = reseller ? reseller.code : generateResellerCode(trimmedName);
		const finalPhone = phone.trim() || null;
		const finalEmail = email.trim() || null;
		const finalAddress = address.trim() || null;
		const finalCreditLimit = creditLimit ?? 0;

		const payload: ResellerInput = {
			code: finalCode,
			name: trimmedName,
			ownerName: trimmedName,
			phone: finalPhone,
			email: finalEmail,
			address: finalAddress,
			tier: reseller ? reseller.tier : 'gold',
			creditLimit: finalCreditLimit,
			usedCredit: reseller ? reseller.usedCredit : 0,
			depositBalance: reseller ? reseller.depositBalance : 0,
			termOfPaymentDays: reseller ? reseller.termOfPaymentDays : 14,
			status: reseller ? reseller.status : 'active',
			notes: reseller ? reseller.notes : null,
			isActive: reseller ? reseller.isActive : true,
			displayOrder: reseller ? reseller.displayOrder : undefined
		};

		const validation = resellerSchema.safeParse(payload);
		if (!validation.success) {
			const formatted = validation.error.format();
			fieldErrors = {
				name: formatted.name?._errors[0] ?? formatted.ownerName?._errors[0] ?? '',
				email: formatted.email?._errors[0] ?? '',
				phone: formatted.phone?._errors[0] ?? '',
				creditLimit: formatted.creditLimit?._errors[0] ?? ''
			};
			return;
		}

		isSubmitting = true;
		const success = await onSave(payload);
		isSubmitting = false;

		if (success) {
			onClose();
		} else {
			formError = 'Gagal menyimpan data reseller. Silakan periksa kembali formulir.';
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="reseller-form-title"
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
						<IconHandshake class="size-4.5" />
					</div>
					<div>
						<Typography
							id="reseller-form-title"
							variant="h3"
							as="h2"
							class="text-base font-bold text-foreground sm:text-lg"
						>
							{reseller ? 'Edit Data Reseller' : 'Daftarkan Reseller Baru'}
						</Typography>
						<Typography variant="muted" as="p" class="text-xs text-foreground-subtle">
							{reseller
								? `Perbarui profil data ${reseller.ownerName}`
								: 'Lengkapi informasi reseller rekanan baru'}
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

			<!-- Modal Body (Simple Form: Nama, Email, No. Telpon/WA, Limit Kredit, Alamat) -->
			<form id="reseller-form" onsubmit={handleSubmit} class="flex-1 overflow-y-auto p-5 sm:p-6">
				<div class="flex flex-col gap-4">
					{#if formError}
						<div
							class="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-danger"
						>
							<IconAlertCircle class="size-4 shrink-0" />
							<span>{formError}</span>
						</div>
					{/if}

					<!-- 1. Nama (Required) -->
					<div class="flex flex-col gap-1.5">
						<label for="reseller-name" class="text-xs font-medium text-foreground">
							Nama <span class="text-danger">*</span>
						</label>
						<TextField
							id="reseller-name"
							size="sm"
							placeholder="Contoh: Hendra Setiawan"
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

					<!-- 2. Email (Optional) -->
					<div class="flex flex-col gap-1.5">
						<label for="reseller-email" class="text-xs font-medium text-foreground">
							Email
						</label>
						<TextField
							id="reseller-email"
							size="sm"
							type="email"
							placeholder="Contoh: hendra@gmail.com"
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

					<!-- 3. No. Telpon / WA (Optional) -->
					<div class="flex flex-col gap-1.5">
						<label for="reseller-phone" class="text-xs font-medium text-foreground">
							No. Telpon/WA
						</label>
						<TextField
							id="reseller-phone"
							size="sm"
							placeholder="Contoh: 081298765432"
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

					<!-- 4. Limit Kredit (Optional, thousandSeparator) -->
					<div class="flex flex-col gap-1.5">
						<label for="reseller-credit-limit" class="text-xs font-medium text-foreground">
							Limit Kredit (Rp)
						</label>
						<NumberField
							id="reseller-credit-limit"
							size="sm"
							thousandSeparator
							value={creditLimit}
							onValueChange={(val) => {
								creditLimit = val ?? 0;
								fieldErrors = { ...fieldErrors, creditLimit: '' };
							}}
							class={cn('w-full', fieldErrors.creditLimit && 'border-danger focus:border-danger')}
						/>
						{#if fieldErrors.creditLimit}
							<span class="text-[11px] text-danger">{fieldErrors.creditLimit}</span>
						{/if}
					</div>

					<!-- 5. Alamat (Optional) -->
					<div class="flex flex-col gap-1.5">
						<label for="reseller-address" class="text-xs font-medium text-foreground">
							Alamat
						</label>
						<Textarea
							id="reseller-address"
							rows={2}
							placeholder="Contoh: Jl. Sudirman No. 45, Padang"
							bind:value={address}
							class="w-full text-xs"
						/>
					</div>
				</div>
			</form>

			<!-- Modal Footer -->
			<div class="flex items-center justify-end gap-2 border-t border-border px-5 py-3.5 sm:px-6">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onclick={onClose}
					disabled={isSubmitting}
				>
					Batal
				</Button>
				<Button
					type="submit"
					form="reseller-form"
					variant="default"
					size="sm"
					isLoading={isSubmitting}
				>
					{reseller ? 'Simpan Perubahan' : 'Daftarkan Reseller'}
				</Button>
			</div>
		</div>
	</div>
{/if}
