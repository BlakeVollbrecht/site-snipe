import { useState } from 'react';
import { disarmClickTimer, scheduleClickAt } from './clickScheduler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isElementSelected } from './selection';

export function Schedule() {
  const [time, setTime] = useState('');
  const [leadMs, setLeadMs] = useState('0');
  const [scheduled, setScheduled] = useState(false);
  const [lastClickIso, setLastClickIso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSchedule = () => {
    if (!time) return;

    setError(null);

    const parsedLead = Number(leadMs);
    const safeLead = Number.isFinite(parsedLead) && parsedLead >= 0 ? parsedLead : 0;

    if (!isElementSelected()) {
      setError('Select an element on the page before scheduling a click.');
      return;
    }

    const ok = scheduleClickAt(time, safeLead, (actualTimeIso) => {
      setScheduled(false);
      setLastClickIso(actualTimeIso);
    });
    if (!ok) {
      setError('Select an element on the page before scheduling a click.');
      return;
    }

    setScheduled(true);
  };

  const handleCancel = () => {
    disarmClickTimer();
    setScheduled(false);
    setError(null);
  };

  if (scheduled) {
    return (
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">
          Drop time {time} with lead {leadMs} ms
        </div>
        <Button size="sm" variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Drop time</span>
          <Input
            className="h-9 text-sm"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Lead (ms)</span>
          <Input
            className="h-9 text-sm"
            type="number"
            min="0"
            value={leadMs}
            onChange={(event) => setLeadMs(event.target.value)}
          />
        </label>
        <Button size="lg" onClick={handleSchedule} disabled={!time}>
          Schedule
        </Button>
      </div>
      {error && <div className="text-xs text-destructive">{error}</div>}
      {lastClickIso && (
        <div className="text-xs text-muted-foreground">
          Last click at {lastClickIso}
        </div>
      )}
    </div>
  );
}

