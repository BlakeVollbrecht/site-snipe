import { injectPanelAfter } from './content/InjectedPanelRoot';
import { disarmClickTimer, scheduleClickAt, setClickTargetResolver } from './content/clickScheduler';

let clickedElement: Element | null = null;
let currentAnchorElement: Element | null = null;
let highlightTimeoutId: number | null = null;

function findRowAnchor(element: Element): Element {
  let current: HTMLElement | null = element as HTMLElement;
  const pageWidth = document.documentElement.clientWidth || window.innerWidth;

  while (current && current !== document.body) {
    const rect = current.getBoundingClientRect();
    const style = window.getComputedStyle(current);

    const isRowLikeDisplay = ['block', 'flex', 'grid', 'table', 'list-item'].includes(
      style.display,
    );
    const isWideEnough = rect.width >= pageWidth * 0.6;

    if (isRowLikeDisplay && isWideEnough) {
      return current;
    }

    current = current.parentElement;
  }

  return element;
}

function armElementSelection() {
  function handleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    window.removeEventListener('click', handleClick, true);

    if (event.target instanceof Element) {
      clickedElement = event.target;
      const anchor = findRowAnchor(clickedElement);
      currentAnchorElement = anchor;
      injectPanelAfter(anchor);
    }
  }

  window.addEventListener('click', handleClick, true);
}

export default defineContentScript({
  matches: ['*://*.spellionaire.com/*'],
  main() {
    setClickTargetResolver(() => clickedElement);

    browser.runtime.onMessage.addListener((message) => {
      if (message?.type === 'arm-element-selection') {
        armElementSelection();
      }

      if (message?.type === 'highlight-selected-element') {
        const target = clickedElement;
        if (!target) return;

        const el = target as HTMLElement;

        if (highlightTimeoutId !== null) {
          window.clearTimeout(highlightTimeoutId);
          highlightTimeoutId = null;
        }

        // Restart animation if the class was already there
        el.classList.remove('site-snipe-highlight-target');
        // Force reflow to allow the animation to retrigger
        void el.offsetWidth;
        el.classList.add('site-snipe-highlight-target');

        highlightTimeoutId = window.setTimeout(() => {
          el.classList.remove('site-snipe-highlight-target');
          highlightTimeoutId = null;
        }, 1400);
      }
    });

    if (!clickedElement) {
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
  },
});
