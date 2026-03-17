const LATENCY_URL = import.meta.env.VITE_LATENCY_URL as string | undefined;

export type LatencyStats = {
  meanOffset: number;
  stdDev: number;
  lead2sigma: number;
  lead3sigma: number;
};

export async function calibrateWithMyCloudFunction(samples = 200): Promise<LatencyStats> {
  if (!LATENCY_URL) {
    throw new Error('LATENCY_URL is not configured');
  }

  const offsets: number[] = [];

  for (let i = 0; i < samples; i++) {
    const res = await fetch(LATENCY_URL, {
      method: 'GET',
      cache: 'no-store',
    });

    if (i === 0) {
        continue; // throw away the first sample since server may be waking up
    }

    const data = await res.json();
    const serverMs = new Date(data.serverReceiveTime).getTime();
    const localMs = Date.now();

    const offsetMs = serverMs - localMs;

    offsets.push(offsetMs);
    await new Promise((r) => setTimeout(r, 10));
  }

  const mean = offsets.reduce((a, b) => a + b, 0) / offsets.length;
  const variance =
    offsets.reduce((sq, n) => sq + (n - mean) ** 2, 0) / (offsets.length - 1 || 1);
  const stdDev = Math.sqrt(variance);

  return {
    meanOffset: Math.round(mean),
    stdDev: Math.round(stdDev),
    lead2sigma: Math.round(mean + 2 * stdDev),
    lead3sigma: Math.round(mean + 3 * stdDev),
  };
}