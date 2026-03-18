import { injectPanelAfter } from './InjectedPanelRoot';
import { setClickTargetResolver } from './clickScheduler';

let clickedElement: Element | null = null;
let highlightTimeoutId: number | null = null;

const HIGHLIGHT_CLASSES = [
  // Ring-based highlight avoids custom CSS and works on arbitrary DOM elements.
  'ring-2',
  'ring-orange-400',
  'ring-offset-2',
  'ring-offset-transparent',
  'animate-pulse',
];

function applyHighlight(el: HTMLElement) {
  for (const cls of HIGHLIGHT_CLASSES) el.classList.remove(cls);
  void el.offsetWidth; // restart the animation by forcing reflow
  for (const cls of HIGHLIGHT_CLASSES) el.classList.add(cls);
}

function clearHighlight(el: HTMLElement) {
  for (const cls of HIGHLIGHT_CLASSES) el.classList.remove(cls);
}

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

export function isElementSelected() {
  return clickedElement !== null;
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

  applyHighlight(el);

  highlightTimeoutId = window.setTimeout(() => {
    clearHighlight(el);
    highlightTimeoutId = null;
  }, 1400);
}

