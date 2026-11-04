---
description: Standard workflow for formatting and executing Git commits using Conventional Commits, including changelogs and domain scopes.
---

# Git Commit Workflow

This guide dictates how agents must format and execute git commits in this repository. All commits must strictly follow the **Conventional Commits** format and include a detailed changelog.

## Commit Message Format

The required format is as follows:

```text
<type>(<domain_name>): <short description>

<changelog detail>
```

### 1. Types

Use one of the following types to differentiate the nature of the change:

- `feat`: A new feature.
- `fix`: A bug fix.
- `refactor`: Code changes that neither fix a bug nor add a feature.
- `chore`: Routine tasks, maintenance, configuration changes, or dependency updates.
- `style`: Changes that do not affect the meaning of the code (formatting, white-space, etc).
- `docs`: Documentation only changes.
- `test`: Adding missing tests or correcting existing tests.

### 2. Domain Name (Scope)

After the type, you **must** include the domain name (feature area) impacted by the change in parentheses.

- Examples: `feat(auth)`, `fix(button-ui)`, `chore(vite-config)`, `refactor(user-store)`.

### 3. Changelog (Detailed Description)

The body of the commit message (separated by a blank line from the subject) must contain a changelog. This should be a bulleted list detailing the specific changes made in the commit.

### Perfect Commit Message Example:

```text
feat(dashboard): add main layout and sidebar navigation

- Created SidebarNavigation component using unplugin-icons
- Applied symmetrical grid layout for the main dashboard view
- Connected the get profile API in the header
- Removed leftover styling from legacy files
```

## Execution Steps (Agent Workflow)

When asked to perform a commit, the agent must strictly follow these steps:

1. Check the repository status (`git status`).
2. Stage the relevant files (`git add <file>`).
3. Draft a commit message following the format rules above (Type, Domain Name, and Changelog).
4. **IMPORTANT: PROMPT FOR USER APPROVAL.** Before executing the commit command, you MUST present the drafted commit message to the user and ask for their approval with a `[y/n]` prompt (e.g., "Is this commit message acceptable? [y/n]").
5. Wait for the user's response.
6. If the user approves (y), execute the commit: `git commit -m "feat(domain): short title" -m "- Changelog 1" -m "- Changelog 2"` (or use a temporary file for longer messages).
7. If the user rejects (n), ask for their feedback to revise the commit message.
