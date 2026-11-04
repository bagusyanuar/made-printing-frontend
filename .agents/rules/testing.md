# Testing Rules

The filename decides which runner a test lands in. Get the suffix wrong and the test either never runs or runs in an environment where it cannot work.

## 1. The Four Suites

| Suffix                    | Project     | Environment           | Use for                                     |
| ------------------------- | ----------- | --------------------- | ------------------------------------------- |
| `*.spec.ts` / `*.test.ts` | `server`    | Node                  | Pure functions, mappers, schemas, use cases |
| `*.svelte.spec.ts`        | `client`    | Chromium (Playwright) | Component behaviour, DOM, user interaction  |
| `*.stories.svelte`        | `storybook` | Chromium (Playwright) | Story smoke tests and `play` interactions   |
| `*.e2e.ts`                | Playwright  | Chromium, built app   | Full-app flows against `npm run preview`    |

Run one suite with `npx vitest run --project <server\|client\|storybook>`. `npm test` runs the vitest suites then the Playwright e2e suite.

## 2. Put Logic Where It Can Be Tested Cheaply

- **Rule:** Extract decision logic into a plain `.ts` module and test it in the `server` project. A browser test that only needed to check a calculation is slow for no benefit.
- **Example:** page-range truncation lives in `data-table.pagination.ts` with `data-table.pagination.spec.ts` beside it, not inside the pagination component.
- **Rule:** Reach for a `*.svelte.spec.ts` when the thing under test is genuinely the rendered result — focus movement, event wiring, ARIA state, conditional markup.
- **Rule:** Test use-cases and stores by **injecting a fake**, never by mocking modules. `createAuthUseCases(fakeRepository)` and `new AuthStore(fakeUseCases)` are why those factories exist. If a test needs `vi.mock` to reach a dependency, the production wiring is wrong — fix the wiring, not the test.
- **Rule:** A `.svelte.ts` module that only uses `$state`/`$derived` (a store class, no `$effect`) runs fine in the `server` project. Only reach for the browser suite when the code needs an actual component instance.

## 3. Reproduce Before Fixing

- **Rule:** When a bug is reported in a component, write the failing test first and watch it fail for the reported reason. A fix with no failing test behind it is a guess.
- **Rule:** Keep that test after the fix. The regression test is the deliverable, not a by-product.

## 4. Component Tests Need a Real Component

- **Rule:** `render()` mounts a component, so anything requiring component initialisation — see the [`$effect` rules](./svelte-best-practices.md) — must live inside a component, not in the spec file.
- **Rule:** When a component needs non-trivial setup (a table instance, seeded data, controlled state), build a small `*.demo.svelte` harness beside it and render that. Use the same harness for the Storybook stories so the story and the test cannot drift apart.

## 5. Assertions Are Mandatory

- **Rule:** `expect.requireAssertions` is on. A test that finishes without an assertion fails.
- **Rule:** Assert the user-visible contract (`aria-current`, rendered text, focus) rather than internal state. Prefer `getByRole` with `exact: true` when a name is a prefix of another — `{ name: 'Page 1' }` also matches `Page 12`.
- **Rule:** `getByLabel('Password')` matches the `Show password` toggle inside `Passwordfield` as well as the input — a strict-mode violation. Target the field by id (`locator('#password')`) or by an exact role name.

## 6. Guards and Redirects Need an E2E Test

- **Rule:** A route guard is only proven by a real navigation. Cover it in a `*.e2e.ts` beside the feature: anonymous visitor bounced to login, `redirectTo` preserved, successful login landing on the target, logout returning to login.
- **Rule:** Mock repositories hold session state in memory only, so a full page load starts logged out. Perform the login inside the test rather than assuming a session carries across `page.goto()`.
