import type { ReactNode } from "react";
import { AbsoluteFill, Img, interpolate } from "remotion";
import { V3_LAYOUT } from "./layout";
import { V3_THEME } from "./theme";
import { fitHeadingSize, truncateMiddle, wrapToTwoLines } from "./text-fit";

interface FrameScaffoldV3Props {
  frame: number;
  kicker: string;
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  contractAddress: string;
  txHash: string;
  children: ReactNode;
}

export const FrameScaffoldV3 = ({
  frame,
  kicker,
  title,
  subtitle,
  backgroundImage,
  contractAddress,
  txHash,
  children
}: FrameScaffoldV3Props) => {
  const opacity = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(frame, [0, 22], [20, 0], { extrapolateRight: "clamp" });

  const titleSize = fitHeadingSize(title, {
    min: 44,
    max: 58,
    softLimit: 42,
    shrinkPerChar: 0.55
  });

  const subtitleSize = fitHeadingSize(subtitle || "", {
    min: 22,
    max: 30,
    softLimit: 88,
    shrinkPerChar: 0.22
  });

  const titleLines = wrapToTwoLines(title, 38);
  const subtitleLines = subtitle ? wrapToTwoLines(subtitle, 92) : [];

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 18% 8%, ${V3_THEME.colors.bgEdge} 0%, ${V3_THEME.colors.bg} 52%, #02050A 100%)`,
        color: V3_THEME.colors.text,
        fontFamily: V3_THEME.fonts.body
      }}
    >
      {backgroundImage ? (
        <AbsoluteFill style={{ opacity: 0.18 }}>
          <Img src={backgroundImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill
        style={{
          opacity,
          transform: `translateY(${translateY}px)`
        }}
      >
        <div
          style={{
            position: "absolute",
            top: V3_LAYOUT.TOP_BAR_Y,
            left: V3_LAYOUT.SAFE_X,
            right: V3_LAYOUT.SAFE_X,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div
            style={{
              fontFamily: V3_THEME.fonts.mono,
              color: V3_THEME.colors.accent,
              fontSize: 18,
              letterSpacing: 1.1,
              textTransform: "uppercase"
            }}
          >
            {kicker}
          </div>

          <div
            style={{
              maxWidth: 760,
              borderRadius: 999,
              border: `1px solid ${V3_THEME.colors.panelBorder}`,
              background: "rgba(6,10,17,0.86)",
              padding: "10px 16px",
              fontFamily: V3_THEME.fonts.mono,
              fontSize: 15,
              lineHeight: 1.2,
              textAlign: "right"
            }}
          >
            {truncateMiddle(contractAddress, 12, 10)} · {truncateMiddle(txHash, 12, 10)}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: V3_LAYOUT.HEADER_Y,
            left: V3_LAYOUT.SAFE_X,
            right: V3_LAYOUT.SAFE_X,
            display: "flex",
            justifyContent: "center"
          }}
        >
          <div style={{ width: V3_LAYOUT.HEADER_MAX_W, textAlign: "center" }}>
            <h1
              style={{
                margin: 0,
                fontFamily: V3_THEME.fonts.title,
                fontSize: titleSize,
                lineHeight: 1,
                letterSpacing: -0.6
              }}
            >
              {titleLines[0]}
              {titleLines[1] ? <><br />{titleLines[1]}</> : null}
            </h1>

            {subtitleLines.length > 0 ? (
              <p
                style={{
                  margin: "16px auto 0",
                  maxWidth: 1140,
                  fontSize: subtitleSize,
                  lineHeight: 1.22,
                  color: V3_THEME.colors.muted
                }}
              >
                {subtitleLines[0]}
                {subtitleLines[1] ? <><br />{subtitleLines[1]}</> : null}
              </p>
            ) : null}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: V3_LAYOUT.CONTENT_Y,
            left: V3_LAYOUT.SAFE_X,
            right: V3_LAYOUT.SAFE_X,
            height: V3_LAYOUT.CONTENT_H,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
