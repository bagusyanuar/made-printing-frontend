<script lang="ts">
	import { Typography } from 'dystopia-linear-lib/components/typography';
	import { Dropdown, DropdownItem } from 'dystopia-linear-lib/components/dropdown';
	import { Pagination } from 'dystopia-linear-lib/components/pagination';
	import { cn } from 'dystopia-linear-lib/utils/cn';
	import IconChevronDown from '~icons/lucide/chevron-down';
	import IconCheck from '~icons/lucide/check';
	import type { TablePaginationProps } from './table-pagination.types';

	let {
		currentPage = $bindable(1),
		pageSize = $bindable(10),
		totalItems = 0,
		pageSizeOptions = [5, 10, 20, 50],
		itemLabel = 'data',
		rowsPerPageLabel = 'Baris per halaman:',
		class: className = '',
		onPageChange,
		onPageSizeChange
	}: TablePaginationProps = $props();

	const totalPages = $derived(Math.max(1, Math.ceil(totalItems / pageSize)));
	const startIndex = $derived(totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1);
	const endIndex = $derived(Math.min(currentPage * pageSize, totalItems));

	$effect(() => {
		if (currentPage > totalPages) {
			currentPage = totalPages;
			onPageChange?.(totalPages);
		}
	});

	function handlePageSizeSelect(option: number) {
		pageSize = option;
		currentPage = 1;
		onPageSizeChange?.(option);
		onPageChange?.(1);
	}
</script>

<div
	class={cn('flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between', className)}
>
	<!-- Left: Rows per page selector & data range counter -->
	<div class="flex flex-wrap items-center gap-2.5 text-xs">
		<div class="flex items-center gap-2">
			<Typography variant="muted" as="span" class="text-xs text-foreground-subtle">
				{rowsPerPageLabel}
			</Typography>

			<Dropdown
				placement="bottom-start"
				offset={4}
				aria-label={rowsPerPageLabel}
				class="h-8 w-16 justify-between! rounded-lg border border-border bg-surface pr-2! pl-2.5! text-xs font-medium text-foreground transition-colors hover:bg-surface-subtle focus-visible:ring-1 focus-visible:ring-primary"
				classes={{
					trigger: 'w-16 justify-between! pl-2.5! pr-2!',
					content: 'min-w-16 border-border bg-surface p-1 shadow-none'
				}}
			>
				{#snippet trigger({ open })}
					<span>{pageSize}</span>
					<IconChevronDown
						class="size-3.5 text-foreground-subtle transition-transform duration-200 {open
							? 'rotate-180'
							: ''}"
					/>
				{/snippet}

				{#each pageSizeOptions as option (option)}
					<DropdownItem
						class="flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-surface-subtle {pageSize ===
						option
							? 'bg-primary/10 font-semibold text-primary'
							: ''}"
						onSelect={() => handlePageSizeSelect(option)}
					>
						<span>{option}</span>
						{#if pageSize === option}
							<IconCheck class="size-3.5 text-primary" />
						{/if}
					</DropdownItem>
				{/each}
			</Dropdown>
		</div>

		<Typography variant="muted" as="span" class="text-xs text-foreground-subtle">
			<strong class="font-medium text-foreground">{startIndex}</strong>–<strong
				class="font-medium text-foreground">{endIndex}</strong
			>
			dari <strong class="font-medium text-foreground">{totalItems}</strong>
			{itemLabel}
		</Typography>
	</div>

	<!-- Right: Page navigation links -->
	<Pagination bind:currentPage {totalPages} size="sm" />
</div>
