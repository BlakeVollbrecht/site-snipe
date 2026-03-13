import { injectPanel } from './content/InjectedPanelRoot';

export default defineContentScript({
  matches: ['*://*.spellionaire.com/*'],
  main() {
    injectPanel();
  },
});
