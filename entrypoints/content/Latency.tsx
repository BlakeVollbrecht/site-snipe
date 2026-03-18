import { useEffect, useRef, useState } from 'react';
import './Latency.css';
import type { LatencyStats } from './latency';
import { measureCurrentPageLatency } from './latency';

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

function LatencyStatsView({ stats }: { stats: LatencyStats | null }) {
  if (!stats) return null;
  return (
    <dl className="site-snipe-latency-stats">
      <div>
        <dt>Mean (ms)</dt>
        <dd>{stats.meanOffset}</dd>
      </div>
      <div>
        <dt>Std dev (ms)</dt>
        <dd>{stats.stdDev}</dd>
      </div>
      <div>
        <dt>Mean + 2σ (ms)</dt>
        <dd>{stats.lead2sigma}</dd>
      </div>
      <div>
        <dt>Mean + 3σ (ms)</dt>
        <dd>{stats.lead3sigma}</dd>
      </div>
    </dl>
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
    <section className="site-snipe-latency-section">
      <div className="site-snipe-latency-header">
        <span>{title}</span>
        <div className="site-snipe-latency-actions">
          <button
            className="site-snipe-button site-snipe-button--latency"
            onClick={handleToggle}
          >
            {running ? 'Stop' : 'Measure'}
          </button>
          <button
            className="site-snipe-button site-snipe-button--muted"
            onClick={handleReset}
            type="button"
          >
            Reset
          </button>
        </div>
      </div>
      {error && <div className="site-snipe-latency-error">{error}</div>}
      <LatencyStatsView stats={stats} />
      {!stats && !error && !running && <p className="site-snipe-latency-hint">{hint}</p>}
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
    <div className="site-snipe-latency">
      <h2 className="text-lg font-medium">Latency</h2>
      <OwnServerLatencySection />
      <CurrentPageLatencySection />
    </div>
  );
}
