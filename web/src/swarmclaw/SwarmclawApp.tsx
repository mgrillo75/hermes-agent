import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Bot,
  Clock,
  Cpu,
  GitBranch,
  Grid2X2,
  Home,
  Maximize2,
  MessageSquare,
  Network,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Users,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useSwarmclawData } from "./useSwarmclawData";
import type { WorkerCard, WorkerEdge, WorkerGraph } from "./adapter";
import "./swarmclaw.css";

const CARD_WIDTH = 216;
const CARD_HEIGHT = 122;
const STAGE_MIN_WIDTH = 1040;
const STAGE_MIN_HEIGHT = 620;
const STAGE_PAD_X = 48;
const STAGE_TOP = 84;
const STAGE_BOTTOM_PAD = 110;
const INITIAL_CANVAS_WIDTH = 1100;
const INITIAL_RIGHT_PAD = 20;
const PANEL_CLEAR_RIGHT = 340;
const PANEL_CLEAR_BOTTOM = 190;
const COMPACT_CARD_LIMIT = 10;
const MIN_CARD_GAP = 24;
const ROW_Y_TOLERANCE = 12;
type RoleFilter = "all" | WorkerCard["role"];
type PanelTab = "agents" | "teams";

export default function SwarmclawApp() {
  const { graph, loading, error, disconnected, lastUpdatedAt, refresh } = useSwarmclawData();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [tab, setTab] = useState<PanelTab>("agents");

  const filteredGraph = useMemo(
    () => (graph ? filterGraph(graph, query, roleFilter) : null),
    [graph, query, roleFilter],
  );

  return (
    <main className="swarm-shell">
      <LeftRail disconnected={disconnected} loading={loading} />

      <section className="swarm-workspace">
        <section className="swarm-canvas" aria-busy={loading}>
          <CanvasPanel
            graph={graph}
            lastUpdatedAt={lastUpdatedAt}
            query={query}
            roleFilter={roleFilter}
            tab={tab}
            onQueryChange={setQuery}
            onRoleFilterChange={setRoleFilter}
            onTabChange={setTab}
          />
          <CanvasControls loading={loading} scale="100%" onRefresh={() => void refresh()} />

          {loading && !graph ? <StateMessage icon={<Network size={28} />} title="Connecting" text="Loading Kanban state" /> : null}
          {error && !graph ? <StateMessage icon={<AlertTriangle size={28} />} title="Disconnected" text={error} /> : null}
          {graph && graph.cards.length === 0 ? (
            <StateMessage icon={<Users size={28} />} title="No active graph" text="No Kanban workers or linked tasks are visible" />
          ) : null}
          {graph && graph.cards.length > 0 && filteredGraph?.cards.length === 0 ? (
            <StateMessage icon={<Search size={28} />} title="No matches" text="Adjust the search or role filter" />
          ) : null}
          {filteredGraph && filteredGraph.cards.length > 0 ? <GraphCanvas graph={filteredGraph} /> : null}
        </section>
      </section>
    </main>
  );
}

function LeftRail({ disconnected, loading }: { disconnected: boolean; loading: boolean }) {
  const nav = [
    { label: "Home", icon: <Home size={15} /> },
    { label: "Agents", icon: <Bot size={15} /> },
    { label: "Org Chart", icon: <GitBranch size={15} />, active: true },
    { label: "Chats", icon: <MessageSquare size={15} /> },
    { label: "Settings", icon: <Settings size={15} /> },
  ];

  return (
    <aside className="swarm-rail" aria-label="Swarmclaw navigation">
      <div className="swarm-logo-block">
        <div className="swarm-logo-mark">
          <Sparkles aria-hidden="true" size={16} />
        </div>
        <div>
          <strong>Swarmclaw</strong>
          <span>Hermes graph</span>
        </div>
      </div>

      <div className="swarm-profile-row">
        <Avatar name="Orchestrator" seed="profile" size={28} />
        <div>
          <strong>Default</strong>
          <StatusPill disconnected={disconnected} loading={loading} />
        </div>
      </div>

      <nav className="swarm-nav">
        {nav.map((item) => (
          <button key={item.label} className={item.active ? "is-selected" : ""} type="button">
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="swarm-rail-footer">
        <Shield aria-hidden="true" size={14} />
        <span>Read-only Kanban</span>
      </div>
    </aside>
  );
}

function CanvasPanel({
  graph,
  lastUpdatedAt,
  query,
  roleFilter,
  tab,
  onQueryChange,
  onRoleFilterChange,
  onTabChange,
}: {
  graph: WorkerGraph | null;
  lastUpdatedAt: number | null;
  query: string;
  roleFilter: RoleFilter;
  tab: PanelTab;
  onQueryChange: (query: string) => void;
  onRoleFilterChange: (role: RoleFilter) => void;
  onTabChange: (tab: PanelTab) => void;
}) {
  const workerCount = graph?.cards.filter((card) => card.role === "worker").length ?? 0;
  const coordinatorCount = graph?.cards.filter((card) => card.role === "coordinator").length ?? 0;
  const activeCount = graph?.cards.filter((card) => card.active).length ?? 0;
  const teamRows = [
    { label: "Coordinators", count: coordinatorCount, color: "#6366f1" },
    { label: "Workers", count: workerCount, color: "#34d399" },
    { label: "Running", count: activeCount, color: "#22c55e" },
  ];

  return (
    <aside className="swarm-floating-panel" aria-label="Graph filters">
      <div className="swarm-panel-tabs">
        <button className={tab === "agents" ? "is-active" : ""} onClick={() => onTabChange("agents")} type="button">
          AGENTS ({graph?.cards.length ?? 0})
        </button>
        <button className={tab === "teams" ? "is-active" : ""} onClick={() => onTabChange("teams")} type="button">
          TEAMS ({teamRows.filter((row) => row.count > 0).length})
        </button>
      </div>

      {tab === "agents" ? (
        <>
          <label className="swarm-search">
            <Search aria-hidden="true" size={13} />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search agents..."
              type="search"
            />
          </label>

          <div className="swarm-filter-row" aria-label="Role filter">
            {(["all", "worker", "coordinator"] as const).map((role) => (
              <button
                key={role}
                className={roleFilter === role ? "is-active" : ""}
                onClick={() => onRoleFilterChange(role)}
                type="button"
              >
                {role === "all" ? "All" : role === "worker" ? "Workers" : "Coords"}
                <span>{role === "all" ? graph?.cards.length ?? 0 : role === "worker" ? workerCount : coordinatorCount}</span>
              </button>
            ))}
          </div>

          <div className="swarm-panel-meta">
            <span>{activeCount} active</span>
            <span>{graph?.stats.errors ?? 0} errors</span>
            <span>{lastUpdatedAt ? formatClock(lastUpdatedAt) : "No sync"}</span>
          </div>
        </>
      ) : (
        <div className="swarm-team-list">
          {teamRows.map((row) => (
            <div key={row.label}>
              <span style={{ backgroundColor: row.color }} />
              <strong>{row.label}</strong>
              <em>{row.count}</em>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

function CanvasControls({
  loading,
  scale,
  onRefresh,
}: {
  loading: boolean;
  scale: string;
  onRefresh: () => void;
}) {
  const controls = [
    { label: "Grid", icon: <Grid2X2 size={14} /> },
    { label: "Zoom out", icon: <ZoomOut size={14} /> },
    { label: "Zoom in", icon: <ZoomIn size={14} /> },
    { label: "Fit", icon: <Maximize2 size={14} /> },
  ];

  return (
    <div className="swarm-canvas-controls" aria-label="Canvas controls">
      {controls.map((control) => (
        <button key={control.label} title={control.label} type="button">
          {control.icon}
        </button>
      ))}
      <span>{scale}</span>
      <button className={loading ? "is-spinning" : ""} onClick={onRefresh} title="Refresh" type="button">
        <RefreshCw aria-hidden="true" size={14} />
      </button>
    </div>
  );
}

function GraphCanvas({ graph }: { graph: WorkerGraph }) {
  const layout = buildRenderLayout(graph);

  return (
    <div className="swarm-stage" style={{ width: layout.width, height: layout.height }}>
      <svg className="swarm-edges" width={layout.width} height={layout.height}>
        {graph.edges.map((edge) => (
          <Edge key={edge.id} edge={edge} cards={layout.cards} />
        ))}
      </svg>
      {layout.cards.map((card) => (
        <WorkerNode key={card.id} card={card} childCount={graph.edges.filter((edge) => edge.from === card.id).length} />
      ))}
    </div>
  );
}

function Edge({ edge, cards }: { edge: WorkerEdge; cards: WorkerCard[] }) {
  const from = cards.find((card) => card.id === edge.from);
  const to = cards.find((card) => card.id === edge.to);
  if (!from || !to) return null;

  const x1 = from.x + CARD_WIDTH / 2;
  const y1 = from.y + CARD_HEIGHT;
  const x2 = to.x + CARD_WIDTH / 2;
  const y2 = to.y;
  const midY = y1 + Math.max(60, (y2 - y1) / 2);
  const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  const important = from.role === "coordinator" || from.active || to.active;

  return (
    <g className={`swarm-edge ${important ? "is-important" : ""}`}>
      {important ? <path className="swarm-edge-glow" d={path} /> : null}
      <path className="swarm-edge-line" d={path} />
      {important ? (
        <circle className="swarm-edge-dot" r="3">
          <animateMotion dur="1.8s" path={path} repeatCount="indefinite" />
        </circle>
      ) : null}
      <text x={(x1 + x2) / 2} y={midY - 8}>
        {edge.label}
      </text>
    </g>
  );
}

function WorkerNode({ card, childCount }: { card: WorkerCard; childCount: number }) {
  const heartbeatTone = card.heartbeatAgeSeconds == null ? "muted" : card.heartbeatAgeSeconds > 120 ? "stale" : "fresh";
  const subtitle = [card.profile ?? "unassigned", truncateModel(card.model)].filter(Boolean).join(" / ");
  const chips = buildChips(card);
  return (
    <article
      className={`swarm-card swarm-card-${card.role} ${card.active ? "is-active" : ""} ${card.error ? "has-error" : ""}`}
      style={{ left: card.x, top: card.y }}
    >
      <div className="swarm-card-main">
        <Avatar name={card.title} seed={card.id} size={30} />
        <div className="swarm-card-title">
          <h2 title={card.title}>{card.title}</h2>
          <span title={subtitle}>{subtitle || "default"}</span>
        </div>
        <span className={`swarm-dot swarm-dot-${heartbeatTone}`} title={formatAge(card.heartbeatAgeSeconds)} />
      </div>

      <div className="swarm-badge-row">
        <span className={`swarm-role-badge swarm-role-${card.role}`}>{card.role}</span>
        {childCount > 0 ? <span className="swarm-child-chip">+{childCount}</span> : null}
        <span className="swarm-card-status" title={card.status}>{card.status}</span>
      </div>

      <p className="swarm-summary" title={card.error ?? card.summary ?? card.detail ?? undefined}>
        {card.error ?? card.summary ?? card.detail ?? "Awaiting worker output"}
      </p>

      <footer className="swarm-tool-row">
        {chips.map((chip) => (
          <span key={chip.label} className={`swarm-tool-chip ${chip.tone ? `swarm-tool-${chip.tone}` : ""}`}>
            {chip.icon}
            {chip.label}
          </span>
        ))}
      </footer>
      {card.active ? <div className="swarm-progress"><span /></div> : null}
    </article>
  );
}

function StatusPill({ disconnected, loading }: { disconnected: boolean; loading: boolean }) {
  const label = disconnected ? "Disconnected" : loading ? "Syncing" : "Live";
  return <span className={`swarm-status ${disconnected ? "bad" : loading ? "wait" : "good"}`}>{label}</span>;
}

function StateMessage({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="swarm-state">
      {icon}
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function Avatar({ name, seed, size }: { name: string; seed: string; size: number }) {
  return (
    <span
      className="swarm-avatar"
      style={{
        width: size,
        height: size,
        background: avatarGradient(seed),
        fontSize: Math.max(10, Math.round(size * 0.34)),
      }}
    >
      {initials(name)}
    </span>
  );
}

function filterGraph(graph: WorkerGraph, query: string, roleFilter: RoleFilter): WorkerGraph {
  const normalized = query.trim().toLowerCase();
  const cards = graph.cards.filter((card) => {
    if (roleFilter !== "all" && card.role !== roleFilter) return false;
    if (!normalized) return true;
    return [card.title, card.profile, card.model, card.status, card.column, card.summary, card.detail]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(normalized));
  });
  const visibleIds = new Set(cards.map((card) => card.id));
  return {
    ...graph,
    cards,
    edges: graph.edges.filter((edge) => visibleIds.has(edge.from) && visibleIds.has(edge.to)),
  };
}

function buildRenderLayout(graph: WorkerGraph): { cards: WorkerCard[]; width: number; height: number } {
  if (graph.cards.length === 0) {
    return { cards: [], width: STAGE_MIN_WIDTH, height: STAGE_MIN_HEIGHT };
  }

  const bounds = graph.cards.reduce(
    (acc, card) => ({
      minX: Math.min(acc.minX, card.x),
      minY: Math.min(acc.minY, card.y),
      maxX: Math.max(acc.maxX, card.x + CARD_WIDTH),
      maxY: Math.max(acc.maxY, card.y + CARD_HEIGHT),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );
  const graphWidth = bounds.maxX - bounds.minX;
  const centeredLeft = Math.round((STAGE_MIN_WIDTH - graphWidth) / 2);
  const targetLeft = Math.max(STAGE_PAD_X, centeredLeft);
  const shiftY = STAGE_TOP - bounds.minY;
  let shiftX = targetLeft - bounds.minX;
  const initiallyShifted = graph.cards.map((card) => ({
    ...card,
    x: Math.round(card.x + shiftX),
    y: Math.round(card.y + shiftY),
  }));
  const topBandMinX = initiallyShifted
    .filter((card) => card.y < PANEL_CLEAR_BOTTOM)
    .reduce((minX, card) => Math.min(minX, card.x), Infinity);
  if (topBandMinX < PANEL_CLEAR_RIGHT) {
    shiftX += PANEL_CLEAR_RIGHT - topBandMinX;
  }

  const shiftedCards = graph.cards.map((card) => ({
    ...card,
    x: Math.round(card.x + shiftX),
    y: Math.round(card.y + shiftY),
  }));
  const cards = compactInitialRows(shiftedCards);
  const maxCardX = Math.max(...cards.map((card) => card.x + CARD_WIDTH));
  const maxCardY = Math.max(...cards.map((card) => card.y + CARD_HEIGHT));

  return {
    cards,
    width: Math.max(STAGE_MIN_WIDTH, maxCardX + STAGE_PAD_X),
    height: Math.max(STAGE_MIN_HEIGHT, maxCardY + STAGE_BOTTOM_PAD),
  };
}

function compactInitialRows(cards: WorkerCard[]): WorkerCard[] {
  if (cards.length > COMPACT_CARD_LIMIT) return cards;

  const compacted = cards.map((card) => ({ ...card }));
  const rows = groupCardsByRow(compacted);
  const maxLeft = INITIAL_CANVAS_WIDTH - INITIAL_RIGHT_PAD - CARD_WIDTH;

  for (const row of rows) {
    const safeLeft = row.y < PANEL_CLEAR_BOTTOM ? PANEL_CLEAR_RIGHT : STAGE_PAD_X;
    const safeRight = maxLeft;
    const sorted = row.cards.slice().sort((a, b) => a.x - b.x);
    const minX = Math.min(...sorted.map((card) => card.x));
    const maxX = Math.max(...sorted.map((card) => card.x));
    if (minX >= safeLeft && maxX <= safeRight) continue;

    const fitted = fitRowPositions(
      sorted.map((card) => card.x),
      safeLeft,
      safeRight,
    );
    sorted.forEach((card, index) => {
      card.x = fitted[index];
    });
  }

  return compacted;
}

function groupCardsByRow(cards: WorkerCard[]): Array<{ y: number; cards: WorkerCard[] }> {
  const rows: Array<{ y: number; cards: WorkerCard[] }> = [];
  for (const card of cards.slice().sort((a, b) => a.y - b.y)) {
    const row = rows.find((candidate) => Math.abs(candidate.y - card.y) <= ROW_Y_TOLERANCE);
    if (row) {
      row.cards.push(card);
      row.y = Math.min(row.y, card.y);
    } else {
      rows.push({ y: card.y, cards: [card] });
    }
  }
  return rows;
}

function fitRowPositions(xs: number[], safeLeft: number, safeRight: number): number[] {
  if (xs.length === 1) {
    return [Math.round(clamp(xs[0], safeLeft, safeRight))];
  }

  const rawMin = Math.min(...xs);
  const rawMax = Math.max(...xs);
  const rawSpan = Math.max(1, rawMax - rawMin);
  const requiredSpan = (xs.length - 1) * (CARD_WIDTH + MIN_CARD_GAP);
  const availableSpan = Math.max(0, safeRight - safeLeft);

  if (requiredSpan <= availableSpan) {
    const targetSpan = Math.min(rawSpan, availableSpan);
    const fitted = xs.map((x) => safeLeft + ((x - rawMin) / rawSpan) * targetSpan);
    for (let index = 1; index < fitted.length; index += 1) {
      fitted[index] = Math.max(fitted[index], fitted[index - 1] + CARD_WIDTH + MIN_CARD_GAP);
    }
    const overflow = fitted[fitted.length - 1] - safeRight;
    if (overflow > 0) {
      for (let index = 0; index < fitted.length; index += 1) {
        fitted[index] -= overflow;
      }
    }
    return fitted.map((x) => Math.round(Math.max(safeLeft, x)));
  }

  return xs.map((_, index) => Math.round(safeLeft + index * (CARD_WIDTH + MIN_CARD_GAP)));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildChips(card: WorkerCard): Array<{ label: string; icon: ReactNode; tone?: "active" | "warn" | "error" }> {
  const chips: Array<{ label: string; icon: ReactNode; tone?: "active" | "warn" | "error" }> = [
    { label: card.column, icon: <GitBranch aria-hidden="true" size={10} /> },
  ];
  if (card.active) chips.push({ label: card.runId ? `run ${card.runId}` : "running", icon: <Cpu aria-hidden="true" size={10} />, tone: "active" });
  if (card.pid) chips.push({ label: `${card.pid}`, icon: <Cpu aria-hidden="true" size={10} /> });
  if (card.error) chips.push({ label: "error", icon: <AlertTriangle aria-hidden="true" size={10} />, tone: "error" });
  if (!card.error && (card.heartbeatAgeSeconds ?? 0) > 120) chips.push({ label: "stale", icon: <Clock aria-hidden="true" size={10} />, tone: "warn" });
  return chips.slice(0, 4);
}

function formatAge(seconds: number | null): string {
  if (seconds == null) return "none";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}

function formatClock(epochMs: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(epochMs));
}

function truncateModel(model: string | null): string | null {
  if (!model) return null;
  const name = model.split("/").at(-1) ?? model;
  return name.length > 24 ? `${name.slice(0, 22)}...` : name;
}

function initials(name: string): string {
  const result = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return result || "?";
}

function avatarGradient(seed: string): string {
  const colors = [
    ["#6366f1", "#8b5cf6"],
    ["#0ea5e9", "#6366f1"],
    ["#10b981", "#14b8a6"],
    ["#ec4899", "#8b5cf6"],
    ["#f59e0b", "#ef4444"],
  ];
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const [from, to] = colors[hash % colors.length];
  return `linear-gradient(135deg, ${from}, ${to})`;
}
