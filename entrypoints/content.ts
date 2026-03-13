import { injectPanelAfter } from './content/InjectedPanelRoot';

let selectedElement: Element | null = null;
let currentAnchorElement: Element | null = null;

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
      selectedElement = event.target;
      const anchor = findRowAnchor(selectedElement);
      currentAnchorElement = anchor;
      injectPanelAfter(anchor);
    }
  }

  window.addEventListener('click', handleClick, true);
}

export default defineContentScript({
  matches: ['*://*.spellionaire.com/*'],
  main() {
    browser.runtime.onMessage.addListener((message) => {
      if (message?.type === 'arm-element-selection') {
        armElementSelection();
      }
    });
  },
});
