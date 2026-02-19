import type { CSSProperties } from "react";
import type { V3RiskLevel } from "./types";

export const V3_THEME = {
  colors: {
    bg: "#05080F",
    bgEdge: "#0B121E",
    panel: "rgba(11, 16, 26, 0.86)",
    panelSoft: "rgba(14, 20, 32, 0.68)",
    panelBorder: "rgba(243, 186, 47, 0.32)",
    panelBorderSoft: "rgba(148, 163, 184, 0.3)",
    text: "#F8FBFF",
    muted: "#B7C2D3",
    accent: "#F3BA2F",
    green: "#24CE9A",
    yellow: "#F4C046",
    red: "#FF6464"
  },
  fonts: {
    title: "'Space Grotesk', 'Avenir Next', sans-serif",
    body: "'IBM Plex Sans', 'Helvetica Neue', sans-serif",
    mono: "'IBM Plex Mono', 'Menlo', monospace"
  },
  radius: {
    xl: 28,
    lg: 20,
    md: 14,
    sm: 10
  },
  shadow: "0 28px 72px rgba(0,0,0,0.42)"
} as const;

export function levelColor(level: V3RiskLevel): string {
  if (level === "green") return V3_THEME.colors.green;
  if (level === "yellow") return V3_THEME.colors.yellow;
  return V3_THEME.colors.red;
}

export function panelStyle(): CSSProperties {
  return {
    borderRadius: V3_THEME.radius.lg,
    border: `1px solid ${V3_THEME.colors.panelBorder}`,
    background: V3_THEME.colors.panel,
    boxShadow: V3_THEME.shadow,
    backdropFilter: "blur(7px)"
  };
}
