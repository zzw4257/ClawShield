import { createHash } from "node:crypto";
import { RepoFile } from "../lib/file-utils.js";

export function computeFingerprint(files: RepoFile[]): string {
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(file.relativePath);
    hash.update("\0");
    hash.update(file.content);
    hash.update("\0");
  }
  return `0x${hash.digest("hex")}`;
}

export function computeReportHash(payload: unknown): string {
  const hash = createHash("sha256");
  hash.update(JSON.stringify(payload));
  return `0x${hash.digest("hex")}`;
}
