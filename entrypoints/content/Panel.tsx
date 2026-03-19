import { useEffect, useState } from 'react';
import { SelectionControls } from './SelectionControls';
import { Schedule } from './Schedule';
import { Latency } from './Latency.tsx';
import { subscribeSelectionArmed } from './selection';

export function Panel() {
  const [selectionArmed, setSelectionArmed] = useState(false);

  useEffect(() => {
    return subscribeSelectionArmed(setSelectionArmed);
  }, []);

  return (
    <div
      className={[
        'relative w-full max-w-4xl mx-auto text-card-foreground rounded-lg shadow-sm p-3',
        'border border-border bg-card/95',
        selectionArmed
          ? 'border-orange-400/70 bg-card/80 ring-2 ring-orange-400/40'
          : '',
      ].join(' ')}
    >
      {selectionArmed && (
        <div className="absolute inset-0 rounded-lg bg-orange-400/10 backdrop-blur-sm pointer-events-none" />
      )}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="space-y-2">
            <SelectionControls />
            <Schedule />
          </div>
          <div className="space-y-2">
            <Latency />
          </div>
        </div>
      </div>
    </div>
  );
}

