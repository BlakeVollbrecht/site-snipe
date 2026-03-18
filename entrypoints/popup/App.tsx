import { DomainToggle } from './DomainToggle';

function App() {
  return (
    <div className="min-w-[320px] min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card text-card-foreground shadow-sm p-4 space-y-3 text-center">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Site Snipe</h1>
          <p className="text-sm text-muted-foreground">Use the in-page panel to select and schedule clicks.</p>
        </header>

        <DomainToggle />
      </div>
    </div>
  );
}

export default App;
