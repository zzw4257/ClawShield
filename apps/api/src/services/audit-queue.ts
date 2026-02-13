import { DatabaseClient } from "../lib/db.js";
import { runAuditJob } from "./audit-job.js";

export class AuditQueue {
  private readonly queue: string[] = [];
  private activeCount = 0;

  constructor(
    private readonly db: DatabaseClient,
    private readonly concurrency = 1
  ) {}

  enqueue(auditId: string): void {
    this.queue.push(auditId);
    this.pump();
  }

  private pump(): void {
    while (this.activeCount < this.concurrency && this.queue.length > 0) {
      const nextAuditId = this.queue.shift();
      if (!nextAuditId) {
        return;
      }

      this.activeCount += 1;
      void runAuditJob(this.db, nextAuditId)
        .catch((error) => {
          const message = error instanceof Error ? error.message : "Audit queue task failed";
          this.db.updateAuditStatus(nextAuditId, "failed", message);
        })
        .finally(() => {
          this.activeCount -= 1;
          this.pump();
        });
    }
  }
}
