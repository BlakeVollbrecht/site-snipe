import './App.css';
import { Button } from '@/components/ui/button';
import { DomainToggle } from './DomainToggle';

function App() {
  return (
    <div className="card">
      <h1>Site Snipe</h1>
      <p>Use the in-page panel to select and schedule clicks.</p>
      <div style={{ marginTop: 12 }}>
        <Button variant="secondary">Shadcn Button</Button>
      </div>
      <DomainToggle />
    </div>
  );
}

export default App;
