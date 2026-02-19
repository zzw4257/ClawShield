import type { CSSProperties } from "react";
import { V2RiskLevel } from "./types";

export const V2_THEME = {
  colors: {
    bg: "#0A0D12",
    panel: "rgba(16, 20, 29, 0.86)",
    panelBorder: "rgba(243, 186, 47, 0.34)",
    text: "#F5F7FA",
    muted: "#B4BDC9",
    accent: "#F3BA2F",
    green: "#20C997",
    yellow: "#F4B942",
    red: "#FF5B5B"
  },
  fonts: {
    title: "'Space Grotesk', 'Inter', sans-serif",
    body: "'IBM Plex Sans', 'Inter', sans-serif",
    mono: "'IBM Plex Mono', 'Menlo', monospace"
  },
  radius: {
    xl: 30,
    lg: 22,
    md: 14
  },
  shadow: "0 30px 90px rgba(0,0,0,0.45)"
} as const;

export function levelColor(level: V2RiskLevel): string {
  if (level === "green") return V2_THEME.colors.green;
  if (level === "yellow") return V2_THEME.colors.yellow;
  return V2_THEME.colors.red;
}

export function shortHex(value: string, head = 8, tail = 6): string {
  if (!value || value.length <= head + tail + 3) {
    return value;
  }
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

export function glassPanelStyle(): CSSProperties {
  return {
    background: V2_THEME.colors.panel,
    border: `1px solid ${V2_THEME.colors.panelBorder}`,
    borderRadius: V2_THEME.radius.lg,
    boxShadow: V2_THEME.shadow,
    backdropFilter: "blur(8px)"
  };
}
