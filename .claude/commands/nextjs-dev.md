<!-- Implements a user story from its approved plan in docs/plans/, on a feature branch, then opens a PR. -->

# Task: Implement a Next.js user story from its approved plan

You are a Senior Full-Stack Engineer working on this Next.js affiliate storefront. Your job is to implement the user story **$ARGUMENTS** end-to-end: branch → code → verify → PR.

---

## Behavior

### 1. Validate the plan

Check that `docs/plans/$ARGUMENTS.md` exists and its **Status** is `Approved`.
If the file is missing or the status is not `Approved`, stop and tell the user.

### 2. Initialize Next.js context

Call the `mcp__next-devtools__init` tool with the project path. Mandatory before any Next.js work.

### 3. Prepare the feature branch

```bash
git checkout main
git pull
git checkout -b feat/$ARGUMENTS
```

### 4. Read the plan in full

Read `docs/plans/$ARGUMENTS.md` and identify:

- Every file to create or modify (Section 4).
- Step-by-step execution order (Section 7).
- Acceptance-criteria table (Section 8).
- Definition of Done checklist (Section 10).

### 5. Implement — follow the execution order exactly

For each step in Section 7:

- Prefer editing existing files over creating new ones.
- Write no comments unless the WHY is non-obvious.
- Do not pre-empt work owned by other stories.
- Run `npm run typecheck` after each non-trivial change to catch errors early.

### 6. Verify in the browser

Start `npm run dev` in the background and wait for "Ready" in the logs.

Use `mcp__next-devtools__browser_eval` to:

1. Navigate to every route touched by this story.
2. Take a screenshot.
3. Check browser console — a 404 on `/favicon.ico` is acceptable; anything else must be investigated and fixed.

Stop the dev server after verification.

### 7. Run acceptance criteria

Work through every scenario in Section 8 of the plan. For each:

- Run the prescribed command or browser check.
- Note pass or fail.
- If a scenario fails, fix the code and re-run before moving on.

Repeat until **all** AC scenarios pass.

### 8. Run the production build

```bash
npm run build
```

Confirm exit 0 and that affected routes show `○ (Static)` (or the render strategy specified in the plan).

### 9. Update the plan document

In `docs/plans/$ARGUMENTS.md`:

- Change `**Status:** Approved` → `**Status:** Done`
- Tick every checkbox in the Definition of Done section (replace `[ ]` with `[x]`).

### 9b. Update the codebase structure docs (if structure changed)

If this story added, moved, renamed, or removed any of the following, update **both** `CLAUDE.md` and `README.md` `## Codebase structure` sections in the same commit:

- A top-level folder, or a non-trivial subfolder under `app/`, `components/`, `lib/`, `content/`, `static/`, `types/`, `docs/`.
- A new route (add the row to the route map; flip the corresponding row to ✅ when implemented).
- A new module convention (e.g., a new path alias in `tsconfig.json`, a new file-naming rule, a new place where a category of file lives).
- A new top-level config file that other contributors will need to know about.

Rules:

- Keep the two sections in sync — same tree, same conventions, same route map. Only the surrounding prose differs (CLAUDE.md is for agents, README.md is public-facing).
- Bump the `> Last updated:` line to reference this story (e.g., `> Last updated: US00018 (added /san-pham route + lib/products.ts loader)`).
- If the story did **not** change structure, skip this step. Do not touch the doc just to bump the marker.

### 10. Commit

Stage only relevant files (never `.env*`, secrets, or unrelated changes). Commit message:

```
feat($ARGUMENTS): <short description>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### 11. Push and open a PR

```bash
git push -u origin feat/$ARGUMENTS
```

Create a PR with `gh pr create`:

- **Base branch:** `main`
- **Title:** `feat($ARGUMENTS): <short description>` (≤70 chars)
- **Body:** summary bullets + test plan checklist (use the AC scenarios as the checklist).

Return the PR URL to the user.

---

## Rules

- Never commit directly to `main`.
- Never skip `npm run typecheck` or `npm run build`.
- Always verify in a real browser via `mcp__next-devtools__browser_eval` before calling the story done.
- All user-facing copy must be in Vietnamese; code and identifiers stay in English.
- Affiliate links must use `target="_blank" rel="noopener noreferrer sponsored"`.
- Price format: `₫1.200.000`. Date format: `02 tháng 5, 2026`.
