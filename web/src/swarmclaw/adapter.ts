export interface KanbanBoardResponse {
  columns: KanbanColumn[];
  latest_event_id?: number;
  now?: number;
}

export interface KanbanColumn {
  name: string;
  tasks: KanbanTask[];
}

export interface KanbanTask {
  id: string;
  title: string;
  status: string;
  assignee?: string | null;
  latest_summary?: string | null;
  result?: string | null;
  last_failure_error?: string | null;
  model_override?: string | null;
  current_run_id?: number | null;
  worker_pid?: number | null;
  last_heartbeat_at?: number | null;
  started_at?: number | null;
  max_runtime_seconds?: number | null;
  link_counts?: { parents?: number; children?: number } | null;
  progress?: { done: number; total: number } | null;
  warnings?: { count?: number; highest_severity?: string | null } | null;
  diagnostics?: Array<{ kind?: string; severity?: string; message?: string }>;
}

export interface ActiveWorkersResponse {
  checked_at?: number;
  count: number;
  workers: ActiveWorker[];
}

export interface ActiveWorker {
  run_id: number;
  task_id: string;
  task_title: string;
  task_status: string;
  task_assignee?: string | null;
  profile?: string | null;
  worker_pid?: number | null;
  started_at?: number | null;
  claim_lock?: string | null;
  claim_expires?: number | null;
  last_heartbeat_at?: number | null;
  max_runtime_seconds?: number | null;
}

export interface TaskDetailSummary {
  task_id: string;
  links?: {
    parents?: string[];
    children?: string[];
  };
  runs?: TaskRunSummary[];
  events?: Array<{
    id?: number;
    kind?: string;
    created_at?: number;
    payload?: unknown;
    run_id?: number | null;
  }>;
}

interface TaskRunSummary {
  id: number;
  status?: string | null;
  outcome?: string | null;
  summary?: string | null;
  error?: string | null;
  profile?: string | null;
}

export interface RunInspectResponse {
  run_id: number;
  alive: boolean;
  pid?: number;
  reason?: string;
  error?: string;
  cpu_percent?: number | null;
  memory_rss_bytes?: number | null;
  num_threads?: number | null;
  status?: string | null;
  cmdline?: string[] | null;
}

export interface WorkerGraph {
  cards: WorkerCard[];
  edges: WorkerEdge[];
  stats: WorkerGraphStats;
  latestEventId: number;
}

export interface WorkerGraphStats {
  activeWorkers: number;
  tasksShown: number;
  staleHeartbeats: number;
  errors: number;
}

export interface WorkerCard {
  id: string;
  taskId: string;
  runId: number | null;
  title: string;
  role: "coordinator" | "worker";
  status: string;
  profile: string | null;
  model: string | null;
  pid: number | null;
  heartbeatAgeSeconds: number | null;
  startedAgeSeconds: number | null;
  summary: string | null;
  error: string | null;
  detail: string | null;
  column: string;
  active: boolean;
  x: number;
  y: number;
}

export interface WorkerEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

const NODE_WIDTH = 260;
const LEVEL_GAP = 210;
const SIBLING_GAP = 44;

export function deriveWorkerGraph(
  board: KanbanBoardResponse,
  activeWorkers: ActiveWorkersResponse,
  taskDetails: TaskDetailSummary[] = [],
  inspections: Record<number, RunInspectResponse> = {},
): WorkerGraph {
  const now = board.now ?? activeWorkers.checked_at ?? Math.floor(Date.now() / 1000);
  const tasks = flattenTasks(board);
  const taskById = new Map(tasks.map((entry) => [entry.task.id, entry]));
  const workerByTaskId = new Map(activeWorkers.workers.map((worker) => [worker.task_id, worker]));
  const detailByTaskId = new Map(taskDetails.map((detail) => [detail.task_id, detail]));
  const linkedTaskIds = new Set<string>();
  const edges: WorkerEdge[] = [];

  for (const detail of taskDetails) {
    for (const parentId of detail.links?.parents ?? []) {
      linkedTaskIds.add(parentId);
      linkedTaskIds.add(detail.task_id);
      const from = resolveNodeId(parentId, workerByTaskId);
      const to = resolveNodeId(detail.task_id, workerByTaskId);
      addEdge(edges, {
        id: `${from}->${to}`,
        from,
        to,
        label: workerByTaskId.has(detail.task_id) ? "parent task" : "task link",
      });
    }
    for (const childId of detail.links?.children ?? []) {
      linkedTaskIds.add(detail.task_id);
      linkedTaskIds.add(childId);
      const from = resolveNodeId(detail.task_id, workerByTaskId);
      const to = resolveNodeId(childId, workerByTaskId);
      addEdge(edges, { id: `${from}->${to}`, from, to, label: workerByTaskId.has(childId) ? "parent task" : "task link" });
    }
  }

  const cards: WorkerCard[] = [];
  for (const { task, column } of tasks) {
    const worker = workerByTaskId.get(task.id);
    const detail = detailByTaskId.get(task.id);
    const latestRun = findLatestRun(detail);
    const runId = worker?.run_id ?? task.current_run_id ?? latestRun?.id ?? null;
    const id = worker ? `run:${worker.run_id}` : `task:${task.id}`;
    const inspect = runId != null ? inspections[runId] : undefined;
    cards.push({
      id,
      taskId: task.id,
      runId,
      title: worker?.task_title ?? task.title,
      role: inferRole(task, detail),
      status: worker?.task_status ?? task.status,
      profile: worker?.profile ?? latestRun?.profile ?? task.assignee ?? null,
      model: task.model_override ?? null,
      pid: worker?.worker_pid ?? task.worker_pid ?? inspect?.pid ?? null,
      heartbeatAgeSeconds: ageSeconds(worker?.last_heartbeat_at ?? task.last_heartbeat_at, now),
      startedAgeSeconds: ageSeconds(worker?.started_at ?? task.started_at, now),
      summary: firstText(task.latest_summary, latestRun?.summary, task.result),
      error: firstText(task.last_failure_error, latestRun?.error, inspect?.error, inspect?.reason),
      detail: buildDetail(task, worker, inspect),
      column,
      active: Boolean(worker) || task.status === "running",
      x: 0,
      y: 0,
    });
  }

  for (const worker of activeWorkers.workers) {
    if (taskById.has(worker.task_id)) continue;
    cards.push({
      id: `run:${worker.run_id}`,
      taskId: worker.task_id,
      runId: worker.run_id,
      title: worker.task_title || `Run ${worker.run_id}`,
      role: "worker",
      status: worker.task_status || "running",
      profile: worker.profile ?? worker.task_assignee ?? null,
      model: null,
      pid: worker.worker_pid ?? null,
      heartbeatAgeSeconds: ageSeconds(worker.last_heartbeat_at, now),
      startedAgeSeconds: ageSeconds(worker.started_at, now),
      summary: null,
      error: null,
      detail: worker.claim_lock ? `claim ${worker.claim_lock}` : null,
      column: "running",
      active: true,
      x: 0,
      y: 0,
    });
  }

  const laidOut = layoutCards(cards, edges, linkedTaskIds);
  return {
    cards: laidOut,
    edges,
    stats: {
      activeWorkers: activeWorkers.count,
      tasksShown: laidOut.length,
      staleHeartbeats: laidOut.filter((card) => (card.heartbeatAgeSeconds ?? 0) > 120).length,
      errors: laidOut.filter((card) => card.error).length,
    },
    latestEventId: board.latest_event_id ?? 0,
  };
}

function flattenTasks(board: KanbanBoardResponse): Array<{ task: KanbanTask; column: string }> {
  return board.columns.flatMap((column) =>
    column.tasks.map((task) => ({ task, column: column.name })),
  );
}

function resolveNodeId(taskId: string, workerByTaskId: Map<string, ActiveWorker>): string {
  const worker = workerByTaskId.get(taskId);
  return worker ? `run:${worker.run_id}` : `task:${taskId}`;
}

function addEdge(edges: WorkerEdge[], edge: WorkerEdge): void {
  if (!edges.some((existing) => existing.id === edge.id)) {
    edges.push(edge);
  }
}

function inferRole(task: KanbanTask, detail?: TaskDetailSummary): "coordinator" | "worker" {
  const hasChildren = (task.link_counts?.children ?? 0) > 0 || (detail?.links?.children?.length ?? 0) > 0;
  const assignee = (task.assignee ?? "").toLowerCase();
  if (hasChildren || assignee.includes("orchestrator") || assignee.includes("coordinator")) {
    return "coordinator";
  }
  return "worker";
}

function findLatestRun(detail?: TaskDetailSummary): TaskRunSummary | undefined {
  return detail?.runs?.slice().sort((a, b) => b.id - a.id)[0];
}

function ageSeconds(epoch: number | null | undefined, now: number): number | null {
  if (!epoch) return null;
  return Math.max(0, now - epoch);
}

function firstText(...values: Array<string | null | undefined>): string | null {
  const value = values.find((item) => item != null && item.trim() !== "");
  return value?.trim() ?? null;
}

function buildDetail(
  task: KanbanTask,
  worker?: ActiveWorker,
  inspect?: RunInspectResponse,
): string | null {
  const parts: string[] = [];
  if (worker?.max_runtime_seconds) parts.push(`max ${formatDuration(worker.max_runtime_seconds)}`);
  if (task.progress) parts.push(`${task.progress.done}/${task.progress.total} children done`);
  if (task.warnings?.count) parts.push(`${task.warnings.count} diagnostic${task.warnings.count === 1 ? "" : "s"}`);
  if (inspect?.alive && inspect.status) parts.push(`process ${inspect.status}`);
  if (inspect?.memory_rss_bytes) parts.push(`${formatBytes(inspect.memory_rss_bytes)} RSS`);
  return parts.length > 0 ? parts.join(" / ") : null;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KiB`;
  return `${Math.round(bytes / (1024 * 1024))} MiB`;
}

function layoutCards(cards: WorkerCard[], edges: WorkerEdge[], linkedTaskIds: Set<string>): WorkerCard[] {
  const childrenByParent = new Map<string, string[]>();
  const childIds = new Set<string>();
  for (const edge of edges) {
    const list = childrenByParent.get(edge.from) ?? [];
    list.push(edge.to);
    childrenByParent.set(edge.from, list);
    childIds.add(edge.to);
  }

  const byId = new Map(cards.map((card) => [card.id, card]));
  const roots = cards
    .filter((card) => !childIds.has(card.id) && (childrenByParent.has(card.id) || linkedTaskIds.has(card.taskId)))
    .map((card) => card.id);
  const unlinked = cards.filter((card) => !roots.includes(card.id) && !childIds.has(card.id));
  const positioned = new Map<string, { x: number; y: number }>();
  let cursorX = 32;

  const subtreeWidth = (id: string): number => {
    const children = (childrenByParent.get(id) ?? []).filter((childId) => byId.has(childId));
    if (children.length === 0) return NODE_WIDTH;
    return Math.max(
      NODE_WIDTH,
      children.reduce((sum, childId) => sum + subtreeWidth(childId), 0) + SIBLING_GAP * (children.length - 1),
    );
  };

  const assign = (id: string, left: number, depth: number): void => {
    if (positioned.has(id)) return;
    const width = subtreeWidth(id);
    positioned.set(id, { x: left + width / 2 - NODE_WIDTH / 2, y: 96 + depth * LEVEL_GAP });
    let childLeft = left;
    for (const childId of childrenByParent.get(id) ?? []) {
      if (!byId.has(childId)) continue;
      assign(childId, childLeft, depth + 1);
      childLeft += subtreeWidth(childId) + SIBLING_GAP;
    }
  };

  for (const root of roots) {
    assign(root, cursorX, 0);
    cursorX += subtreeWidth(root) + SIBLING_GAP * 2;
  }

  const columns = Math.max(1, Math.ceil(Math.sqrt(unlinked.length)));
  unlinked.forEach((card, index) => {
    if (positioned.has(card.id)) return;
    const col = index % columns;
    const row = Math.floor(index / columns);
    positioned.set(card.id, {
      x: 32 + col * (NODE_WIDTH + SIBLING_GAP),
      y: roots.length > 0 ? 96 + (row + 2) * LEVEL_GAP : 96 + row * 176,
    });
  });

  return cards.map((card) => ({ ...card, ...(positioned.get(card.id) ?? { x: 32, y: 96 }) }));
}
