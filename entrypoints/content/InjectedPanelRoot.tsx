import React from 'react';
import ReactDOM from 'react-dom/client';
import { Panel } from './Panel';

let currentPanelContainer: HTMLElement | null = null;

export function injectPanelAfter(anchor: Element) {
  if (currentPanelContainer) {
    currentPanelContainer.remove();
    currentPanelContainer = null;
  }

  const container = document.createElement('div');
  anchor.insertAdjacentElement('afterend', container);
  currentPanelContainer = container;

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <Panel />
    </React.StrictMode>,
  );
}

