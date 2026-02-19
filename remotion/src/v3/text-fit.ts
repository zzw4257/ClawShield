interface FitHeadingOptions {
  min: number;
  max: number;
  softLimit: number;
  shrinkPerChar: number;
}

export function fitHeadingSize(text: string, options: FitHeadingOptions): number {
  const length = text.trim().length;
  if (length <= options.softLimit) {
    return options.max;
  }
  const size = options.max - (length - options.softLimit) * options.shrinkPerChar;
  return Math.max(options.min, Math.round(size));
}

export function truncateMiddle(value: string, head = 10, tail = 8): string {
  if (!value) return value;
  const trimmed = value.trim();
  if (trimmed.length <= head + tail + 3) {
    return trimmed;
  }
  return `${trimmed.slice(0, head)}...${trimmed.slice(-tail)}`;
}

export function clampText(text: string, maxChars: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxChars) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
}

export function wrapToTwoLines(text: string, maxCharsPerLine = 92): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length === 0) {
    return [""];
  }

  const lines: string[] = [""];

  for (const word of words) {
    const current = lines[lines.length - 1];
    const candidate = current.length === 0 ? word : `${current} ${word}`;

    if (candidate.length <= maxCharsPerLine) {
      lines[lines.length - 1] = candidate;
      continue;
    }

    if (lines.length === 1) {
      lines.push(word);
      continue;
    }

    lines[1] = clampText(`${lines[1]} ${word}`.trim(), maxCharsPerLine);
  }

  if (lines.length > 2) {
    return [lines[0], clampText(lines.slice(1).join(" "), maxCharsPerLine)];
  }

  return lines.slice(0, 2);
}
