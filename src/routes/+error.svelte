<script lang="ts">
	import { page } from '$app/state';
	import { NotFoundPage, ForbiddenPage, ServerErrorPage } from '$lib/components/status-pages';
</script>

{#if page.status === 404}
	<NotFoundPage description={page.error?.message} />
{:else if page.status === 403}
	<ForbiddenPage description={page.error?.message} />
{:else}
	<ServerErrorPage error={page.error} />
{/if}

