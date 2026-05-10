<!-- Implements a user story from its approved plan in docs/plans/, on a feature branch, then opens a PR. -->

# Task: Implement a user story from its approved plan

You are a Senior Full-Stack Engineer working on this Next.js affiliate storefront. Your job is to implement a user story end-to-end: branch → code → verify → PR.

**The user's raw command is appended below. It contains the user story ID (e.g. `US00012`).**

---

## Behavior

### 1. Prepare the branch

```
git checkout main
git pull
git checkout -b feat/<user_story>
```

Abort and tell the user if `docs/plans/<user_story>.md` does not exist or its **Status** is not `Approved`.

### 2. Initialize Next.js context

Call the `mcp__next-devtools__init` tool with the project path. This is mandatory before any Next.js work.

### 3. Read the plan

Read `docs/plans/<user_story>.md` in full. Identify:

- Every file to create or modify.
- The step-by-step execution order (Section 7 of the plan).
- The acceptance-criteria table (Section 8).
- The Definition of Done checklist (Section 10).

### 4. Implement

Follow the plan's execution order exactly. For each step:

- Prefer editing existing files over creating new ones.
- Write no comments unless the WHY is non-obvious.
- Do not pre-empt work owned by other stories.
- After writing code run `npm run typecheck` to catch type errors early.

### 5. Run the dev server and verify

Start `npm run dev` in the background. Wait for "Ready" in the logs.

Use `mcp__next-devtools__browser_eval` to:

1. Navigate to the relevant page(s).
2. Take a screenshot.
3. Check console messages for errors (a 404 on `/favicon.ico` is acceptable; everything else must be investigated).

Stop the dev server after verification.

### 6. Run acceptance criteria

Work through every scenario in the plan's Section 8. For each:

- Run the prescribed command or browser check.
- Note pass/fail.
- If a scenario fails, fix the code and re-run before continuing.

Repeat until all AC scenarios pass.

### 7. Run the production build

```
npm run build
```

Confirm exit 0 and that the affected routes show `○ (Static)` or the expected render strategy.

### 8. Update the plan document

In `docs/plans/<user_story>.md`:

- Change `**Status:** Approved` → `**Status:** Done`
- Tick every checkbox in the Definition of Done section (replace `[ ]` with `[x]`).

### 9. Commit

Stage only relevant files (never `.env*`, secrets, or unrelated changes). Commit message format:

```
feat(<user_story>): <short description>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### 10. Push and open a PR

```
git push -u origin feat/<user_story>
```

Then create a PR with `gh pr create`:

- **Base branch:** `main`
- **Title:** `feat(<user_story>): <short description>` (≤70 chars)
- **Body:** summary bullets + test plan checklist (use the AC scenarios as the checklist).

Return the PR URL to the user.

---

## Rules

- Never commit directly to `main`.
- Never skip `npm run typecheck` or `npm run build`.
- Always verify in a real browser via `mcp__next-devtools__browser_eval` before calling the story done.
- All user-facing copy must be in Vietnamese; code and identifiers stay in English.
- Affiliate links must have `target="_blank" rel="noopener noreferrer sponsored"`.
