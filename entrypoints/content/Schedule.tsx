import { useState } from 'react';
import './Schedule.css';
import { disarmClickTimer, scheduleClickAt} from './clickScheduler';

export function Schedule() {
  const [time, setTime] = useState('');
  const [leadMs, setLeadMs] = useState('0');
  const [scheduled, setScheduled] = useState(false);
  const [lastClickIso, setLastClickIso] = useState<string | null>(null);

  const handleSchedule = () => {
    if (!time) return;

    const parsedLead = Number(leadMs);
    const safeLead = Number.isFinite(parsedLead) && parsedLead >= 0 ? parsedLead : 0;

    scheduleClickAt(time, safeLead, (actualTimeIso) => {
      setScheduled(false);
      setLastClickIso(actualTimeIso);
    });
    setScheduled(true);
  };

  const handleCancel = () => {
    disarmClickTimer();
    setScheduled(false);
  };

  if (scheduled) {
    return (
      <div className="site-snipe-schedule site-snipe-schedule--armed">
        <div className="site-snipe-schedule-summary">
          Drop time {time} with lead {leadMs} ms
        </div>
        <button className="site-snipe-schedule-button" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="site-snipe-schedule">
        <label className="site-snipe-schedule-label">
          Drop time
          <input
            className="site-snipe-schedule-time-input"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
        </label>
        <label className="site-snipe-schedule-label">
          Lead time (ms)
          <input
            className="site-snipe-schedule-time-input"
            type="number"
            min="0"
            value={leadMs}
            onChange={(event) => setLeadMs(event.target.value)}
          />
        </label>
        <button
          className="site-snipe-schedule-button"
          onClick={handleSchedule}
          disabled={!time}
        >
          Schedule
        </button>
      </div>
      {lastClickIso && (
        <div>
          <p className="site-snipe-schedule-note">
            Last click at {lastClickIso}
          </p>
        </div>
      )}
    </div>
  );
}

