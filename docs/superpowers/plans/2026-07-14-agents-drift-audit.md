# AGENTS Drift Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit all 21 repository-local `AGENTS.md` files and update only guidance that demonstrably drifted from the current Voidreaper codebase.

**Architecture:** Treat each `AGENTS.md` as a scoped operational contract. Establish repository-wide evidence first, apply small edits only where current paths or contracts prove drift, then validate every local link and npm command across the complete AGENTS set.

**Tech Stack:** Markdown, PowerShell, ripgrep, Git, Node.js/npm.

## Global Constraints

- Review all 21 repository-local `AGENTS.md` files.
- Do not modify production code, tests, or unrelated documentation.
- Preserve correct guidance and existing file structure.
- Do not add volatile test counts, commit hashes, branch names, or temporary working-tree state.
- Every changed line must be backed by a current code path, validator, or npm script.

---

### Task 1: Establish the audit evidence and file classifications

**Files:**
- Inspect: `AGENTS.md`
- Inspect: `docs/AGENTS.md`
- Inspect: `scripts/AGENTS.md`
- Inspect: `src/AGENTS.md`
- Inspect: `src/app/AGENTS.md`
- Inspect: `src/audio/AGENTS.md`
- Inspect: `src/content/AGENTS.md`
- Inspect: `src/content/ship-assembly/AGENTS.md`
- Inspect: `src/core/AGENTS.md`
- Inspect: `src/features/AGENTS.md`
- Inspect: `src/features/ship-assembly/AGENTS.md`
- Inspect: `src/features/tutorial/AGENTS.md`
- Inspect: `src/input/AGENTS.md`
- Inspect: `src/legacy/AGENTS.md`
- Inspect: `src/persistence/AGENTS.md`
- Inspect: `src/render/AGENTS.md`
- Inspect: `src/render/ship-assembly/AGENTS.md`
- Inspect: `src/runtime/AGENTS.md`
- Inspect: `src/styles/AGENTS.md`
- Inspect: `src/ui/AGENTS.md`
- Inspect: `src/ui/ship-assembly/AGENTS.md`

**Interfaces:**
- Consumes: Current repository tree, `package.json`, validators under `scripts/`, recent commits, and the current working tree.
- Produces: An in-session classification of every AGENTS file as `update` or `unchanged`, with one concrete evidence statement per file.

- [ ] **Step 1: Enumerate the complete AGENTS set**

Run:

```powershell
rg --files -g 'AGENTS.md' | Sort-Object
```

Expected: Exactly 21 paths, from root `AGENTS.md` through `src/ui/ship-assembly/AGENTS.md`.

- [ ] **Step 2: Verify current commands and recent change areas**

Run:

```powershell
Get-Content -Raw package.json
git log -12 --oneline
git status --short
```

Expected: `test`, `test:frontend`, `validate-content`, `validate:assembly`, `validate:tutorial`, and `build` exist; recent hangar/loadout work is visible; working-tree state is recorded before documentation edits.

- [ ] **Step 3: Check every file against its owning directory**

Run:

```powershell
$files = rg --files -g 'AGENTS.md' | Sort-Object
foreach ($file in $files) {
  $directory = Split-Path $file -Parent
  if (-not $directory) { $directory = '.' }
  [pscustomobject]@{
    Agents = $file
    Directory = $directory
    DirectoryExists = Test-Path $directory
  }
}
```

Expected: Every scoped directory exists. Classify a file for update only after checking its named paths and contracts against current code.

---

### Task 2: Refresh repository, documentation, scripts, and content guidance where drift is proven

**Files:**
- Modify if drift is confirmed: `AGENTS.md`
- Modify if drift is confirmed: `docs/AGENTS.md`
- Modify if drift is confirmed: `scripts/AGENTS.md`
- Modify if drift is confirmed: `src/content/AGENTS.md`
- Leave unchanged unless separate evidence appears: `src/content/ship-assembly/AGENTS.md`

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-07-14-hangar-catalog-selection-design.md`, `docs/superpowers/plans/2026-07-14-hangar-catalog-selection.md`, `scripts/validate-content.mjs`, and `package.json`.
- Produces: Current repo-level references and explicit validator contracts without duplicating feature design.

- [ ] **Step 1: Add missing current design references only where the existing reference lists are incomplete**

Add these links to the existing `Key Docs` / `Good References` lists when absent:

```markdown
- [docs/superpowers/specs/2026-07-14-hangar-catalog-selection-design.md](docs/superpowers/specs/2026-07-14-hangar-catalog-selection-design.md)
- [docs/superpowers/plans/2026-07-14-hangar-catalog-selection.md](docs/superpowers/plans/2026-07-14-hangar-catalog-selection.md)
```

For `docs/AGENTS.md`, use paths relative to `docs/`:

```markdown
- [superpowers/specs/2026-07-14-hangar-catalog-selection-design.md](superpowers/specs/2026-07-14-hangar-catalog-selection-design.md)
- [superpowers/plans/2026-07-14-hangar-catalog-selection.md](superpowers/plans/2026-07-14-hangar-catalog-selection.md)
```

- [ ] **Step 2: Make the current validation contract explicit where it prevents false fixes**

In `src/content/AGENTS.md`, add the verified catalog rule without changing unrelated content guidance:

```markdown
- `validate-content` requires both `id` and `name` for ships, weapons, reactors, modules, and socket chips; do not add UI fallbacks that hide a missing required name.
```

In `scripts/AGENTS.md`, add only if not already stated equivalently:

```markdown
- When a UI review suggests tolerating missing catalog fields, check `validate-content.mjs` first; required-field fallbacks can mask invalid content instead of improving resilience.
```

- [ ] **Step 3: Review the focused diff**

Run:

```powershell
git diff -- AGENTS.md docs/AGENTS.md scripts/AGENTS.md src/content/AGENTS.md src/content/ship-assembly/AGENTS.md
```

Expected: Only missing references and validator-backed content guidance change; ship-assembly content guidance stays untouched unless independent drift was found.

- [ ] **Step 4: Commit the focused documentation update**

```powershell
git add AGENTS.md docs/AGENTS.md scripts/AGENTS.md src/content/AGENTS.md
git commit -m "docs: refresh repository agent guidance"
```

Expected: Commit contains only files actually changed in this task.

---

### Task 3: Refresh hangar ownership and persistence guidance where drift is proven

**Files:**
- Modify if drift is confirmed: `src/AGENTS.md`
- Modify if drift is confirmed: `src/app/AGENTS.md`
- Modify if drift is confirmed: `src/features/AGENTS.md`
- Modify if drift is confirmed: `src/persistence/AGENTS.md`
- Modify if drift is confirmed: `src/styles/AGENTS.md`
- Modify if drift is confirmed: `src/ui/AGENTS.md`
- Leave unchanged unless separate evidence appears: all remaining subsystem AGENTS files.

**Interfaces:**
- Consumes: `src/app/bootstrap.js`, `src/features/equipment/loadout-service.js`, `src/persistence/save-store.js`, `src/ui/screens/hangar-screen.js`, `src/styles/hangar.css`, and matching tests.
- Produces: Correct ownership and save-mutation guidance for future hangar/catalog changes.

- [ ] **Step 1: Document the verified feature/UI ownership boundary**

Add the following guidance at the narrowest applicable scopes, avoiding duplication where an equivalent rule already exists:

For `src/features/AGENTS.md`:

```markdown
- Equipment catalog state (unlock status and equipped-slot mapping) is derived in `features/equipment/loadout-service.js`; UI catalogs should consume that domain state rather than rebuilding it.
```

For `src/ui/AGENTS.md`:

```markdown
- Hangar catalogs own query/status/type filtering, presentation sorting, and selection UI; unlock state and equipped-slot mapping come from the equipment feature layer.
```

- [ ] **Step 2: Document the verified persistence concurrency boundary**

For `src/app/AGENTS.md`, add:

```markdown
- Loadout mutations must run inside `services.save.update(save => ...)` and derive the primary loadout from that callback's current `save`; cloning an outer `metaSave` snapshot can lose concurrent equip actions.
```

For `src/persistence/AGENTS.md`, add:

```markdown
- `save.update` serializes mutations and passes each mutator a fresh clone of the latest persisted save; callers must derive mutation inputs inside the callback, not from an earlier UI snapshot.
```

- [ ] **Step 3: Document the clipped selected-state styling constraint**

In `src/styles/AGENTS.md`, add `hangar.css` to `Good Targets` and add:

```markdown
- Elements using `clip-path` also clip positive-offset outlines; use an inset marker for selected states that must remain visible inside the clipped shape.
```

- [ ] **Step 4: Keep broad source guidance concise**

Update `src/AGENTS.md` only if the current cross-layer guidance does not already cover the new feature/UI boundary. If no new non-duplicative rule is needed, leave it unchanged and record that decision in the handoff.

- [ ] **Step 5: Review the focused diff**

Run:

```powershell
git diff -- src/AGENTS.md src/app/AGENTS.md src/features/AGENTS.md src/persistence/AGENTS.md src/styles/AGENTS.md src/ui/AGENTS.md
```

Expected: Small additions at owning layers only; no production code or unrelated subsystem guidance changes.

- [ ] **Step 6: Commit the focused subsystem update**

```powershell
git add src/AGENTS.md src/app/AGENTS.md src/features/AGENTS.md src/persistence/AGENTS.md src/styles/AGENTS.md src/ui/AGENTS.md
git commit -m "docs: align agent guidance with hangar contracts"
```

Expected: Commit includes only AGENTS files that actually changed.

---

### Task 4: Validate every AGENTS file and report unchanged scopes

**Files:**
- Verify: all 21 `AGENTS.md` files
- Verify: `package.json`

**Interfaces:**
- Consumes: The complete post-edit AGENTS set.
- Produces: Link, command, whitespace, and scope evidence for final handoff.

- [ ] **Step 1: Verify all local Markdown links**

Run this repository-relative PowerShell check:

```powershell
$errors = @()
$agents = rg --files -g 'AGENTS.md' | Sort-Object
foreach ($file in $agents) {
  $base = Split-Path $file -Parent
  if (-not $base) { $base = '.' }
  $content = Get-Content -Raw $file
  foreach ($match in [regex]::Matches($content, '\[[^\]]+\]\(([^)]+)\)')) {
    $target = $match.Groups[1].Value.Split('#')[0]
    if (-not $target -or $target -match '^[a-z]+://') { continue }
    $resolved = [System.IO.Path]::GetFullPath((Join-Path $base $target))
    if (-not (Test-Path $resolved)) { $errors += "$file -> $target" }
  }
}
if ($errors.Count) { $errors; exit 1 }
"Validated $($agents.Count) AGENTS files; all local links resolve."
```

Expected: `Validated 21 AGENTS files; all local links resolve.`

- [ ] **Step 2: Verify every npm command named by AGENTS exists**

Run:

```powershell
$scripts = (Get-Content -Raw package.json | ConvertFrom-Json).scripts.PSObject.Properties.Name
$commands = rg -o --no-filename 'npm run [a-zA-Z0-9:_-]+' -g 'AGENTS.md' |
  ForEach-Object { ($_ -split 'npm run ')[1] } |
  Sort-Object -Unique
$missing = $commands | Where-Object { $_ -notin $scripts }
if ($missing) { $missing; exit 1 }
"Validated npm scripts: $($commands -join ', ')"
```

Expected: Every named `npm run` command is present in `package.json`.

- [ ] **Step 3: Verify scope and whitespace**

Run:

```powershell
git diff --check
git status --short
git diff --stat HEAD~2..HEAD
```

Expected: No whitespace errors; only the audit plan/spec and drift-backed AGENTS files appear in the documentation commits.

- [ ] **Step 4: Produce the audit handoff**

Report two explicit groups:

```text
Updated: each changed AGENTS file with one evidence-based reason.
Unchanged: each reviewed AGENTS file grouped by subsystem, with a brief statement that current ownership, paths, and validation guidance remain accurate.
```

Expected: All 21 files are accounted for exactly once.
