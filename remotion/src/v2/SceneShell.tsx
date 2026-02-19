import type { ReactNode } from "react";
import { AbsoluteFill, Img, interpolate } from "remotion";
import { V2_THEME } from "./theme";

interface SceneShellProps {
  frame: number;
  kicker: string;
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  children: ReactNode;
}

export const SceneShell = ({
  frame,
  kicker,
  title,
  subtitle,
  backgroundImage,
  children
}: SceneShellProps) => {
  const opacity = interpolate(frame, [0, 24], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [0, 24], [24, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 20% 15%, #1B2230 0%, ${V2_THEME.colors.bg} 48%, #05070B 100%)`,
        color: V2_THEME.colors.text
      }}
    >
      {backgroundImage ? (
        <AbsoluteFill style={{ opacity: 0.22 }}>
          <Img src={backgroundImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill
        style={{
          padding: 72,
          justifyContent: "space-between",
          transform: `translateY(${translateY}px)`,
          opacity
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: V2_THEME.colors.accent,
              fontFamily: V2_THEME.fonts.mono,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              fontSize: 20
            }}
          >
            {kicker}
          </p>
          <h1
            style={{
              margin: "12px 0 10px",
              fontSize: 74,
              lineHeight: 0.98,
              fontFamily: V2_THEME.fonts.title
            }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p
              style={{
                margin: 0,
                fontFamily: V2_THEME.fonts.body,
                color: V2_THEME.colors.muted,
                fontSize: 27,
                maxWidth: 1300,
                lineHeight: 1.3
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
