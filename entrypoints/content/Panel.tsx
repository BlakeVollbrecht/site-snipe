import { SelectionControls } from './SelectionControls';
import { Schedule } from './Schedule';
import { Latency } from './Latency.tsx';

export function Panel() {
  return (
    <div className="w-full max-w-3xl mx-auto bg-card/95 text-card-foreground border border-border rounded-lg shadow-sm p-3">
      <SelectionControls />
      <Schedule />
      <Latency />
    </div>
  );
}

