import { injectPanelAfter } from './content/InjectedPanelRoot';
import { initSelection } from './content/selection';

export default defineContentScript({
  matches: ['*://*.spellionaire.com/*'],
  main() {
    initSelection();

    if (document.readyState === 'loading') {
      window.addEventListener(
        'DOMContentLoaded',
        () => {
          injectPanelAfter(null);
        },
        { once: true },
      );
    } else {
      injectPanelAfter(null);
    }
  },
});
