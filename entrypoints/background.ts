import { calibrateWithMyCloudFunction } from './content/latency';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  browser.runtime.onMessage.addListener((message) => {
    if (message?.type === 'site-snipe:get-latency-stats') {
      const samples =
        typeof message.samples === 'number' && Number.isFinite(message.samples)
          ? message.samples
          : 200;
      return calibrateWithMyCloudFunction(samples);
    }
  });
});
