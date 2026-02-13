import fs from "node:fs";
import path from "node:path";

const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".turbo",
  "coverage",
  "artifacts",
  "cache"
]);

export interface RepoFile {
  relativePath: string;
  content: string;
}

export function collectTextFiles(rootDir: string, maxSizeBytes = 512 * 1024): RepoFile[] {
  const files: RepoFile[] = [];

  const walk = (currentDir: string) => {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) {
          continue;
        }
        walk(path.join(currentDir, entry.name));
        continue;
      }

      const absolutePath = path.join(currentDir, entry.name);
      const stat = fs.statSync(absolutePath);
      if (stat.size > maxSizeBytes) {
        continue;
      }

      const raw = fs.readFileSync(absolutePath);
      if (raw.includes(0)) {
        continue;
      }

      files.push({
        relativePath: path.relative(rootDir, absolutePath).replaceAll(path.sep, "/"),
        content: raw.toString("utf8")
      });
    }
  };

  walk(rootDir);
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  return files;
}
