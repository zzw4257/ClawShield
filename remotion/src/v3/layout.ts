import type { V3LayoutSpec } from "./types";

export const V3_LAYOUT: V3LayoutSpec = {
  FRAME_W: 1920,
  FRAME_H: 1080,
  SAFE_X: 96,
  TOP_BAR_Y: 24,
  HEADER_Y: 72,
  HEADER_MAX_W: 1180,
  CONTENT_Y: 300,
  CONTENT_H: 520,
  SUBTITLE_LANE_Y: 860,
  SUBTITLE_LANE_H: 180
};

export const V3_CONTENT_BOTTOM = V3_LAYOUT.CONTENT_Y + V3_LAYOUT.CONTENT_H;

export function contentMaxWidth(): number {
  return V3_LAYOUT.FRAME_W - V3_LAYOUT.SAFE_X * 2;
}
