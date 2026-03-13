import './App.css';

function App() {
  const armSelection = async () => {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab?.id != null) {
      await browser.tabs.sendMessage(tab.id, {
        type: 'arm-element-selection',
      });
    }
  };

  const highlightSelection = async () => {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab?.id != null) {
      await browser.tabs.sendMessage(tab.id, {
        type: 'highlight-selected-element',
      });
    }
  };

  return (
    <div className="card">
      <h1>Site Snipe</h1>
      <button onClick={armSelection}>Select element on page</button>
      <button onClick={highlightSelection}>Highlight selected element</button>
      <p>Click “Select element on page”, then click any element, then “Highlight selected element”.</p>
    </div>
  );
}

export default App;
