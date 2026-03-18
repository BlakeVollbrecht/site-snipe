import { DomainToggle } from './DomainToggle';

function App() {
  return (
    <div className="w-[320px] p-4 text-center">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Site Snipe</h1>
        <p className="text-sm text-muted-foreground">
          Use the in-page panel to select and schedule clicks.
        </p>
      </header>

      <div className="mt-3">
        <DomainToggle />
      </div>
    </div>
  );
}

export default App;
