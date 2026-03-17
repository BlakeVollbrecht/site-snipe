let clickTimeoutId: number | null = null;
let getClickTarget: () => Element | null = () => null;

export function setClickTargetResolver(resolver: () => Element | null) {
  getClickTarget = resolver;
}

export function scheduleClickAt(
  time: string,
  leadMs: number,
  onClickFired?: (actualTimeIso: string) => void,
) {
  const targetElement = getClickTarget();
  if (!targetElement) return;

  if (clickTimeoutId !== null) {
    window.clearTimeout(clickTimeoutId);
    clickTimeoutId = null;
  }

  const [hoursStr, minutesStr] = time.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return;

  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  // If the time has already passed today, schedule for tomorrow
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  target.setTime(target.getTime() - leadMs);

  const delay = target.getTime() - now.getTime();
  const coarseLeadMs = 300;

  if (delay <= coarseLeadMs) {
    const targetPerf = performance.now() + delay;

    clickTimeoutId = window.setTimeout(() => {
      const element = getClickTarget();
      if (element && document.contains(element)) {
        element.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          }),
        );
      }

      clickTimeoutId = null;
      if (onClickFired) {
        onClickFired(new Date().toISOString());
      }
    }, delay);
    return;
  }

  const coarseDelay = delay - coarseLeadMs;

  clickTimeoutId = window.setTimeout(() => {
    // Recompute remaining time to the exact target, then busy-wait the last slice
    const remainingMs = target.getTime() - Date.now();
    const spinTargetPerf = performance.now() + Math.max(remainingMs, 0);

    while (performance.now() < spinTargetPerf) {
      // tight loop for final few hundred ms
    }

    const element = getClickTarget();
    if (element && document.contains(element)) {
      element.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
        }),
      );
    }

    clickTimeoutId = null;
    if (onClickFired) {
      onClickFired(new Date().toISOString());
    }
  }, coarseDelay);
}

export function disarmClickTimer() {
  if (clickTimeoutId !== null) {
    window.clearTimeout(clickTimeoutId);
    clickTimeoutId = null;
  }
}

