# Swarmclaw Visualization Prototype

Standalone v1 lives outside the Hermes dashboard route tree at `/swarmclaw.html`.
It reuses the dashboard Vite dev proxy and injected session token support, then
reads the existing Kanban plugin API without mutating Kanban state.

## Launch

Use the root launcher for normal Windows startup:

```powershell
.\Launch-Swarmclaw.cmd
```

It starts the dashboard backend on `9119`, starts Vite on `5174`, waits for both
ports and the page response, then opens
`http://127.0.0.1:5174/swarmclaw.html`.

Manual startup is:

Start the Hermes dashboard backend:

```powershell
hermes dashboard --no-open --port 9119
```

Start the web dev server from the repo root:

```powershell
npm.cmd --prefix web run dev
```

Open:

```text
http://127.0.0.1:5173/swarmclaw.html
```

If Vite reports that `5173` is already in use, use the next printed port, for
example `http://127.0.0.1:5174/swarmclaw.html`.

If the dashboard backend is on another port, set `HERMES_DASHBOARD_URL` before
starting Vite:

```powershell
$env:HERMES_DASHBOARD_URL = "http://127.0.0.1:9123"
npm.cmd --prefix web run dev
```

## Data Flow

- Polls `/api/plugins/kanban/board` for task cards, summaries, statuses, link
  counts, diagnostics, current run IDs, and heartbeat timestamps.
- Polls `/api/plugins/kanban/workers/active` for live worker/run rows.
- Fetches `/api/plugins/kanban/tasks/{id}` for linked or running tasks so graph
  edges can use known parent/child relationships.
- Fetches `/api/plugins/kanban/runs/{id}/inspect` for live PID details when an
  active worker has a run ID.
- Subscribes to `/api/plugins/kanban/events` when the dashboard session token is
  injected; WebSocket events trigger an immediate refresh while polling remains
  the fallback.

## Later Integration Notes

- Left-nav tab: promote the standalone entry into the dashboard route tree when
  operators want a persistent top-level "Swarm" view. This would require i18n
  labels, sidebar icon placement, and normal route ownership in `web/src/App.tsx`.
- Kanban embed: place a compact version under Kanban cards or the Kanban plugin
  detail drawer. This keeps worker topology close to task operations, but the
  graph must shrink to a summary strip and avoid competing with board actions.
- Keep v1 read-only. Mutations such as reclaim, reassign, or decompose should
  remain in the Kanban plugin UI until the graph interaction model is validated.
