import { useEffect, useState } from 'react';
import { isDomainEnabled, setDomainEnabled } from '../content/domainSettings';

export function DomainToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [tabId, setTabId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.url || tab.id == null) {
        setEnabled(false);
        return;
      }

      setUrl(tab.url);
      setTabId(tab.id);
      const initial = await isDomainEnabled(tab.url);
      setEnabled(initial);
    })();
  }, []);

  const handleToggle = async () => {
    if (!url || enabled === null || tabId == null) return;
    const next = !enabled;
    await setDomainEnabled(url, next);
    await browser.tabs.sendMessage(tabId, {
      type: 'site-snipe:set-enabled-for-domain',
      enabled: next,
    });
    setEnabled(next);
  };

  const isLoading = enabled === null;

  return (
    <div className="space-y-2 text-left">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!enabled}
          disabled={isLoading || !url}
          onChange={handleToggle}
          className="h-4 w-4 rounded border-input accent-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <span className="select-none">Enable panel on this site</span>
      </label>
      <p className="text-xs text-muted-foreground">
        Toggles immediately for this tab and remembers this site.
      </p>
    </div>
  );
}

