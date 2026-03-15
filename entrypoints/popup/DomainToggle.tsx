import { useEffect, useState } from 'react';
import './DomainToggle.css';
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
    <div className="domain-toggle">
      <label className="domain-toggle-row">
        <input
          type="checkbox"
          checked={!!enabled}
          disabled={isLoading || !url}
          onChange={handleToggle}
        />
        <span className="domain-toggle-label">Enable panel on this site</span>
      </label>
      <p className="domain-toggle-note">Toggles immediately for this tab and remembers this site.</p>
    </div>
  );
}

