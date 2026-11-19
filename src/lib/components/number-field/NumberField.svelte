<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import { cn } from 'dystopia-linear-lib/utils/cn';
	import { TextField } from 'dystopia-linear-lib/components/text-field';
	import type { TextFieldProps } from 'dystopia-linear-lib/components/text-field';

	export interface NumberFieldClasses {
		input?: string;
		prefix?: string;
		suffix?: string;
		container?: string;
	}

	interface Props extends Omit<
		TextFieldProps,
		'value' | 'type' | 'classes' | 'prefix' | 'suffix' | 'onValueChange'
	> {
		value?: number | null;
		onValueChange?: (value: number | undefined) => void;
		hideSpinner?: boolean;
		thousandSeparator?: boolean;
		classes?: NumberFieldClasses;
		ref?: HTMLInputElement | null;
		inputRef?: HTMLInputElement | null;
		prefix?: Snippet<[{ value: number | undefined; displayValue: string }]>;
		suffix?: Snippet<[{ value: number | undefined; displayValue: string }]>;
	}

	let {
		value = $bindable(),
		ref = $bindable(null),
		inputRef = $bindable(null),
		hideSpinner = true,
		thousandSeparator = false,
		classes,
		prefix,
		suffix,
		onValueChange,
		...restProps
	}: Props = $props();

	function isMeaningful(ch: string): boolean {
		return (ch >= '0' && ch <= '9') || ch === ',' || ch === '-';
	}

	function countMeaningfulBefore(str: string, pos: number): number {
		let count = 0;
		for (let i = 0; i < pos && i < str.length; i++) {
			if (isMeaningful(str[i])) count++;
		}
		return count;
	}

	function getCaretAfterMeaningful(display: string, targetCount: number): number {
		if (targetCount <= 0) return 0;
		let count = 0;
		for (let i = 0; i < display.length; i++) {
			if (isMeaningful(display[i])) {
				count++;
				if (count === targetCount) return i + 1;
			}
		}
		return display.length;
	}

	function format(canonical: string): string {
		if (!thousandSeparator || !canonical) return canonical;
		const negative = canonical.startsWith('-');
		const unsigned = negative ? canonical.slice(1) : canonical;
		const [intPart, ...fracParts] = unsigned.split('.');
		const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
		const frac =
			fracParts.length > 0 ? ',' + fracParts.join('') : unsigned.endsWith('.') ? ',' : '';
		return (negative ? '-' : '') + groupedInt + frac;
	}

	function sanitize(display: string): string {
		const negative = display.trimStart().startsWith('-');
		let normalized = display;
		if (!normalized.includes(',') && normalized.includes('.')) {
			const dotIdx = normalized.lastIndexOf('.');
			const digitsAfter = normalized.slice(dotIdx + 1).replace(/\D/g, '').length;
			if (digitsAfter !== 3 || !normalized.slice(0, dotIdx).includes('.')) {
				normalized = normalized.slice(0, dotIdx) + ',' + normalized.slice(dotIdx + 1);
			}
		}
		const kept = normalized.replace(/[^\d.,]/g, '').replace(/\./g, '');
		const [intPart, ...fracParts] = kept.split(',');
		const cleaned =
			fracParts.length > 0
				? `${intPart}.${fracParts.join('')}`
				: kept.endsWith(',')
					? `${intPart}.`
					: intPart;
		return (negative ? '-' : '') + cleaned;
	}

	function toDisplay(next: number | null | undefined): string {
		return next === undefined || next === null ? '' : format(String(next));
	}

	function toNumber(display: string): number | undefined {
		const canonical = thousandSeparator ? sanitize(display) : display;
		if (canonical === '' || canonical === '-' || canonical === '.') return undefined;
		const n = Number(canonical);
		return Number.isNaN(n) ? undefined : n;
	}

	let displayValue = $state(toDisplay(value));
	let lastCommitted = value;

	$effect(() => {
		inputRef = ref ?? inputRef;
	});

	$effect(() => {
		if (value === lastCommitted) return;
		lastCommitted = value;
		displayValue = toDisplay(value);
	});

	function handleKeyDown(event: KeyboardEvent & { currentTarget: HTMLInputElement }): void {
		if (thousandSeparator && (event.key === '.' || event.key === 'Decimal')) {
			event.preventDefault();
			const input = event.currentTarget;
			const start = input.selectionStart ?? input.value.length;
			const end = input.selectionEnd ?? input.value.length;
			const val = input.value;
			const valueWithoutSelection = val.slice(0, start) + val.slice(end);
			if (!valueWithoutSelection.includes(',')) {
				input.setRangeText(',', start, end, 'end');
				input.dispatchEvent(new Event('input', { bubbles: true }));
			}
		}
	}

	async function handleInput(event: Event & { currentTarget: HTMLInputElement }): Promise<void> {
		const input = event.currentTarget;
		const raw = input.value;

		if (thousandSeparator) {
			const selStart = input.selectionStart ?? raw.length;
			const meaningfulCount = countMeaningfulBefore(raw, selStart);

			displayValue = format(sanitize(raw));
			await tick();

			const caretPos = getCaretAfterMeaningful(displayValue, meaningfulCount);
			input.setSelectionRange(caretPos, caretPos);
		} else {
			displayValue = raw;
		}

		const next = toNumber(displayValue);
		value = next;
		lastCommitted = next;
		onValueChange?.(next);
	}
</script>

{#snippet renderPrefix()}
	{@render prefix?.({ value: value ?? undefined, displayValue })}
{/snippet}

{#snippet renderSuffix()}
	{@render suffix?.({ value: value ?? undefined, displayValue })}
{/snippet}

<TextField
	{...restProps}
	bind:ref
	type={thousandSeparator ? 'text' : 'number'}
	inputmode={thousandSeparator ? 'decimal' : undefined}
	bind:value={displayValue}
	onkeydown={handleKeyDown}
	oninput={handleInput}
	prefix={prefix ? renderPrefix : undefined}
	suffix={suffix ? renderSuffix : undefined}
	data-slot="number-field"
	data-thousand-separator={thousandSeparator ? '' : undefined}
	data-has-value={value !== undefined && value !== null ? '' : undefined}
	classes={{
		...classes,
		input: cn(
			hideSpinner &&
				!thousandSeparator &&
				'[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
			classes?.input
		)
	}}
/>
