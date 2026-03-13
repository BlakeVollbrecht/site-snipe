import { injectPanelAfter } from './InjectedPanelRoot';
import { setClickTargetResolver } from './clickScheduler';

let clickedElement: Element | null = null;
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

export function initSelection() {
  setClickTargetResolver(() => clickedElement);
}

export function armElementSelection() {
  function handleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    window.removeEventListener('click', handleClick, true);

    if (event.target instanceof Element) {
      clickedElement = event.target;
      const anchor = findRowAnchor(clickedElement);
      injectPanelAfter(anchor);
    }
  }

  window.addEventListener('click', handleClick, true);
}

export function highlightSelection() {
  if (!clickedElement) return;

  const el = clickedElement as HTMLElement;

  if (highlightTimeoutId !== null) {
    window.clearTimeout(highlightTimeoutId);
    highlightTimeoutId = null;
  }

  el.classList.remove('site-snipe-highlight-target');
  void el.offsetWidth;
  el.classList.add('site-snipe-highlight-target');

  highlightTimeoutId = window.setTimeout(() => {
    el.classList.remove('site-snipe-highlight-target');
    highlightTimeoutId = null;
  }, 1400);
}

