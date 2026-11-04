---
description: Audit a slice against this project's four UI/UX skills (ux-heuristics-slicing, interaction-states, visual-hierarchy-scale, layout-composition) and report ranked, grounded findings.
argument-hint: '[file-or-feature-path] (defaults to the page/component currently under discussion)'
---

Audit the target below against this project's four UI/UX skills. Follow the process exactly — this exists so the audit is grounded in real code and real component source, not generic UX commentary.

**Target**: $ARGUMENTS

If no target was given, use the file(s) most recently discussed or edited in this conversation. If neither applies, ask which page/component to audit before doing anything else.

## Process

1. **Load all four skills first**, via the Skill tool, before reading any code: `ux-heuristics-slicing`, `interaction-states`, `visual-hierarchy-scale`, `layout-composition`. Each skill ends with its own `## Check` checklist — those checklists together are the audit criteria. Do not audit from memory of what these skills say; load them fresh every run.
2. **Read the actual target file(s) in full** — the page, its child components, and the hooks/stores it depends on for state (loading/error/success signals in particular). Do not audit from a screenshot or description alone if the source is available; a visual issue and a code-level cause are not always the same thing (see this project's own login-page audits for examples: a dark card was a theme-persistence bug, not a color choice; a footer's fragile spacing was a `position: fixed` decoupled from its flow, not a spacing-value problem).
3. **Go through every checklist item from all four skills' `## Check` sections against the actual code**, not impressions. For each item, either confirm it passes (briefly note why, do not list every pass as a "finding") or flag a concrete failure with:
   - The exact file and line/section.
   - Which law/principle it violates.
   - The concrete failure scenario (what a user experiences, not just "this looks wrong").
   - A specific fix (or "not fixable here" with the reason, e.g. a third-party component's internals — see `PasswordField`'s hit-target gap in `ux-heuristics-slicing` for the shape of that kind of honest limitation).
4. **Recognize when a checklist item is deliberately, correctly overridden** by a stronger principle instead of flagging it as broken — e.g. a centered card header above a left-aligned form breaks `layout-composition`'s continuity rule on paper, but is justified by `ux-heuristics-slicing`'s Jakob's Law section. State the override explicitly rather than either silently passing it or wrongly flagging it.
5. **Rank findings most-severe first.** Severity order: a real bug users will hit (broken state, misleading affordance, inaccessible target) > an inconsistency against this project's own established tokens/patterns > a purely aesthetic preference with no functional cost.
6. **Do not apply any fix automatically.** Report findings, then ask which ones (if any) to fix — same as every prior audit in this project's login-page work. If asked to fix, re-run the relevant `npm run check` / `npm run lint` / `npx vitest run --project server` afterward and report the result plainly.

## Output shape

A short ranked list, one finding per item: what, where (file:line), which principle, why it matters, suggested fix. Skip preamble and skip restating what the skills say in general — every line should be specific to the audited target. End by asking which findings to act on.
