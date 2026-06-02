import { deriveWorkerGraph } from "./adapter";

function expectEqual<T>(actual: T, expected: T, label: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

const graph = deriveWorkerGraph(
  {
    now: 1_700_000_120,
    columns: [
      {
        name: "running",
        tasks: [
          {
            id: "t_parent",
            title: "Coordinate release",
            status: "running",
            assignee: "orchestrator",
            latest_summary: "Planning child work",
            link_counts: { parents: 0, children: 1 },
          },
          {
            id: "t_child",
            title: "Patch frontend",
            status: "running",
            assignee: "frontend",
            latest_summary: null,
            link_counts: { parents: 1, children: 0 },
          },
        ],
      },
    ],
  },
  {
    checked_at: 1_700_000_120,
    count: 1,
    workers: [
      {
        run_id: 42,
        task_id: "t_child",
        task_title: "Patch frontend",
        task_status: "running",
        task_assignee: "frontend",
        profile: "frontend",
        worker_pid: 1234,
        started_at: 1_700_000_000,
        claim_lock: "lock-42",
        claim_expires: 1_700_003_600,
        last_heartbeat_at: 1_700_000_090,
        max_runtime_seconds: 3600,
      },
    ],
  },
  [
    { task_id: "t_parent", links: { parents: [], children: ["t_child"] } },
    { task_id: "t_child", links: { parents: ["t_parent"], children: [] } },
  ],
);

expectEqual(
  graph.cards.map((card) => ({
    id: card.id,
    role: card.role,
    runId: card.runId,
    heartbeatAgeSeconds: card.heartbeatAgeSeconds,
  })),
  [
    { id: "task:t_parent", role: "coordinator", runId: null, heartbeatAgeSeconds: null },
    { id: "run:42", role: "worker", runId: 42, heartbeatAgeSeconds: 30 },
  ],
  "cards derive task and live worker nodes",
);

expectEqual(
  graph.edges,
  [{ id: "task:t_parent->run:42", from: "task:t_parent", to: "run:42", label: "parent task" }],
  "edges connect known parent and active child run",
);
