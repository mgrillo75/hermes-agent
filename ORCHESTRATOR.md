# Hermes Agent Orchestrator Notes

Living repo summary for future subagents. Keep this file current when architecture,
workflow, or fragile local state changes.

## Architecture Map

- `run_agent.py` owns the synchronous `AIAgent` conversation loop, model/tool
  calls, interrupt handling, budget behavior, and message history shape.
- `model_tools.py`, `toolsets.py`, and `tools/registry.py` form the tool
  discovery and dispatch chain. Tool files register through `registry.register`;
  exposed tools must still be listed in the relevant toolset.
- `cli.py` and `hermes_cli/` own the classic CLI, slash command registry,
  setup/config helpers, plugin loading, skin engine, dashboard backend, and
  Kanban CLI surfaces.
- `agent/` holds provider adapters, auxiliary model clients, memory, caching,
  compression, and runtime internals.
- `gateway/` owns platform adapters and message delivery. The dashboard chat
  embeds the real `hermes --tui` through `hermes_cli/pty_bridge.py` and
  `hermes_cli/web_server.py`; do not rebuild the primary chat transcript in
  React.
- `ui-tui/` is the Ink terminal UI; `tui_gateway/` is the Python JSON-RPC
  backend for it.
- `web/` is the React/Vite dashboard frontend. Build output goes to
  `hermes_cli/web_dist`.
- `plugins/` holds plugin systems and plugin assets, including
  `plugins/kanban/dashboard/` for the Kanban web UI.
- `tests/` is pytest-based and should normally be run through
  `scripts/run_tests.sh`, not raw `pytest`.

## Conventions

- On Windows, prefer `npm.cmd` because PowerShell may block `npm.ps1`.
- For Python tests, prefer `scripts/run_tests.sh` for CI-like isolation. When
  Windows tooling prevents that, report the fallback command and why.
- Never write tests or runtime code that hardcodes `~/.hermes`. Use
  `get_hermes_home()` for state paths and `display_hermes_home()` for
  user-facing paths. Runtime state under `C:\Users\MiguelGrillo\.hermes` is
  local/user-owned and read-only for repo work unless explicitly requested.
- Web work normally verifies with focused lint/type/build checks from `web/`.
  Use `npm.cmd --prefix web ...` from the repo root when practical.
- Dashboard API calls need the dashboard session token. Vite dev mode uses
  `web/vite.config.ts` to fetch the running dashboard HTML and inject
  `window.__HERMES_SESSION_TOKEN__`; protected `/api/*` calls will 401 if
  `hermes dashboard` is not running or `HERMES_DASHBOARD_URL` points at the
  wrong backend.
- Kanban is a durable SQLite-backed multi-agent work queue. The CLI surface is
  under `hermes_cli/kanban.py`; worker/orchestrator tools are in
  `tools/kanban_tools.py`; dashboard/plugin APIs are the preferred integration
  surface for read-only visualizations.
- Kanban worker tools are board-scoped. Do not bypass the board boundary or
  mutate tasks from visualization code unless the task explicitly asks for it.

## Current Swarmclaw Prototype

- v1 is a standalone read-only visualization, not a dashboard route.
- Entry point: `web/swarmclaw.html`, loaded at
  `http://127.0.0.1:5173/swarmclaw.html`.
- Source files live under `web/src/swarmclaw/`:
  `main.tsx`, `SwarmclawApp.tsx`, `useSwarmclawData.ts`, `adapter.ts`,
  `adapter.contract.ts`, and `swarmclaw.css`.
- `web/vite.config.ts` has a multipage build input for `index.html` and
  `swarmclaw.html`, plus the dev token/proxy wiring for dashboard APIs.
- Data flow is read-only: poll `/api/plugins/kanban/board`,
  `/api/plugins/kanban/workers/active`, task detail endpoints, and run inspect
  endpoints; subscribe to `/api/plugins/kanban/events` when a token is present.
- Current visual direction intentionally follows the original Swarmclaw
  org-chart UI: fixed dark left rail, near-black dotted canvas, floating
  AGENTS/TEAMS panel, compact 216px glass cards, indigo coordinator glow,
  muted labels, and curved indigo delegation edges. Avoid reverting to the
  earlier green/industrial grid look.
- `SwarmclawApp.tsx` keeps Kanban coordinates untouched and applies render-layer
  normalization/row compaction so small graphs clear the floating panel and fit
  the initial 1280px viewport while preserving scroll behavior for larger
  graphs.
- Launch docs are in `docs/swarmclaw-visualization-prototype.md`:
  `hermes dashboard --no-open --port 9119`, then
  `npm.cmd --prefix web run dev`.
- Root-level `Launch-Swarmclaw.cmd` is the preferred Windows launcher for the
  prototype. It resolves `.venv\Scripts\hermes.exe` or `hermes` on PATH, starts
  the backend on `9119`, starts Vite on strict port `5174` with
  `HERMES_DASHBOARD_URL=http://127.0.0.1:9119`, waits for both ports, and opens
  `http://127.0.0.1:5174/swarmclaw.html` after the page returns HTTP success.
- Dashboard integration is intentionally deferred. Notes mention a future
  left-nav tab or compact Kanban embed, but v1 should stay outside the dashboard
  route tree.

## Dirty State / Ownership

Pre-existing user-owned dirty files before this goal:

- `agent/auxiliary_client.py`
- `agent/codex_runtime.py`
- `hermes_cli/kanban_db.py`
- `tests/agent/test_auxiliary_client.py`
- `tests/hermes_cli/test_kanban_db.py`
- `tests/run_agent/test_run_agent_codex_responses.py`
- `tests/tools/test_base_environment.py`
- `tests/tools/test_local_env_windows_msys.py`
- `tools/environments/base.py`
- `tools/environments/local.py`

Swarmclaw goal-owned files added or edited in this goal:

- `web/vite.config.ts`
- `docs/swarmclaw-visualization-prototype.md`
- `web/src/swarmclaw/`
- `web/swarmclaw.html`
- `ORCHESTRATOR.md`

Do not revert or normalize unrelated user changes unless the user explicitly
assigns that work. Future edits should stay within the files owned by the
current task.

## Fragile Areas / Risks

- Full `web` lint currently fails outside the Swarmclaw prototype. Use scoped
  lint for prototype files and report full-lint failures as pre-existing unless
  your task changes the failing area.
- The Swarmclaw UI depends on dashboard token/proxy behavior during dev. API
  failures can be auth/proxy setup issues rather than adapter bugs.
- Runtime `.hermes` state is not repo source. Treat it as read-only evidence.
- The dashboard chat route is PTY/TUI-backed; React dashboard additions must not
  duplicate the primary chat experience.
- There are many uncommitted edits in this checkout. Stage/read only the files
  you own and verify `git status --short` before reporting.

## Verification Evidence

From the Swarmclaw worker summaries available when this file was created:

- Adapter contract check passed for `web/src/swarmclaw/adapter.contract.ts`.
- Scoped eslint passed for Swarmclaw prototype files.
- `web` build passed with the existing chunk-size warning.
- Full `web` lint fails in pre-existing files outside the prototype.
