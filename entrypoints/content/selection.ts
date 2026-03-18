import { injectPanelAfter } from './InjectedPanelRoot';
import { setClickTargetResolver } from './clickScheduler';

let clickedElement: Element | null = null;
let highlightTimeoutId: number | null = null;
let selectionArmed = false;

type SelectionArmedListener = (armed: boolean) => void;
const selectionArmedListeners = new Set<SelectionArmedListener>();
let selectionClickHandler: ((event: MouseEvent) => void) | null = null;

let cursorBefore: string | null = null;

const HIGHLIGHT_CLASSES = [
  // Ring-based highlight avoids custom CSS and works on arbitrary DOM elements.
  'ring-2',
  // Use Tailwind's default shadcn-friendly orange for selection feedback.
  'ring-orange-400/80',
  'ring-offset-2',
  'ring-offset-transparent',
  // Outline adds a stronger edge on elements with dark backgrounds.
  'outline',
  'outline-2',
  'outline-orange-400/50',
  'outline-offset-2',
];

function applyHighlight(el: HTMLElement) {
  for (const cls of HIGHLIGHT_CLASSES) el.classList.remove(cls);
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

export function isSelectionArmed() {
  return selectionArmed;
}

export function subscribeSelectionArmed(listener: SelectionArmedListener) {
  selectionArmedListeners.add(listener);
  listener(selectionArmed);
  return () => {
    selectionArmedListeners.delete(listener);
  };
}

function applySelectionArmed(next: boolean) {
  if (selectionArmed === next) return;
  selectionArmed = next;

  // Notify React subscribers.
  for (const l of selectionArmedListeners) l(selectionArmed);

  // Give the user a strong cursor affordance in selection mode.
  if (typeof document === 'undefined' || !document.body) return;
  if (selectionArmed) {
    if (cursorBefore === null) cursorBefore = document.body.style.cursor;
    document.body.style.cursor = 'crosshair';
  } else if (cursorBefore !== null) {
    document.body.style.cursor = cursorBefore;
    cursorBefore = null;
  } else {
    document.body.style.cursor = '';
  }
}

export function disarmElementSelection() {
  if (!selectionArmed) return;
  if (selectionClickHandler) {
    window.removeEventListener('click', selectionClickHandler, true);
  }
  selectionClickHandler = null;
  applySelectionArmed(false);
}

export function armElementSelection() {
  if (selectionArmed) return;

  selectionClickHandler = function handleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (selectionClickHandler) {
      window.removeEventListener('click', selectionClickHandler, true);
    }

    if (event.target instanceof Element) {
      clickedElement = event.target;
      // Selecting an element should visually highlight it the same way as
      // the explicit "Highlight selected element" button.
      highlightSelection();
      const anchor = findRowAnchor(clickedElement);
      injectPanelAfter(anchor);
    }

    // Exit selection mode after the user chooses their target.
    selectionClickHandler = null;
    applySelectionArmed(false);
  }

  window.addEventListener('click', selectionClickHandler, true);
  applySelectionArmed(true);
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

