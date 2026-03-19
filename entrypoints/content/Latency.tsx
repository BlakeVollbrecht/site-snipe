import { useEffect, useRef, useState } from 'react';
import type { LatencyStats } from './latency';
import { measureCurrentPageLatency } from './latency';
import { Button } from '@/components/ui/button';
import { HistogramWithNormalCurve } from '@/components/charts/HistogramWithNormalCurve';

const MAX_SAMPLES = 200;

function computeStats(samples: number[]): LatencyStats {
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance =
    samples.reduce((sq, n) => sq + (n - mean) ** 2, 0) / (samples.length - 1 || 1);
  const stdDev = Math.sqrt(variance);

  return {
    meanOffset: Math.round(mean),
    stdDev: Math.round(stdDev),
    lead2sigma: Math.round(mean + 2 * stdDev),
    lead3sigma: Math.round(mean + 3 * stdDev),
  };
}

function LatencyStatsView({
  stats,
  samples,
}: {
  stats: LatencyStats | null;
  samples: number[];
}) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-x-4 gap-y-2 items-start">
      <div className="min-[480px]:col-span-2 min-w-0">
        <HistogramWithNormalCurve samples={samples} />
      </div>
      <dl className="space-y-2 text-[12px] col-span-1">
        <div className="flex items-center gap-2">
          <dt className="font-medium">Mean (ms):</dt>
          <dd className="font-mono tabular-nums">{stats.meanOffset}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="font-medium">Std dev (ms):</dt>
          <dd className="font-mono tabular-nums">{stats.stdDev}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="font-medium"># samples:</dt>
          <dd className="font-mono tabular-nums">{samples.length}</dd>
        </div>
      </dl>
    </div>
  );
}

function LatencyMeasureSection({
  title,
  hint,
  measureOnce,
  getNextDelayMs,
}: {
  title: string;
  hint: string;
  measureOnce: () => Promise<LatencyStats>;
  getNextDelayMs: () => number;
}) {
  const [stats, setStats] = useState<LatencyStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const samplesRef = useRef<number[]>([]);
  const timerRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  const handleReset = () => {
    samplesRef.current = [];
    setStats(null);
    setError(null);
  };

  const doMeasureOnce = async () => {
    try {
      const result = await measureOnce();
      const sample = result.meanOffset;

      samplesRef.current = [...samplesRef.current, sample].slice(-MAX_SAMPLES);
      setStats(computeStats(samplesRef.current));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to measure latency');
    }
  };

  const scheduleNext = () => {
    if (!runningRef.current) return;
    timerRef.current = window.setTimeout(async () => {
      await doMeasureOnce();
      scheduleNext();
    }, getNextDelayMs());
  };

  const handleToggle = async () => {
    if (runningRef.current) {
      runningRef.current = false;
      setRunning(false);
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    runningRef.current = true;
    setRunning(true);
    if (error) setError(null);
    await doMeasureOnce();
    scheduleNext();
  };

  useEffect(() => {
    return () => {
      runningRef.current = false;
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleToggle}>
            {running ? 'Stop' : 'Measure'}
          </Button>
          <Button
            size="icon-sm"
            variant="secondary"
            onClick={handleReset}
            type="button"
            title="Reset latency samples"
            aria-label="Reset latency samples"
          >
            {/* Simple inline reset icon to keep the control compact. */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <polyline points="21 3 21 9 15 9" />
            </svg>
          </Button>
        </div>
      </div>
      {error && <div className="text-xs text-destructive">{error}</div>}
      <LatencyStatsView stats={stats} samples={samplesRef.current} />
      {!stats && !error && !running && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </section>
  );
}

function OwnServerLatencySection() {
  return (
    <LatencyMeasureSection
      title="Own server"
      hint="Measure latency vs your own server."
      measureOnce={async () =>
        (await browser.runtime.sendMessage({
          type: 'site-snipe:get-latency-stats',
          samples: 1,
        })) as LatencyStats}
      getNextDelayMs={() => 500}
    />
  );
}

function CurrentPageLatencySection() {
  return (
    <LatencyMeasureSection
      title="Current page"
      hint="Measure latency for this page (1/2 round-trip)."
      measureOnce={() => measureCurrentPageLatency(1)}
      getNextDelayMs={() => 250 + Math.random() * 500}
    />
  );
}

export function Latency() {
  return (
    <div className="space-y-2">
      <OwnServerLatencySection />
      <CurrentPageLatencySection />
    </div>
  );
}
