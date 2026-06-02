import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchJSON, HERMES_BASE_PATH } from "@/lib/api";
import {
  deriveWorkerGraph,
  type ActiveWorkersResponse,
  type KanbanBoardResponse,
  type RunInspectResponse,
  type TaskDetailSummary,
  type WorkerGraph,
} from "./adapter";

interface SwarmclawDataState {
  graph: WorkerGraph | null;
  loading: boolean;
  error: string | null;
  disconnected: boolean;
  lastUpdatedAt: number | null;
  refresh: () => Promise<void>;
}

interface TaskDetailResponse {
  links?: TaskDetailSummary["links"];
  runs?: TaskDetailSummary["runs"];
  events?: TaskDetailSummary["events"];
}

const POLL_MS = 5_000;
const DETAIL_LIMIT = 80;

export function useSwarmclawData(): SwarmclawDataState {
  const [graph, setGraph] = useState<WorkerGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disconnected, setDisconnected] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const latestEventIdRef = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const [board, workers] = await Promise.all([
        fetchJSON<KanbanBoardResponse>("/api/plugins/kanban/board"),
        fetchJSON<ActiveWorkersResponse>("/api/plugins/kanban/workers/active"),
      ]);
      latestEventIdRef.current = board.latest_event_id ?? latestEventIdRef.current;

      const taskIds = collectTaskIdsForDetails(board).slice(0, DETAIL_LIMIT);
      const details = await Promise.all(
        taskIds.map(async (taskId) => {
          try {
            const result = await fetchJSON<TaskDetailResponse>(
              `/api/plugins/kanban/tasks/${encodeURIComponent(taskId)}`,
            );
            return { task_id: taskId, links: result.links, runs: result.runs, events: result.events };
          } catch {
            return { task_id: taskId };
          }
        }),
      );

      const runIds = workers.workers.map((worker) => worker.run_id).slice(0, DETAIL_LIMIT);
      const inspections = await fetchRunInspections(runIds);

      setGraph(deriveWorkerGraph(board, workers, details, inspections));
      setError(null);
      setDisconnected(false);
      setLastUpdatedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setDisconnected(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(timer);
    };
  }, [refresh]);

  useEffect(() => {
    const token = window.__HERMES_SESSION_TOKEN__;
    if (!token) return;
    const ws = new WebSocket(buildEventUrl(latestEventIdRef.current, token));
    ws.onmessage = () => {
      void refresh();
    };
    ws.onerror = () => {
      setDisconnected(true);
    };
    ws.onopen = () => {
      setDisconnected(false);
    };
    return () => ws.close();
  }, [refresh]);

  return useMemo(
    () => ({ graph, loading, error, disconnected, lastUpdatedAt, refresh }),
    [graph, loading, error, disconnected, lastUpdatedAt, refresh],
  );
}

function collectTaskIdsForDetails(board: KanbanBoardResponse): string[] {
  const ids: string[] = [];
  for (const column of board.columns) {
    for (const task of column.tasks) {
      const hasLinks = Boolean((task.link_counts?.parents ?? 0) > 0 || (task.link_counts?.children ?? 0) > 0);
      const isRunning = task.status === "running" || task.current_run_id != null;
      if (hasLinks || isRunning || task.last_failure_error) {
        ids.push(task.id);
      }
    }
  }
  return ids;
}

async function fetchRunInspections(runIds: number[]): Promise<Record<number, RunInspectResponse>> {
  const entries = await Promise.all(
    runIds.map(async (runId) => {
      try {
        const result = await fetchJSON<RunInspectResponse>(
          `/api/plugins/kanban/runs/${encodeURIComponent(runId)}/inspect`,
        );
        return [runId, result] as const;
      } catch {
        return null;
      }
    }),
  );
  return Object.fromEntries(entries.filter((entry): entry is readonly [number, RunInspectResponse] => entry != null));
}

function buildEventUrl(since: number, token: string): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const basePath = HERMES_BASE_PATH || "";
  const params = new URLSearchParams({ since: String(since), token });
  return `${protocol}//${window.location.host}${basePath}/api/plugins/kanban/events?${params.toString()}`;
}
