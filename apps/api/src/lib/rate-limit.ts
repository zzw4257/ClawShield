import { Request, Response, NextFunction } from "express";

interface Bucket {
  windowStartMs: number;
  count: number;
}

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  key?: (req: Request) => string;
}) {
  const buckets = new Map<string, Bucket>();

  return function rateLimiter(req: Request, res: Response, next: NextFunction): void {
    const now = Date.now();
    const key = options.key ? options.key(req) : req.ip || "unknown";
    const bucket = buckets.get(key);

    if (!bucket || now - bucket.windowStartMs >= options.windowMs) {
      buckets.set(key, {
        windowStartMs: now,
        count: 1
      });
      next();
      return;
    }

    if (bucket.count >= options.maxRequests) {
      const retryAfterSeconds = Math.ceil((options.windowMs - (now - bucket.windowStartMs)) / 1000);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({ error: "Too many requests" });
      return;
    }

    bucket.count += 1;
    next();
  };
}
