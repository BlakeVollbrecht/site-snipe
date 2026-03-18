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
    <div className="space-y-2">
      <HistogramWithNormalCurve samples={samples} />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div>
          <dt className="font-medium">Std dev (ms)</dt>
          <dd className="font-mono tabular-nums">{stats.stdDev}</dd>
        </div>
        <div>
          <dt className="font-medium"># samples</dt>
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
    <section className="mt-3 pt-2 border-t border-border">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-sm font-medium">{title}</span>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleToggle}>
            {running ? 'Stop' : 'Measure'}
          </Button>
          <Button size="sm" variant="secondary" onClick={handleReset} type="button">
            Reset
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
      hint="Click Measure to compute latency vs your own server."
      measureOnce={async () =>
        (await browser.runtime.sendMessage({
          type: 'site-snipe:get-latency-stats',
          samples: 1,
        })) as LatencyStats}
      getNextDelayMs={() => 1000}
    />
  );
}

function CurrentPageLatencySection() {
  return (
    <LatencyMeasureSection
      title="Current page"
      hint="Click Measure to start live round-trip latency sampling for this page."
      measureOnce={() => measureCurrentPageLatency(1)}
      getNextDelayMs={() => 250 + Math.random() * 500}
    />
  );
}

export function Latency() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium">Latency</h2>
      <OwnServerLatencySection />
      <CurrentPageLatencySection />
    </div>
  );
}
