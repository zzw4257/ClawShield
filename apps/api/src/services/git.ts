import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function checkoutRepositoryCommit(repoUrl: string, commitSha: string): Promise<string> {
  const tmpRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), "clawshield-audit-"));

  await execFileAsync("git", ["init"], { cwd: tmpRoot });
  await execFileAsync("git", ["remote", "add", "origin", repoUrl], { cwd: tmpRoot });
  await execFileAsync("git", ["fetch", "--depth", "1", "origin", commitSha], { cwd: tmpRoot });
  await execFileAsync("git", ["checkout", "FETCH_HEAD"], { cwd: tmpRoot });

  return tmpRoot;
}

export async function cleanupDirectory(dir: string): Promise<void> {
  await fs.promises.rm(dir, { recursive: true, force: true });
}
