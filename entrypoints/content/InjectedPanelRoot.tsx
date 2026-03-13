import React from 'react';
import ReactDOM from 'react-dom/client';
import { Panel } from './Panel';

export function injectPanel() {
  const container = document.createElement('div');
  document.body.prepend(container);

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <Panel />
    </React.StrictMode>,
  );
}

