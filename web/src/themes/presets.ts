import type { DashboardTheme, ThemeTypography, ThemeLayout } from "./types";

/**
 * Built-in dashboard themes.
 *
 * Each theme defines its own palette, typography, and layout so switching
 * themes produces visible changes beyond just color — fonts, density, and
 * corner-radius all shift to match the theme's personality.
 *
 * Theme names must stay in sync with the backend's
 * `_BUILTIN_DASHBOARD_THEMES` list in `hermes_cli/web_server.py`.
 */

// ---------------------------------------------------------------------------
// Shared typography / layout presets
// ---------------------------------------------------------------------------

/** Default system stack — neutral, safe fallback for every platform. */
const SYSTEM_SANS =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const SYSTEM_MONO =
  'ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace';

const DEFAULT_TYPOGRAPHY: ThemeTypography = {
  fontSans: SYSTEM_SANS,
  fontMono: SYSTEM_MONO,
  baseSize: "15px",
  lineHeight: "1.55",
  letterSpacing: "0",
};

const DEFAULT_LAYOUT: ThemeLayout = {
  radius: "0.5rem",
  density: "comfortable",
};

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------

export const defaultTheme: DashboardTheme = {
  name: "default",
  label: "Hermes Teal",
  description: "Classic dark teal — the canonical Hermes look",
  palette: {
    background: { hex: "#041c1c", alpha: 1 },
    midground: { hex: "#ffe6cb", alpha: 1 },
    foreground: { hex: "#ffffff", alpha: 0 },
    warmGlow: "rgba(255, 189, 56, 0.35)",
    noiseOpacity: 1,
  },
  typography: DEFAULT_TYPOGRAPHY,
  layout: DEFAULT_LAYOUT,
};

export const midnightTheme: DashboardTheme = {
  name: "midnight",
  label: "Midnight",
  description: "Deep blue-violet with cool accents",
  palette: {
    background: { hex: "#0a0a1f", alpha: 1 },
    midground: { hex: "#d4c8ff", alpha: 1 },
    foreground: { hex: "#ffffff", alpha: 0 },
    warmGlow: "rgba(167, 139, 250, 0.32)",
    noiseOpacity: 0.8,
  },
  typography: {
    ...DEFAULT_TYPOGRAPHY,
    fontSans: `"Inter", ${SYSTEM_SANS}`,
    fontMono: `"JetBrains Mono", ${SYSTEM_MONO}`,
    fontUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap",
    letterSpacing: "-0.005em",
  },
  layout: {
    ...DEFAULT_LAYOUT,
    radius: "0.75rem",
  },
};

export const emberTheme: DashboardTheme = {
  name: "ember",
  label: "Ember",
  description: "Warm crimson and bronze — forge vibes",
  palette: {
    background: { hex: "#1a0a06", alpha: 1 },
    midground: { hex: "#ffd8b0", alpha: 1 },
    foreground: { hex: "#ffffff", alpha: 0 },
    warmGlow: "rgba(249, 115, 22, 0.38)",
    noiseOpacity: 1,
  },
  typography: {
    ...DEFAULT_TYPOGRAPHY,
    fontSans: `"Spectral", Georgia, "Times New Roman", serif`,
    fontMono: `"IBM Plex Mono", ${SYSTEM_MONO}`,
    fontUrl:
      "https://fonts.googleapis.com/css2?family=Spectral:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;700&display=swap",
  },
  layout: {
    ...DEFAULT_LAYOUT,
    radius: "0.25rem",
  },
  colorOverrides: {
    destructive: "#c92d0f",
    warning: "#f97316",
  },
};

export const monoTheme: DashboardTheme = {
  name: "mono",
  label: "Mono",
  description: "Clean grayscale — minimal and focused",
  palette: {
    background: { hex: "#0e0e0e", alpha: 1 },
    midground: { hex: "#eaeaea", alpha: 1 },
    foreground: { hex: "#ffffff", alpha: 0 },
    warmGlow: "rgba(255, 255, 255, 0.1)",
    noiseOpacity: 0.6,
  },
  typography: {
    ...DEFAULT_TYPOGRAPHY,
    fontSans: `"IBM Plex Sans", ${SYSTEM_SANS}`,
    fontMono: `"IBM Plex Mono", ${SYSTEM_MONO}`,
    fontUrl:
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap",
  },
  layout: {
    ...DEFAULT_LAYOUT,
    radius: "0",
  },
};

export const cyberpunkTheme: DashboardTheme = {
  name: "cyberpunk",
  label: "Cyberpunk",
  description: "Neon green on black — matrix terminal",
  palette: {
    background: { hex: "#040608", alpha: 1 },
    midground: { hex: "#9bffcf", alpha: 1 },
    foreground: { hex: "#ffffff", alpha: 0 },
    warmGlow: "rgba(0, 255, 136, 0.22)",
    noiseOpacity: 1.2,
  },
  typography: {
    ...DEFAULT_TYPOGRAPHY,
    fontSans: `"Share Tech Mono", "JetBrains Mono", ${SYSTEM_MONO}`,
    fontMono: `"Share Tech Mono", "JetBrains Mono", ${SYSTEM_MONO}`,
    fontUrl:
      "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=JetBrains+Mono:wght@400;700&display=swap",
  },
  layout: {
    ...DEFAULT_LAYOUT,
    radius: "0",
  },
  colorOverrides: {
    success: "#00ff88",
    warning: "#ffd700",
    destructive: "#ff0055",
  },
};

export const roseTheme: DashboardTheme = {
  name: "rose",
  label: "Rosé",
  description: "Soft pink and warm ivory — easy on the eyes",
  palette: {
    background: { hex: "#1a0f15", alpha: 1 },
    midground: { hex: "#ffd4e1", alpha: 1 },
    foreground: { hex: "#ffffff", alpha: 0 },
    warmGlow: "rgba(249, 168, 212, 0.3)",
    noiseOpacity: 0.9,
  },
  typography: {
    ...DEFAULT_TYPOGRAPHY,
    fontSans: `"Fraunces", Georgia, serif`,
    fontMono: `"DM Mono", ${SYSTEM_MONO}`,
    fontUrl:
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=DM+Mono:wght@400;500&display=swap",
  },
  layout: {
    ...DEFAULT_LAYOUT,
    radius: "1rem",
  },
};

/**
 * Same look as ``defaultTheme`` but with a larger root font size, looser
 * line-height, and ``spacious`` density so every rem-based size in the
 * dashboard scales up. For users who find the default 15px UI too dense.
 */
export const defaultLargeTheme: DashboardTheme = {
  name: "default-large",
  label: "Hermes Teal (Large)",
  description: "Hermes Teal with bigger fonts and roomier spacing",
  palette: defaultTheme.palette,
  typography: {
    ...DEFAULT_TYPOGRAPHY,
    baseSize: "18px",
    lineHeight: "1.65",
  },
  layout: {
    ...DEFAULT_LAYOUT,
    density: "spacious",
  },
};

export const bodycamTheme: DashboardTheme = {
  name: "bodycam",
  label: "Bodycam",
  description: "Police body camera aesthetic with purple neon glow",
  palette: {
    background: { hex: "#020205", alpha: 1 },
    midground: { hex: "#a43fff", alpha: 1 },
    foreground: { hex: "#ffffff", alpha: 0 },
    warmGlow: "rgba(164, 63, 255, 0.25)",
    noiseOpacity: 0.9,
  },
  typography: {
    ...DEFAULT_TYPOGRAPHY,
    fontSans: `"Rajdhani", "Orbitron", ${SYSTEM_SANS}`,
    fontMono: `"Share Tech Mono", "JetBrains Mono", ${SYSTEM_MONO}`,
    fontDisplay: `"Orbitron", "Rajdhani", ${SYSTEM_SANS}`,
    fontUrl:
      "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap",
    letterSpacing: "0.02em",
  },
  layout: {
    ...DEFAULT_LAYOUT,
    radius: "0.25rem",
  },
  colorOverrides: {
    primary: "#a43fff",
    primaryForeground: "#ffffff",
    accent: "#a43fff",
    accentForeground: "#ffffff",
    muted: "rgba(10, 15, 30, 0.7)",
    mutedForeground: "rgba(224, 247, 255, 0.6)",
    card: "rgba(10, 15, 30, 0.7)",
    cardForeground: "#e0f7ff",
    border: "rgba(164, 63, 255, 0.25)",
    ring: "#a43fff",
    destructive: "#dc2626",
    warning: "#f59e0b",
    success: "#16a34a",
  },
  componentStyles: {
    card: {
      background: "rgba(10, 15, 30, 0.7)",
      border: "1px solid rgba(164, 63, 255, 0.25)",
      boxShadow:
        "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(10px)",
    },
    header: {
      borderBottom: "1px solid rgba(164, 63, 255, 0.2)",
      background: "rgba(2, 2, 5, 0.8)",
      backdropFilter: "blur(12px)",
    },
    sidebar: {
      borderRight: "1px solid rgba(164, 63, 255, 0.2)",
      background: "rgba(2, 2, 5, 0.9)",
      backdropFilter: "blur(14px)",
    },
    badge: {
      background: "rgba(164, 63, 255, 0.15)",
      border: "1px solid rgba(164, 63, 255, 0.4)",
      color: "#e0f7ff",
      textShadow: "0 0 8px rgba(164, 63, 255, 0.6)",
    },
    backdrop: {
      background:
        "radial-gradient(ellipse at 50% 0%, rgba(164, 63, 255, 0.08) 0%, transparent 50%)",
    },
  },
  customCSS: `
    :root[data-theme="bodycam"] body::after {
      content: "";
      position: fixed;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.15) 2px,
        rgba(0, 0, 0, 0.15) 4px
      );
      pointer-events: none;
      z-index: 1;
      opacity: 0.4;
    }

    :root[data-theme="bodycam"] body::before {
      content: "";
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(164, 63, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(164, 63, 255, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
      z-index: 1;
    }

    [data-theme="bodycam"] button:not([disabled]):hover,
    [data-theme="bodycam"] [role="button"]:not([disabled]):hover,
    [data-theme="bodycam"] a:hover {
      box-shadow: 0 0 20px rgba(164, 63, 255, 0.3);
    }

    [data-theme="bodycam"] button[data-variant="primary"],
    [data-theme="bodycam"] .btn-primary {
      background: linear-gradient(135deg, rgba(164, 63, 255, 0.9) 0%, rgba(124, 43, 200, 0.9) 100%);
      border: 1px solid rgba(164, 63, 255, 0.5);
      box-shadow: 0 4px 20px rgba(164, 63, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    [data-theme="bodycam"] button[data-variant="primary"]:hover,
    [data-theme="bodycam"] .btn-primary:hover {
      box-shadow: 0 0 30px rgba(164, 63, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }

    [data-theme="bodycam"] .glass-panel,
    [data-theme="bodycam"] [data-glass="true"] {
      background: rgba(10, 15, 30, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(164, 63, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    [data-theme="bodycam"] h1,
    [data-theme="bodycam"] h2,
    [data-theme="bodycam"] h3 {
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    @keyframes bodycam-record-pulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(220, 38, 38, 0.8); }
      50% { opacity: 0.6; box-shadow: 0 0 20px rgba(220, 38, 38, 0.4); }
    }

    [data-theme="bodycam"] .recording-indicator {
      animation: bodycam-record-pulse 2s ease-in-out infinite;
    }
  `,
};

export const openfangTheme: DashboardTheme = {
  name: "openfang",
  label: "OpenFang",
  description: "Premium dark neutrals with sharp orange command accents",
  palette: {
    background: { hex: "#080706", alpha: 1 },
    midground: { hex: "#ffffff", alpha: 1 },
    foreground: { hex: "#ffffff", alpha: 0 },
    warmGlow: "rgba(255, 92, 0, 0.15)",
    noiseOpacity: 0.16,
  },
  typography: {
    ...DEFAULT_TYPOGRAPHY,
    fontSans: `"Inter", ${SYSTEM_SANS}`,
    fontMono: `"Geist Mono", "JetBrains Mono", ${SYSTEM_MONO}`,
    fontDisplay: `"Inter", ${SYSTEM_SANS}`,
    fontUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600;700&display=swap",
    baseSize: "16px",
    lineHeight: "1.5",
    letterSpacing: "0",
  },
  layout: {
    ...DEFAULT_LAYOUT,
    radius: "0.5rem",
  },
  colorOverrides: {
    card: "#242221",
    cardForeground: "#ffffff",
    popover: "#242221",
    popoverForeground: "#ffffff",
    primary: "#ff5c00",
    primaryForeground: "#ffffff",
    secondary: "#1a1817",
    secondaryForeground: "#d1d1d1",
    muted: "#2f2d2c",
    mutedForeground: "#9fa0a0",
    accent: "#ff5c00",
    accentForeground: "#ffffff",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    success: "#4ade80",
    warning: "#f59e0b",
    border: "#363230",
    input: "#2d2a28",
    ring: "#ff5c00",
  },
  assets: {
    bg: "radial-gradient(900px 560px at 68% -20%, rgba(255, 92, 0, 0.12) 0%, rgba(255, 92, 0, 0.03) 34%, transparent 62%), linear-gradient(180deg, #080706 0%, #0f0e0e 45%, #080706 100%)",
  },
  componentStyles: {
    card: {
      background: "linear-gradient(180deg, #242221 0%, #1a1817 100%)",
      boxShadow: "0 1px 2px rgba(0,0,0,0.32), 0 8px 18px rgba(0,0,0,0.26)",
    },
    header: {
      background: "rgba(15, 14, 14, 0.92)",
    },
    sidebar: {
      background: "rgba(15, 14, 14, 0.96)",
    },
    backdrop: {
      fillerOpacity: "0",
      fillerBlendMode: "normal",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    badge: {
      border: "1px solid rgba(255, 92, 0, 0.4)",
      background: "rgba(255, 92, 0, 0.15)",
      color: "#ffffff",
    },
  },
  customCSS: `
    :root[data-theme="openfang"] {
      --of-bg: #080706;
      --of-bg-primary: #0f0e0e;
      --of-surface: #242221;
      --of-surface3: #1a1817;
      --of-border: #363230;
      --of-border-light: #4a4644;
      --of-border-subtle: #2d2a28;
      --of-text: #ffffff;
      --of-text-secondary: #d1d1d1;
      --of-text-dim: #9fa0a0;
      --of-text-muted: #6b6663;
      --of-accent: #ff5c00;
      --of-accent-light: #ff7a2e;
      --of-accent-dim: #e05200;
      --of-accent-kanban-btn: #d45f2e;
      --of-text-kanban-btn: #f2ede6;
    }

    :root[data-theme="openfang"] h1,
    :root[data-theme="openfang"] h2,
    :root[data-theme="openfang"] h3,
    :root[data-theme="openfang"] h4,
    :root[data-theme="openfang"] h5,
    :root[data-theme="openfang"] h6,
    :root[data-theme="openfang"] .uppercase.tracking-wider,
    :root[data-theme="openfang"] .truncate.font-medium,
    :root[data-theme="openfang"] .truncate.font-semibold,
    :root[data-theme="openfang"] .hermes-kanban-column-label {
      color: var(--of-accent) !important;
    }

    :root[data-theme="openfang"] .hermes-kanban-boardswitcher button,
    :root[data-theme="openfang"] .hermes-kanban-boardswitcher-compact button,
    :root[data-theme="openfang"] .hermes-kanban .flex.flex-wrap.items-end.gap-3 > button,
    :root[data-theme="openfang"] .hermes-kanban-filterbar > button {
      border: 1px solid var(--of-accent-kanban-btn) !important;
      background: var(--of-accent-kanban-btn) !important;
      color: var(--of-text-kanban-btn) !important;
      font-weight: 600 !important;
      text-shadow: none !important;
      box-shadow: none !important;
    }

    :root[data-theme="openfang"] .inline-flex.items-center.border:not(.bg-destructive):not(.border-destructive):not(.bg-success):not(.border-success):not(.bg-primary) {
      border-color: rgba(255, 92, 0, 0.4) !important;
      background: rgba(255, 92, 0, 0.15) !important;
      color: #ffffff !important;
    }

    :root[data-theme="openfang"] button .truncate {
      color: inherit !important;
    }

    :root[data-theme="openfang"] body,
    :root[data-theme="openfang"] #root {
      background: var(--of-bg);
      color: var(--of-text);
    }

    :root[data-theme="openfang"] .blend-lighter {
      mix-blend-mode: normal;
    }

    :root[data-theme="openfang"] aside {
      background: color-mix(in srgb, var(--of-bg-primary) 96%, transparent) !important;
      border-right-color: var(--of-border) !important;
      backdrop-filter: blur(6px);
    }

    :root[data-theme="openfang"] header {
      background: color-mix(in srgb, var(--of-bg-primary) 92%, transparent) !important;
      border-bottom-color: var(--of-border) !important;
      backdrop-filter: blur(6px);
    }

    :root[data-theme="openfang"] aside nav {
      border-top-color: var(--of-border-subtle) !important;
    }

    :root[data-theme="openfang"] aside span[class*="text-[0.6rem]"][class*="tracking-[0.15em]"][class*="opacity-30"] {
      color: color-mix(in srgb, var(--of-accent-light) 68%, var(--of-text-secondary) 32%);
      opacity: 0.72 !important;
    }

    :root[data-theme="openfang"] aside nav a {
      color: color-mix(in srgb, var(--of-text-secondary) 86%, var(--of-text) 14%);
      background: transparent;
      border: 1px solid transparent;
      border-radius: 0.5rem;
      opacity: 1;
      text-transform: none;
      letter-spacing: 0.02em;
    }

    :root[data-theme="openfang"] aside nav a > span:not([aria-hidden]) {
      text-transform: none !important;
      letter-spacing: 0.02em !important;
    }

    :root[data-theme="openfang"] aside nav a:not([aria-current="page"]) {
      color: color-mix(in srgb, var(--of-text-dim) 58%, var(--of-text-secondary) 42%);
    }

    :root[data-theme="openfang"] aside nav a:hover {
      color: var(--of-text);
      background: color-mix(in srgb, var(--of-surface3) 82%, transparent);
      border-color: color-mix(in srgb, var(--of-border-light) 82%, var(--of-accent) 18%);
      box-shadow: inset 0 0 0 1px rgba(255, 122, 46, 0.06);
      opacity: 1;
    }

    :root[data-theme="openfang"] aside nav a[aria-current="page"] {
      color: var(--of-accent-light);
      background: linear-gradient(
        180deg,
        color-mix(in srgb, var(--of-surface) 84%, transparent) 0%,
        color-mix(in srgb, var(--of-surface3) 88%, transparent) 100%
      );
      border-color: color-mix(in srgb, var(--of-accent) 30%, var(--of-border-light) 70%);
      box-shadow:
        inset 0 0 0 1px rgba(255, 92, 0, 0.14),
        0 1px 8px rgba(0, 0, 0, 0.26);
      opacity: 1;
    }

    :root[data-theme="openfang"] aside nav a[aria-current="page"] [aria-hidden].w-px.bg-midground {
      background: var(--of-accent-light) !important;
      opacity: 1 !important;
      mix-blend-mode: normal !important;
      box-shadow: 0 0 6px rgba(255, 92, 0, 0.28);
    }

    :root[data-theme="openfang"] .border,
    :root[data-theme="openfang"] .border-border {
      border-color: var(--of-border-subtle);
    }
  `,
};

export const BUILTIN_THEMES: Record<string, DashboardTheme> = {
  default: defaultTheme,
  "default-large": defaultLargeTheme,
  midnight: midnightTheme,
  ember: emberTheme,
  mono: monoTheme,
  cyberpunk: cyberpunkTheme,
  rose: roseTheme,
  bodycam: bodycamTheme,
  openfang: openfangTheme,
};
