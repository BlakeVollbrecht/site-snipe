import React from 'react';
import ReactDOM from 'react-dom/client';
import { Panel } from './Panel';
import { disarmClickTimer } from './clickScheduler';
import '../../assets/tailwind.css';

let currentPanelContainer: HTMLElement | null = null;
let currentPanelRoot: ReactDOM.Root | null = null;

export function injectPanelAfter(anchor: Element | null) {
  // Create the React root once; later calls only *move* the DOM node.
  if (!currentPanelContainer) {
    currentPanelContainer = document.createElement('div');
    currentPanelRoot = ReactDOM.createRoot(currentPanelContainer);
    currentPanelRoot.render(
      <React.StrictMode>
        <Panel />
      </React.StrictMode>,
    );
  }

  // If the anchor is inside the panel we’re trying to move, inserting the
  // panel relative to that descendant would throw a DOM hierarchy error.
  if (anchor && currentPanelContainer.contains(anchor)) {
    document.body.prepend(currentPanelContainer);
    return;
  }

  if (anchor) anchor.insertAdjacentElement('afterend', currentPanelContainer);
  else document.body.prepend(currentPanelContainer);
}

export function removePanel() {
  disarmClickTimer();
  currentPanelRoot?.unmount();
  currentPanelRoot = null;
  currentPanelContainer?.remove();
  currentPanelContainer = null;
}

