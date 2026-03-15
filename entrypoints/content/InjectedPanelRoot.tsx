import React from 'react';
import ReactDOM from 'react-dom/client';
import { Panel } from './Panel';

let currentPanelContainer: HTMLElement | null = null;

export function injectPanelAfter(anchor: Element | null) {
  if (currentPanelContainer) {
    currentPanelContainer.remove();
    currentPanelContainer = null;
  }

  const container = document.createElement('div');

  if (anchor) {
    anchor.insertAdjacentElement('afterend', container);
  } else {
    document.body.prepend(container);
  }

  currentPanelContainer = container;

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <Panel />
    </React.StrictMode>,
  );
}

export function removePanel() {
  if (currentPanelContainer) {
    currentPanelContainer.remove();
    currentPanelContainer = null;
  }
}

