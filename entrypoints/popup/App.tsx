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

  return (
    <div className="card">
      <h1>Site Snipe</h1>
      <button onClick={armSelection}>Select element on page</button>
      <p>Click the button, then click any element in the page.</p>
    </div>
  );
}

export default App;
