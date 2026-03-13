import { useState } from 'react';
import './Schedule.css';
import { disarmClickTimer, scheduleClickAt } from './clickScheduler';

export function Schedule() {
  const [time, setTime] = useState('');
  const [scheduled, setScheduled] = useState(false);

  const handleSchedule = () => {
    if (!time) return;

    scheduleClickAt(time, () => {
      setScheduled(false);
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
          Click scheduled for <span className="site-snipe-schedule-time-value">{time}</span>
        </div>
        <button className="site-snipe-schedule-button" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="site-snipe-schedule">
      <label className="site-snipe-schedule-label">
        Click time
        <input
          className="site-snipe-schedule-time-input"
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
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
  );
}

