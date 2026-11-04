---
name: superforms
description: sveltekit-superforms + Zod form pattern for this repo, an SPA with no server actions — the `superForm(defaults(zod4(schema)), {...})` recipe, the hook's `onUpdate` as the single owner of submit + side effects, the create/edit `form.reset()` seam, and the two submit-trigger variants depending on whether the button lives inside `<form>`. Use when writing or editing any `use-<name>-form.svelte.ts` hook, any form markup (Textfield, Passwordfield, Select, HelperText), or a domain `<feature>.schema.ts`.
---

# Superforms + Zod

Two real forms exist: `auth` (`use-login-form.svelte.ts` + `LoginForm.svelte`) and `master-area` (`use-master-area-form.svelte.ts` + `AreaFormModal.svelte`). Read both — they diverge on purpose in a couple of places, covered below.

This app has `ssr = false` and no `+page.server.ts` actions ([feature-architecture](../feature-architecture/SKILL.md) — "Never Create"). Superforms still runs, entirely client-side, via `SPA: true`. Every option below follows from that one fact.

## The Hook Recipe

`presentation/hooks/use-<name>-form.svelte.ts`. Never build the form in the component.

```ts
export function use<Feature>Form(options: { onSuccess: () => void }) {
  const form = superForm(defaults(zod4(schema)), {
    SPA: true,
    validators: zod4(schema),
    resetForm: false,
    async onUpdate({ form: validated }) {
      if (!validated.valid) return;

      const result = await useCases.create(validated.data);
      if (!result.success) {
        validated.message = result.error.message;
        return;
      }

      validated.message = 'Berhasil disimpan';
      options.onSuccess();
    }
  });

  return form;
}
```

- **`SPA: true` is mandatory**, always — there is no server to post to. Omitting it is a silent bug: the form appears to submit and nothing happens.
- **`defaults(zod4(schema))` for the initial adapter, `validators: zod4(schema)` for live validation** — both lines, every time, same schema.
- **`resetForm: false`** — a successful submit does not clear the fields itself. The caller decides what happens next (close a modal, `form.reset()` with new seed data, navigate away). Superforms' own post-submit reset is for a fresh-form-every-time flow this app doesn't have.
- **`onUpdate` is the only place the submit branch and its side effects meet.** Cache invalidation, navigation, closing a modal — all inside `onUpdate`, next to the call that triggered them. Don't split this across a component's `onclick`.
- **The schema always lives in `domain/<feature>.schema.ts`**, pinned with `satisfies z.ZodType<Input>` — see [type-safety](../type-safety/SKILL.md) for why the annotation form breaks superForm's `$form` inference.

## `message` Is Not Optional — Always Render It

`onUpdate` writes both the success text and `result.error.message` into the same `validated.message`. If the component never reads `form.message`, a use-case failure that isn't a per-field error — `NotFoundError`, `ForbiddenError`, anything the Zod schema can't catch — fails silently. The user sees the form just sit there.

`LoginForm.svelte` gets this right:

```svelte
$effect(() => {
  if ($message) {
    const msg = $message;
    untrack(() => {
      if (msg === 'Login successful!') toast.success(msg);
      else toast.error(msg);
    });
  }
});
```

`untrack` matters here — reading `msg` outside it would make the effect re-fire on every unrelated signal the toast call touches. Wrap the read, not the whole effect.

A form with no non-field failure mode (nothing beyond what Zod already validates) can skip this — but that's the exception, and it should be a conscious call, not an omission. Check every new form's `onUpdate` for a branch that sets `message` on failure, then check the component actually renders it.

## Two Submit Triggers — Pick Based on Where the Button Lives

**Button inside `<form>`:** use the native `type="submit"`, `use:enhance` handles the rest. This is the default and, since the `dystopia-linear-lib` migration below, the case every in-app modal form actually hits — its `Dialog` has no `footer` snippet, so the action row lives inside `children`, which means inside `<form>` too.

```svelte
<form method="POST" use:enhance novalidate>
	<!-- fields -->
	<div class="gap-cozy flex justify-end">
		<Button type="button" variant="ghost" onclick={() => (open = false)}>Batal</Button>
		<Button type="submit" disabled={$submitting}>Simpan</Button>
	</div>
</form>
```

The "Batal" button still needs `type="button"` — inside a `<form>`, an un-typed `<button>` defaults to `type="submit"` and would fire the form.

**Button outside `<form>`** — still the right call whenever a button is laid out outside the form markup for a reason unrelated to `Dialog` (a page-level toolbar, a sticky footer bar, anything not using `dystopia-linear-lib`'s `Dialog`): expose `submit` from the hook and call it explicitly. A `type="submit"` button out there does nothing; it isn't inside the element it would submit.

```svelte
<form method="POST" novalidate use:enhance>
	<!-- fields -->
</form>

<Button variant="ghost" onclick={() => (open = false)}>Batal</Button>
<Button onclick={() => submit()}>Simpan</Button>
```

Either way `use:enhance` still goes on the `<form>` tag — it's what makes `SPA: true` intercept the submit instead of a real POST.

## `dystopia-linear-lib`'s `Dialog`: Mandatory Trigger, No `footer` Snippet

`dystopia-linear-lib/components/dialog`'s `Dialog` (see the `dystopia-linear-lib` skill for the full component) has a different shape than the local `$lib/components/ui/dialog` this section originally assumed:

- **`trigger: Snippet` is a required prop, and the component always renders its own `<button>` around it** — there's no prop for a triggerless, fully externally-controlled dialog. A form modal like `AreaFormModal` that's opened only via `bind:open` from a parent (a row's "Edit" action, a page's "Tambah" button) still has to satisfy `trigger`. Hide it rather than leaving it as a second, redundant visible button:

  ```svelte
  <Dialog bind:open classes={{ trigger: 'hidden' }}>
  	{#snippet trigger()}{/snippet}
  	{#snippet title()}{isEditing ? 'Edit Area' : 'Tambah Area Baru'}{/snippet}
  	{#snippet description()}Kelola data master area — kode, nama, dan tipe area.{/snippet}
  	<!-- form -->
  </Dialog>
  ```

  `classes.trigger` (not a bare `class` prop — `DialogProps` omits `class` from the button attributes it forwards) merges `hidden` in after the component's own `inline-flex`, which `cn`'s `tailwind-merge` correctly resolves to `display: none`. `open` stays bindable and fully driven by the parent regardless of the hidden trigger's own click handler.

- **`title` and `description` are snippets, not string props** — the local `Dialog` took `title="Edit Area"`; this one takes `{#snippet title()}Edit Area{/snippet}`.
- **There is no `footer` snippet and no `close` callback exposed to a snippet parameter.** Every interactive element — fields, the action row — goes in `children`, which the component renders inside its own `<div class="mt-4">`. A "Batal"/cancel button reads and writes the component's own bindable `open` prop directly (`onclick={() => (open = false)}`) instead of calling a provided `close()`, since there isn't one.

## Create/Edit Seam: `form.reset({ data })`

A form that both creates and edits (typically inside a modal, driven by whether an entity was passed in) needs an `editingId` the hook owns, plus two entry points the component calls:

```ts
export function use<Feature>Form(options: { onSuccess: () => void }) {
  let editingId = $state<string | null>(null);
  const form = superForm(/* … */);

  function openCreate(): void {
    editingId = null;
    form.reset({ data: { code: '', name: '', type: 'internal' } });
  }

  function openEdit(entity: Entity): void {
    editingId = entity.id;
    form.reset({ data: { code: entity.code, name: entity.name, type: entity.type } });
  }

  return {
    form: form.form,
    errors: form.errors,
    constraints: form.constraints,
    enhance: form.enhance,
    message: form.message,
    submit: form.submit,
    get isEditing() {
      return editingId !== null;
    },
    openCreate,
    openEdit
  };
}
```

`onUpdate` reads `editingId` to decide `create` vs `update`, in the same closure.

The component drives `openCreate`/`openEdit` from whatever signal means "the modal just opened for this entity" — usually an `$effect` watching a bindable `open` prop, not the click handler that set it, so re-opening the same modal always reseeds:

```ts
$effect(() => {
	if (!open) return;
	if (entityToEdit) openEdit(entityToEdit);
	else openCreate();
});
```

`isEditing` is a getter, not a plain destructured field — destructuring it directly on the caller side snapshots the value once. If a component needs it reactively, wrap the property read in `$derived`, not the getter itself.

## Hook Return Shape: Narrow Only When There's a Reason To

`useLoginForm` returns the raw `superForm(...)` object — nothing to hide, no extra methods. `use<Feature>Form` above returns a narrowed object because it has to expose `openCreate`/`openEdit`/`isEditing` alongside the form fields. Don't narrow a hook that has nothing to add over the raw superForm return; don't leave a hook un-narrowed once it grows entity-specific methods, or callers end up reading `form.form.form` to get past the wrapper.

## Field Markup Convention

**Two component sources exist side by side** — which one a file uses depends on whether it's been migrated per the `dystopia-linear-lib` skill's mandatory-for-new-slicing rule. `LoginForm.svelte` (`auth`, not yet migrated) still uses the local `$lib/components/ui` set; `AreaFormModal.svelte` (`area`, migrated) uses `dystopia-linear-lib`. The two field components have **different prop shapes for errors** — check which import a file already has before copying either recipe.

**Local `$lib/components/ui` (legacy, e.g. `LoginForm.svelte`):**

```svelte
<div class="flex flex-col gap-1.5">
	<Label for="area-code" required>Kode Area</Label>
	<Textfield
		id="area-code"
		name="code"
		bind:value={$form.code}
		invalid={Boolean($errors.code)}
		{...$constraints.code}
	/>
	<HelperText errors={$errors.code} reserveSpace />
</div>
```

`HelperText errors={$errors.field} reserveSpace` — the local component takes the raw errors array and a boolean that reserves the line height itself. Add `icon={false}` when the surrounding layout is dense.

**`dystopia-linear-lib` (mandatory for new slicing, e.g. `AreaFormModal.svelte`):**

```svelte
<div class="gap-tight flex flex-col">
	<Label for="area-code" required>Kode Area</Label>
	<TextField
		id="area-code"
		name="code"
		bind:value={$form.code}
		invalid={Boolean($errors.code)}
		{...$constraints.code}
	/>
	{#if $errors.code}
		<HelperText invalid class="text-xs">{$errors.code[0]}</HelperText>
	{/if}
</div>
```

The library's `HelperText` (`dystopia-linear-lib/components/helper-text`) only takes `invalid` and `children` — no `errors` array prop, no `reserveSpace`. **This app's chosen convention for `dystopia-linear-lib` forms is the opposite of the local one: render `HelperText` only when an error exists, wrapped in `{#if $errors.field}`, rather than always rendering it with a space fallback to reserve the line.** A field group's own `gap-tight`/`gap-loose` between fields already reads as generous once every field skips an empty reserved line — the local component's `reserveSpace` behavior was fighting that density, not helping it. The tradeoff (accepted deliberately): a field can shift slightly when an error appears or clears, since the line isn't always present. Note the casing difference too: `TextField`, not `Textfield`.

`class="text-xs"` on every `HelperText` is deliberate too — the component's own default is `text-sm`, the same size as the field's own input text and label, which read as too heavy for a one-line validation message sitting directly under the field it describes.

Both variants share the rest:

- `id` on the field, `for` matching it on `Label` — not `name` for the `for` match, they can differ.
- `name` on the field is what superforms' native-fallback posting and `$constraints` spreading rely on — never drop it, even though `SPA: true` means no real POST happens.
- `invalid={Boolean($errors.field)}`, always computed, never a raw truthy check on a possibly-empty array.
- `{...$constraints.field}` spread after `invalid` — it can carry `required`/`minlength`/`maxlength` that native validation would otherwise apply on top of superforms' own.
- A field bound to an enum skips `constraints` (nothing native to constrain) but keeps `bind:value` and its own conditional `HelperText`. Two library components fit an enum field, pick based on the option count and whether search matters:

  **`Select`** — native `<select>` semantics, wants raw `<option>` elements as `children` instead of an `options` array prop:

  ```svelte
  <Select id="area-type" name="type" bind:value={$form.type} invalid={Boolean($errors.type)}>
  	{#each TYPE_OPTIONS as option (option.value)}
  		<option value={option.value}>{option.label}</option>
  	{/each}
  </Select>
  ```

  **`Combobox`** — searchable, richer styling, the choice `AreaFormModal.svelte` actually makes for its two-option `type` field. Takes an `options: ComboboxOption<T>[]` array directly (no children), and its generic `T` is inferred from that array — type it explicitly against the domain enum so `bind:value` matches the schema's narrower type instead of widening to `string`:

  ```ts
  import type { ComboboxOption } from 'dystopia-linear-lib/components/combobox';
  import type { AreaType } from '../../domain/area.entity';

  const TYPE_OPTIONS: ComboboxOption<AreaType>[] = [
  	{ value: 'internal', label: 'Internal' },
  	{ value: 'external', label: 'External' }
  ];
  ```

  ```svelte
  <Combobox
  	id="area-type"
  	name="type"
  	options={TYPE_OPTIONS}
  	bind:value={$form.type}
  	invalid={Boolean($errors.type)}
  	labels={{ placeholder: 'Pilih tipe area' }}
  />
  ```

  `Combobox`'s `name` prop renders its own hidden `<input>` for superforms' native-fallback posting, same job `name` does on `TextField`/`Select`.

## Checklist

- [ ] `SPA: true` set
- [ ] `defaults(zod4(schema))` and `validators: zod4(schema)` both present, same schema
- [ ] `onUpdate` sets `validated.message` on both the success path and every failure path
- [ ] The component actually reads and renders `form.message` — or there's a documented reason it can't fail outside Zod
- [ ] Submit trigger matches where the button lives (native `type="submit"` inside `<form>`, explicit `submit()` outside it)
- [ ] Edit/create forms reset via `form.reset({ data })` in `openCreate`/`openEdit`, driven by an `$effect` on the open signal — not the click handler
- [ ] Every field has `id`, `name`, `bind:value`, `invalid={Boolean($errors.x)}`, `{...$constraints.x}`, and a `HelperText`
- [ ] Schema lives in `domain/<feature>.schema.ts`, pinned with `satisfies`
