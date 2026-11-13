<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { Toaster } from 'dystopia-linear-lib/components/toast';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { RouteProgress } from '$lib/components/layout/route-progress';
	import { themeStore } from '$lib/shared/presentation/theme.store.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
				retry: 1
			}
		}
	});

	themeStore.sync();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Made Printing - Digital Printing ERP</title>
</svelte:head>

<RouteProgress />
<QueryClientProvider client={queryClient}>
	{@render children()}
	<Toaster
		class="z-9999! p-6! sm:p-8!"
		classes={{
			viewport: 'z-[9999]! p-6! sm:p-8! gap-3',
			item: 'shadow-lg border-border'
		}}
	/>
</QueryClientProvider>
