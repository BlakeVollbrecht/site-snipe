export function HistogramWithNormalCurve({
  samples,
  binCount = 20,
  width = 320,
  height = 155,
}: {
  samples: number[];
  binCount?: number;
  tickCount?: number;
  width?: number;
  height?: number;
}) {
  const sampleCount = samples.length;
  if (sampleCount === 0) return null;

  const marginLeft = 6;
  const marginRight = 6;
  const marginTop = 10;
  const marginBottom = 46; // room for x-axis labels
  const chartWidth = width - marginLeft - marginRight;
  const chartHeight = height - marginTop - marginBottom;

  const mean =
    samples.reduce((a, b) => a + b, 0) / (sampleCount === 0 ? 1 : sampleCount);
  const variance =
    sampleCount > 1
      ? samples.reduce((sq, n) => sq + (n - mean) ** 2, 0) / (sampleCount - 1)
      : 0;
  const stdDev = Math.sqrt(variance);

  const formatMsOrSeconds = (valueMs: number) => {
    const abs = Math.abs(valueMs);
    if (abs >= 1000) {
      // 1 decimal place to keep labels short, e.g. "1.2 s"
      const seconds = Math.round((valueMs / 1000) * 10) / 10;
      return `${seconds} s`;
    }
    return `${Math.round(valueMs)} ms`;
  };

  // Only show the histogram in the range mean ± 3.5σ.
  // (If σ is 0, fall back to a tiny span to avoid division-by-zero.)
  const min = stdDev === 0 ? mean - 0.5 : mean - 3.5 * stdDev;
  const max = stdDev === 0 ? mean + 0.5 : mean + 3.5 * stdDev;
  const span = max - min;

  const bins = new Array(binCount).fill(0);
  for (const s of samples) {
    const t = span === 0 ? 0 : (s - min) / span;
    const idx = Math.min(binCount - 1, Math.max(0, Math.floor(t * binCount)));
    bins[idx] += 1;
  }

  const maxBinCount = Math.max(1, ...bins);
  const barGap = 1;
  const barWidth = chartWidth / binCount - barGap;

  const toX = (v: number) => marginLeft + ((v - min) / span) * chartWidth;
  const axisY = marginTop + chartHeight;
  const toY = (count: number, scaleMax: number) =>
    marginTop + chartHeight - (count / scaleMax) * chartHeight;

  const sigmaBands: Array<{ k: number; label?: string; color: string }> =
    stdDev === 0
      ? [{ k: 0, label: undefined, color: 'var(--color-foreground)' }]
      : [
          { k: 0, label: undefined, color: 'var(--color-foreground)' },
          { k: -1, label: '-1σ', color: 'var(--color-border)' },
          { k: 1, label: '+1σ', color: 'var(--color-border)' },
          { k: -2, label: '-2σ', color: 'var(--color-border)' },
          { k: 2, label: '+2σ', color: 'var(--color-border)' },
          { k: -3, label: '-3σ', color: 'var(--color-border)' },
          { k: 3, label: '+3σ', color: 'var(--color-border)' },
        ];

  // Normal curve overlay: scale PDF to "expected bin counts" so it sits on the bars.
  const binWidth = span / binCount;
  const curvePoints = 90;
  const curveCounts: number[] = [];
  if (stdDev > 0) {
    for (let i = 0; i <= curvePoints; i++) {
      const x = min + (span * i) / curvePoints;
      const z = (x - mean) / stdDev;
      const pdf = Math.exp(-0.5 * z * z) / (stdDev * Math.sqrt(2 * Math.PI));
      curveCounts.push(pdf * binWidth * sampleCount);
    }
  }
  const curveMax = curveCounts.length > 0 ? Math.max(0, ...curveCounts) : 0;
  const scaleMax = Math.max(1, maxBinCount, curveMax);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Histogram"
      className="block"
    >
      {/* Axis */}
      <line
        x1={marginLeft}
        x2={width - marginRight}
        y1={axisY}
        y2={axisY}
        stroke="var(--color-foreground)"
        strokeWidth={1}
      />

      {/* Histogram bars */}
      {bins.map((count, i) => {
        const x = marginLeft + i * (chartWidth / binCount) + barGap / 2;
        const y = toY(count, scaleMax);
        const h = axisY - y;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={Math.max(0, barWidth)}
            height={Math.max(0, h)}
            fill="var(--color-chart-2)"
            opacity={0.2}
          />
        );
      })}

      {/* Normal distribution curve */}
      {stdDev > 0 && curveCounts.length > 0 && (
        <polyline
          fill="none"
          stroke="var(--color-chart-4)"
          strokeWidth={1}
          opacity={0.9}
          points={curveCounts
            .map((count, i) => {
              const x = min + (span * i) / curvePoints;
              return `${toX(x)},${toY(count, scaleMax)}`;
            })
            .join(' ')}
        />
      )}

      {/* Sigma lines + labels */}
      {sigmaBands.map((band) => {
        const x = toX(mean + band.k * stdDev);
        const clampedX = Math.min(width - marginRight - 2, Math.max(marginLeft + 2, x));
        const yTop = marginTop + 2;
        return (
          <g key={band.k}>
            <line
              x1={x}
              x2={x}
              y1={marginTop}
              y2={marginTop + chartHeight}
              stroke={band.color}
              strokeWidth={1}
              opacity={band.k === 0 ? 0.85 : 0.6}
              strokeDasharray={band.k === 0 ? undefined : '3 3'}
            />
            {band.label && (
              <text
                x={clampedX}
                y={yTop}
                fill="var(--color-muted-foreground)"
                opacity={0.8}
                fontSize={8}
                textAnchor="start"
              >
                {band.label}
              </text>
            )}
          </g>
        );
      })}

      {/* X-axis ticks: aligned to μ and σ lines */}
      {(() => {
        if (stdDev === 0) {
          const x = toX(mean);
          return (
            <g key="mu">
              <line
                x1={x}
                x2={x}
                y1={axisY}
                y2={axisY + 4}
                stroke="var(--color-foreground)"
                strokeWidth={1}
              />
              <text
                x={x}
                y={axisY + 18}
                fill="var(--color-muted-foreground)"
                opacity={0.95}
                fontSize={8}
                textAnchor="middle"
              >
                {formatMsOrSeconds(mean)}
              </text>
            </g>
          );
        }

        const ticks: Array<{ k: number }> = [
          { k: -3 },
          { k: -2 },
          { k: -1 },
          { k: 0 },
          { k: 1 },
          { k: 2 },
          { k: 3 },
        ];

        return ticks.map((t) => {
          const tickX = mean + t.k * stdDev;
          const x = toX(tickX);
          return (
            <g key={t.k}>
              <line
                x1={x}
                x2={x}
                y1={axisY}
                y2={axisY + 4}
                stroke="var(--color-foreground)"
                strokeWidth={1}
              />
              <text
                x={x}
                y={axisY + 18}
                fill="var(--color-foreground)"
                opacity={0.95}
                fontSize={8}
                textAnchor="middle"
              >
                {formatMsOrSeconds(tickX)}
              </text>
            </g>
          );
        });
      })()}
    </svg>
  );
}

