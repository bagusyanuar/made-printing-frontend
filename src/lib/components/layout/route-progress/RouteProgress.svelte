<script lang="ts">
	import { navigating } from '$app/state';

	let progress = $state(0);
	let visible = $state(false);
	let growTimer: ReturnType<typeof setInterval> | undefined;
	let hideTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const isNavigating = navigating.to !== null;

		if (isNavigating) {
			clearTimeout(hideTimer);
			clearInterval(growTimer);
			visible = true;
			progress = 0.08;
			growTimer = setInterval(() => {
				progress = progress + (0.94 - progress) * 0.12;
			}, 180);
		} else if (visible) {
			clearInterval(growTimer);
			progress = 1;
			hideTimer = setTimeout(() => {
				visible = false;
				progress = 0;
			}, 200);
		}

		return () => {
			clearInterval(growTimer);
			clearTimeout(hideTimer);
		};
	});
</script>

{#if visible}
	<div class="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-0.5">
		<div
			class="h-full bg-primary transition-[width] duration-200 ease-out"
			style="width: {progress * 100}%"
		></div>
	</div>
{/if}

