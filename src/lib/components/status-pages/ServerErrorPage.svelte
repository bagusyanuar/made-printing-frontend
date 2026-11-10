<script lang="ts">
	import { resolve } from '$app/paths';
	import IconServerCrash from '~icons/lucide/server-crash';
	import IconChevronDown from '~icons/lucide/chevron-down';
	import StatusPageLayout from './StatusPageLayout.svelte';

	interface Props {
		/** Judul status 500 */
		title?: string;
		/** Deskripsi atau penjelasan */
		description?: string;
		/** Pesan atau objek error teknis (opsional) */
		error?: unknown;
		/** ID Pelacakan Error untuk audit / pelaporan */
		errorId?: string;
		/** Callback ketika pengguna menekan tombol coba lagi */
		onRetry?: () => void;
	}

	let {
		title = 'Terjadi Gangguan pada Sistem',
		description = 'Terjadi kendala saat memproses permintaan Anda pada server atau runtime aplikasi. Silakan coba muat ulang beberapa saat lagi.',
		error,
		errorId,
		onRetry
	}: Props = $props();

	let showDetails = $state(false);

	function handleReload() {
		if (onRetry) {
			onRetry();
		} else if (typeof window !== 'undefined') {
			window.location.reload();
		}
	}

	const errorMessage = $derived(
		error instanceof Error
			? error.message
			: typeof error === 'string'
				? error
				: error
					? JSON.stringify(error, null, 2)
					: null
	);
</script>

<StatusPageLayout
	badgeText="Error 500 · Gangguan Server"
	badgeClass="bg-danger/10 text-danger border-danger/20"
	icon={IconServerCrash}
	iconWrapperClass="bg-danger/10 text-danger border-danger/20"
	{title}
	{description}
	primaryAction={{
		label: 'Muat Ulang Halaman',
		onClick: handleReload
	}}
	secondaryAction={{
		label: 'Ke Dashboard',
		href: resolve('/(app)/dashboard')
	}}
>
	{#if errorMessage || errorId}
		<div class="rounded-xl border border-border bg-surface-subtle p-3.5 text-left text-xs">
			<button
				type="button"
				class="flex w-full items-center justify-between font-medium text-foreground-subtle transition-colors hover:text-foreground"
				onclick={() => (showDetails = !showDetails)}
			>
				<span class="flex items-center gap-1.5">
					<span class="text-xs font-medium text-danger">Detail Teknis</span>
					{#if errorId}
						<span class="font-mono text-[11px] text-foreground-subtle/80">({errorId})</span>
					{/if}
				</span>
				<IconChevronDown
					class="size-4 transition-transform duration-150 {showDetails ? 'rotate-180' : ''}"
				/>
			</button>

			{#if showDetails}
				<div
					class="mt-2.5 max-h-40 overflow-y-auto rounded-lg border border-border/60 bg-black/5 p-2.5 font-mono text-[11px] text-foreground dark:bg-white/5"
				>
					{#if errorMessage}
						<pre class="whitespace-pre-wrap">{errorMessage}</pre>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</StatusPageLayout>
