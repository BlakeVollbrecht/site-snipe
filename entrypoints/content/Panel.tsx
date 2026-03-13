import './Panel.css';
import { SelectionControls } from './SelectionControls';
import { Schedule } from './Schedule';

export function Panel() {
  return (
    <div className="site-snipe-panel">
      <SelectionControls />
      <Schedule />
    </div>
  );
}

