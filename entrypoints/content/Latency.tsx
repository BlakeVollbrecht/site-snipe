import { useState } from 'react';
import './Latency.css';
import type { LatencyStats } from './latency';

export function Latency() {
  const [stats, setStats] = useState<LatencyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMeasure = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = (await browser.runtime.sendMessage({
        type: 'site-snipe:get-latency-stats',
      })) as LatencyStats;
      setStats(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to measure latency');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-snipe-latency">
      <div className="site-snipe-latency-header">
        <span>Latency calibration</span>
        <button
          className="site-snipe-latency-button"
          onClick={handleMeasure}
          disabled={loading}
        >
          {loading ? 'Measuring…' : 'Measure'}
        </button>
      </div>
      {error && <div className="site-snipe-latency-error">{error}</div>}
      {stats && (
        <dl className="site-snipe-latency-stats">
          <div>
            <dt>Mean offset (ms)</dt>
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
      )}
      {!stats && !error && !loading && (
        <p className="site-snipe-latency-hint">Click Measure to compute latency stats.</p>
      )}
    </div>
  );
}

