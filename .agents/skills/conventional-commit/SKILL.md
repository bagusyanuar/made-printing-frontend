---
name: conventional-commit
description: Generate Conventional Commit messages with a domain scope and a changelog body for this project, splitting by domain when needed, and always confirming with the user before committing. Trigger when the user asks to commit changes or write a commit message.
---

# Conventional Commit Workflow

When the user asks to commit changes in this repository, follow this exact procedure.

## 1. Format

```
<type>(<domain>): <short summary>

- <changelog bullet 1>
- <changelog bullet 2>
```

**Types** (pick the one that best matches the change):

- `feat` — new feature/page/component/capability
- `fix` — bug fix
- `chore` — tooling, deps, config, non-production code
- `refactor` — code change that neither fixes a bug nor adds a feature
- `docs` — documentation only (including `.claude/skills/**`, `CLAUDE.md`, `README.md`)
- `test` — adding/fixing tests
- `perf` — performance improvement
- `style` — formatting/class-order/whitespace only, no behaviour change
- `build` — build system, Vite/SvelteKit config
- `ci` — CI/CD pipeline changes

**Domain** = the module/feature area affected. Prefer matching the `src/features/<domain>` folder name when the change is inside a feature (`area`, `auth`, `dashboard`). For changes to the app shell or shared UI, use the most descriptive short scope actually touched — this repo's own history sets the precedent: `layout`, `sidebar`, `theme`, `ui`, `claude` (skills/rules), `deps`, `config`. A change spanning one feature's presentation layer plus its own hook/store still counts as that feature's domain — the scope is the feature, not the layer.

**Summary**: imperative mood, lowercase, no trailing period (e.g. `add delete confirmation dialog`, not `Added delete confirmation dialog.`).

**Changelog body**: bullet list of what actually changed, one line per meaningful change — not a restatement of the summary.

Example (matches this repo's real history):

```
feat(area): rebuild master-area on dystopia-linear-lib, add delete flow

- migrate AreaFormModal to dystopia-linear-lib Dialog/Combobox
- add AreaDeleteDialog confirm-before-delete flow
- extract use-area-page.svelte.ts hook, page component down to composition
```

## 2. One Domain Per Commit

Before writing any commit message, inspect the actual diff (`git status`, `git diff`). If the changes span **more than one domain** (e.g. touched both `src/features/area` and `src/features/auth`, or mixed a feature change with unrelated `.claude/skills/**` updates), **split into multiple commits** — one per domain — instead of bundling everything into one commit. Stage only the files relevant to each domain per commit (`git add <specific files>`), never a blanket `git add -A`/`git add .` across unrelated domains.

A feature change plus the skill-doc updates it prompted (see `.claude/skills/**`) is a common split in this repo: the app-code commit gets the feature's domain (`feat(area): …`), the doc-only follow-up gets `docs(claude): …` or `docs(<skill-name>): …`.

## 3. Always Confirm Before Committing

Never run `git commit` without asking first. For each proposed commit (or each one in a split series):

1. Show the exact commit message you intend to use.
2. Ask a **yes/no question**: does this commit message + the files staged for it look correct?
3. Only run `git commit` after explicit "yes". If "no", ask what to adjust and repeat.

For a split series, present the full split plan (list of commits with their messages and files) upfront, then confirm — either all at once or one by one, matching how the user answers. Never commit any of them until confirmed.

## 4. Standard Git Safety

Follow the project's usual git discipline: create new commits rather than `--amend`ing published ones, never force-push, review staged content for secrets before committing (check `git status` after any broad `git add`), and never skip hooks (`--no-verify`) unless explicitly told to. Run the CLAUDE.md verification suite (`npm run check`, `npm run lint`) before proposing a commit that touches app code — never propose a commit for a change that hasn't been verified.
