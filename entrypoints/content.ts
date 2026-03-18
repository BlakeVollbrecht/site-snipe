import { injectPanelAfter, removePanel } from './content/InjectedPanelRoot';
import { disarmElementSelection, initSelection } from './content/selection';
import { isDomainEnabled } from './content/domainSettings';

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    initSelection();

    (async () => {
      const url = window.location.href;

      const enabled = await isDomainEnabled(url);
      if (enabled) {
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
      }
    })();

    browser.runtime.onMessage.addListener((message) => {
      if (message?.type === 'site-snipe:set-enabled-for-domain') {
        const enabled = !!message.enabled;
        if (enabled) {
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
        } else {
          disarmElementSelection();
          removePanel();
        }
      }
    });
  },
});
