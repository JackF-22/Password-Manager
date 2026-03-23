let clearTimerId: ReturnType<typeof setTimeout> | null = null;

/**
 * Schedules clearing the system clipboard after `delayMs`.
 * Reschedules if called again before the delay elapses.
 */
export function scheduleClipboardClear(delayMs = 30_000): void {
  if (clearTimerId !== null) {
    clearTimeout(clearTimerId);
    clearTimerId = null;
  }
  clearTimerId = setTimeout(() => {
    clearTimerId = null;
    void navigator.clipboard.writeText("").catch(() => {
      /* ignore — permission or unsupported */
    });
  }, delayMs);
}

export function cancelScheduledClipboardClear(): void {
  if (clearTimerId !== null) {
    clearTimeout(clearTimerId);
    clearTimerId = null;
  }
}
