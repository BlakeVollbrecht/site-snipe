import './App.css';
import { DomainToggle } from './DomainToggle';

function App() {
  return (
    <div className="card">
      <h1>Site Snipe</h1>
      <p>Use the in-page panel to select and schedule clicks.</p>
      <DomainToggle />
    </div>
  );
}

export default App;
