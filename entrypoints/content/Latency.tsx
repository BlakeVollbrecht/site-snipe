import { useEffect, useRef, useState } from 'react';
import './Latency.css';
import type { LatencyStats } from './latency';
import { measureCurrentPageLatency } from './latency';

export function Latency() {
  const [ownStats, setOwnStats] = useState<LatencyStats | null>(null);
  const [ownLoading, setOwnLoading] = useState(false);
  const [ownError, setOwnError] = useState<string | null>(null);

  const [pageStats, setPageStats] = useState<LatencyStats | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageRunning, setPageRunning] = useState(false);

  const pageSamplesRef = useRef<number[]>([]);
  const pageTimerRef = useRef<number | null>(null);
  const pageRunningRef = useRef(false);

  const computeStats = (samples: number[]): LatencyStats => {
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
  };

  const handleMeasureOwn = async () => {
    setOwnLoading(true);
    setOwnError(null);
    try {
      const result = (await browser.runtime.sendMessage({
        type: 'site-snipe:get-latency-stats',
      })) as LatencyStats;
      setOwnStats(result);
    } catch (e) {
      setOwnError(e instanceof Error ? e.message : 'Failed to measure latency');
    } finally {
      setOwnLoading(false);
    }
  };

  const measurePageOnce = async () => {
    try {
      const result = await measureCurrentPageLatency(1);
      const sample = result.meanOffset;

      pageSamplesRef.current = [...pageSamplesRef.current, sample].slice(-25);
      setPageStats(computeStats(pageSamplesRef.current));
    } catch (e) {
      setPageError(e instanceof Error ? e.message : 'Failed to measure page latency');
    }
  };

  const scheduleNextPageMeasurement = () => {
    if (!pageRunningRef.current) return;
    const delay = 5000 + Math.random() * 10000; // 5-15 seconds
    pageTimerRef.current = window.setTimeout(async () => {
      await measurePageOnce();
      scheduleNextPageMeasurement();
    }, delay);
  };

  const handleTogglePage = async () => {
    if (pageRunningRef.current) {
      pageRunningRef.current = false;
      setPageRunning(false);
      if (pageTimerRef.current !== null) {
        window.clearTimeout(pageTimerRef.current);
        pageTimerRef.current = null;
      }
      return;
    }

    pageRunningRef.current = true;
    setPageRunning(true);
    pageError && setPageError(null);
    await measurePageOnce();
    scheduleNextPageMeasurement();
  };

  useEffect(() => {
    return () => {
      pageRunningRef.current = false;
      if (pageTimerRef.current !== null) {
        window.clearTimeout(pageTimerRef.current);
        pageTimerRef.current = null;
      }
    };
  }, []);

  const renderStats = (stats: LatencyStats | null) => {
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
  };

  return (
    <div className="site-snipe-latency">
      <section className="site-snipe-latency-section">
        <div className="site-snipe-latency-header">
          <span>Own server</span>
          <button
            className="site-snipe-latency-button"
            onClick={handleMeasureOwn}
            disabled={ownLoading}
          >
            {ownLoading ? 'Measuring…' : 'Measure'}
          </button>
        </div>
        {ownError && <div className="site-snipe-latency-error">{ownError}</div>}
        {renderStats(ownStats)}
        {!ownStats && !ownError && !ownLoading && (
          <p className="site-snipe-latency-hint">
            Click Measure to compute latency vs your own server.
          </p>
        )}
      </section>

      <section className="site-snipe-latency-section">
        <div className="site-snipe-latency-header">
          <span>Current page</span>
          <button
            className="site-snipe-latency-button"
            onClick={handleTogglePage}
          >
            {pageRunning ? 'Stop' : 'Measure'}
          </button>
        </div>
        {pageError && <div className="site-snipe-latency-error">{pageError}</div>}
        {renderStats(pageStats)}
        {!pageStats && !pageError && !pageRunning && (
          <p className="site-snipe-latency-hint">
            Click Measure to start live round-trip latency sampling for this page.
          </p>
        )}
      </section>
    </div>
  );
}

