/**
 * Race an entire asynchronous operation against an elapsed-time deadline.
 *
 * The supplied signal lets cooperative work stop. For non-cooperative work,
 * only the returned Promise is bounded; the underlying work might continue
 * or produce side effects. Never infer that it is safe to retry.
 *
 * Adapted from runx packages/admin/src/transport/deadline.ts, stripping
 * control-plane-specific errors, defaults, limits and HTTP assumptions.
 */
export class DeadlineExceededError extends Error {
  constructor() {
    super('deadline exceeded; underlying work may still be running');
    this.name = 'DeadlineExceededError';
  }
}

export function isDeadlineExceeded(error: unknown): error is DeadlineExceededError {
  return error instanceof DeadlineExceededError;
}

/**
 * @param work Operation to call once; it should honor the AbortSignal.
 * @param timeoutMs Positive safe integer milliseconds, at most 2^31-1.
 */
export async function withDeadline<T>(
  work: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 2_147_483_647) {
    throw new RangeError('timeoutMs must be an integer between 1 and 2147483647');
  }
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      // Reject first so an abort-driven rejection cannot win the race.
      reject(new DeadlineExceededError());
      controller.abort();
    }, timeoutMs);
  });
  try {
    return await Promise.race([work(controller.signal), deadline]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
