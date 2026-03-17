import './Panel.css';
import { SelectionControls } from './SelectionControls';
import { Schedule } from './Schedule';
import { Latency } from './Latency.tsx';

export function Panel() {
  return (
    <div className="site-snipe-panel">
      <SelectionControls />
      <Schedule />
      <Latency />
    </div>
  );
}

