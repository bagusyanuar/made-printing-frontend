<script lang="ts">
	import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date';
	import { cn } from 'dystopia-linear-lib/utils/cn';
	import { Popover } from 'dystopia-linear-lib/components/popover';
	import { Calendar } from 'dystopia-linear-lib/components/calendar';

	import IconCalendar from '~icons/lucide/calendar';
	import IconClock from '~icons/lucide/clock';
	import IconCheck from '~icons/lucide/check';
	import IconX from '~icons/lucide/x';

	interface Props {
		value?: string | null;
		onValueChange?: (value: string | null) => void;
		placeholder?: string;
		disabled?: boolean;
		clearable?: boolean;
		class?: string;
		id?: string;
		locale?: string;
	}

	let {
		value = $bindable(null),
		onValueChange,
		placeholder = 'Pilih deadline selesai...',
		disabled = false,
		clearable = true,
		class: className,
		id,
		locale = 'id-ID'
	}: Props = $props();

	let open = $state(false);
	const showClear = $derived(Boolean(clearable && !disabled && value));

	function handleClear(event: MouseEvent) {
		event.stopPropagation();
		event.preventDefault();
		value = null;
		selectedDate = undefined;
		onValueChange?.(null);
		open = false;
	}

	const MONTH_NAMES_ID = [
		'Januari',
		'Februari',
		'Maret',
		'April',
		'Mei',
		'Juni',
		'Juli',
		'Agustus',
		'September',
		'Oktober',
		'November',
		'Desember'
	];

	let selectedDate = $state<CalendarDate | undefined>(undefined);
	let timeString = $state<string>('20:00');

	function parseValue(val: string | null | undefined): {
		date?: CalendarDate;
		time: string;
	} {
		if (!val) {
			const now = new Date();
			const h = String(now.getHours()).padStart(2, '0');
			const m = String(now.getMinutes()).padStart(2, '0');
			return {
				date: undefined,
				time: `${h}:${m}`
			};
		}

		const d = new Date(val);
		if (isNaN(d.getTime())) {
			const now = new Date();
			const h = String(now.getHours()).padStart(2, '0');
			const m = String(now.getMinutes()).padStart(2, '0');
			return {
				date: undefined,
				time: `${h}:${m}`
			};
		}

		const h = String(d.getHours()).padStart(2, '0');
		const m = String(d.getMinutes()).padStart(2, '0');
		return {
			date: new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate()),
			time: `${h}:${m}`
		};
	}

	$effect(() => {
		if (open) {
			if (value) {
				const parsed = parseValue(value);
				selectedDate = parsed.date;
				timeString = parsed.time;
			} else {
				selectedDate = today(getLocalTimeZone());
				const now = new Date();
				const h = String(now.getHours()).padStart(2, '0');
				const m = String(now.getMinutes()).padStart(2, '0');
				timeString = `${h}:${m}`;
			}
		}
	});

	const displayText = $derived.by(() => {
		if (!value) return '';
		const d = new Date(value);
		if (isNaN(d.getTime())) return '';
		const day = d.getDate();
		const month = MONTH_NAMES_ID[d.getMonth()];
		const year = d.getFullYear();
		const hour = String(d.getHours()).padStart(2, '0');
		const minute = String(d.getMinutes()).padStart(2, '0');
		return `${day} ${month} ${year}, ${hour}:${minute}`;
	});

	function handleTimeInput(e: Event) {
		const input = e.target as HTMLInputElement;
		let raw = input.value.replace(/[^0-9:]/g, '');
		if (raw.length === 3 && !raw.includes(':')) {
			raw = raw.slice(0, 2) + ':' + raw.slice(2);
		} else if (raw.length === 4 && !raw.includes(':')) {
			raw = raw.slice(0, 2) + ':' + raw.slice(2);
		}
		timeString = raw.slice(0, 5);
	}

	function handleTimeBlur() {
		const parts = timeString.split(':');
		let h = parseInt(parts[0] || '0', 10);
		let m = parseInt(parts[1] || '0', 10);
		if (isNaN(h) || h < 0) h = 0;
		if (h > 23) h = 23;
		if (isNaN(m) || m < 0) m = 0;
		if (m > 59) m = 59;
		timeString = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
	}

	function setPresetNow() {
		const now = new Date();
		selectedDate = today(getLocalTimeZone());
		const h = String(now.getHours()).padStart(2, '0');
		const m = String(now.getMinutes()).padStart(2, '0');
		timeString = `${h}:${m}`;
	}

	function setPresetTime(time: string) {
		if (!selectedDate) {
			selectedDate = today(getLocalTimeZone());
		}
		timeString = time;
	}

	function handleReset() {
		value = null;
		selectedDate = undefined;
		onValueChange?.(null);
		open = false;
	}

	function handleDone() {
		const parts = timeString.split(':');
		let h = parseInt(parts[0] || '0', 10);
		let m = parseInt(parts[1] || '0', 10);
		if (isNaN(h) || h < 0) h = 0;
		if (h > 23) h = 23;
		if (isNaN(m) || m < 0) m = 0;
		if (m > 59) m = 59;
		const validTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

		const dateToUse = selectedDate ?? today(getLocalTimeZone());
		const y = dateToUse.year;
		const mo = String(dateToUse.month).padStart(2, '0');
		const d = String(dateToUse.day).padStart(2, '0');
		const formattedIso = `${y}-${mo}-${d}T${validTime}:00`;
		value = formattedIso;
		onValueChange?.(formattedIso);
		open = false;
	}
</script>

<div class={cn('relative w-full', className)}>
	<Popover
		bind:open
		placement="bottom-start"
		offset={6}
		class={cn(
			'flex h-9 w-full cursor-pointer items-center justify-between rounded-md border border-border bg-canvas px-3 text-xs text-foreground transition-colors hover:border-border-hover focus-visible:border-primary focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
			showClear && 'pr-8'
		)}
		classes={{
			content: 'z-60 rounded-xl border border-border bg-surface p-3 text-xs shadow-xl w-[268px]'
		}}
		{disabled}
		{id}
	>
		{#snippet trigger()}
			<span class="flex items-center gap-2 truncate">
				<IconCalendar class="size-4 shrink-0 text-foreground-subtle" />
				<span class={displayText ? 'font-medium text-foreground' : 'text-foreground-faint'}>
					{displayText || placeholder}
				</span>
			</span>
		{/snippet}

		<div class="flex flex-col">
			<!-- Calendar Grid from dystopia-linear-lib -->
			<Calendar
				class="w-full"
				classes={{
					header: 'w-full',
					grid: 'w-full',
					weekdays: 'w-full',
					row: 'w-full'
				}}
				value={selectedDate}
				{locale}
				onValueChange={(newDate: CalendarDate | undefined) => {
					selectedDate = newDate;
				}}
			/>

			<!-- Time Section -->
			<div class="mt-3 border-t border-border/70 pt-2.5">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-1.5 font-medium text-foreground">
						<IconClock class="size-3.5 text-primary" />
						<span>Waktu:</span>
					</div>
					<div class="flex items-center gap-1.5">
						<input
							type="text"
							value={timeString}
							oninput={handleTimeInput}
							onblur={handleTimeBlur}
							maxlength={5}
							placeholder="20:00"
							class="h-7.5 w-16 rounded-md border border-border bg-canvas px-2 text-center text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden"
						/>
						<span class="text-[11px] font-medium text-foreground-subtle">WIB</span>
					</div>
				</div>

				<!-- Preset Chips Grid (4 equal columns) -->
				<div class="mt-2 grid grid-cols-4 gap-1">
					<button
						type="button"
						onclick={setPresetNow}
						class="cursor-pointer rounded-md border border-border/70 bg-surface-subtle py-1 text-center text-[10.5px] font-medium text-foreground transition-colors hover:border-border hover:bg-surface-muted"
					>
						Sekarang
					</button>
					<button
						type="button"
						onclick={() => setPresetTime('12:00')}
						class="cursor-pointer rounded-md border border-border/70 bg-surface-subtle py-1 text-center text-[10.5px] font-medium text-foreground transition-colors hover:border-border hover:bg-surface-muted {timeString ===
						'12:00'
							? 'border-primary/50 bg-primary/10 font-semibold text-primary'
							: ''}"
					>
						12:00
					</button>
					<button
						type="button"
						onclick={() => setPresetTime('17:00')}
						class="cursor-pointer rounded-md border border-border/70 bg-surface-subtle py-1 text-center text-[10.5px] font-medium text-foreground transition-colors hover:border-border hover:bg-surface-muted {timeString ===
						'17:00'
							? 'border-primary/50 bg-primary/10 font-semibold text-primary'
							: ''}"
					>
						17:00
					</button>
					<button
						type="button"
						onclick={() => setPresetTime('21:00')}
						class="cursor-pointer rounded-md border border-border/70 bg-surface-subtle py-1 text-center text-[10.5px] font-medium text-foreground transition-colors hover:border-border hover:bg-surface-muted {timeString ===
						'21:00'
							? 'border-primary/50 bg-primary/10 font-semibold text-primary'
							: ''}"
					>
						21:00
					</button>
				</div>
			</div>

			<!-- Footer Actions -->
			<div class="mt-3 flex items-center justify-between border-t border-border/70 pt-2.5">
				<button
					type="button"
					onclick={handleReset}
					class="cursor-pointer text-xs font-medium text-foreground-subtle transition-colors hover:text-foreground hover:underline"
				>
					Reset
				</button>
				<button
					type="button"
					onclick={handleDone}
					class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-red-700"
				>
					<IconCheck class="size-3.5" />
					<span>Selesai</span>
				</button>
			</div>
		</div>
	</Popover>

	{#if showClear}
		<button
			type="button"
			aria-label="Hapus batas waktu"
			onclick={handleClear}
			class="absolute top-1/2 right-2 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-foreground-subtle transition-colors hover:bg-surface-subtle hover:text-foreground focus:outline-hidden"
		>
			<IconX class="size-3.5" />
		</button>
	{/if}
</div>
