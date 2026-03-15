const STORAGE_KEY = 'siteSnipe.enabledDomains';

function getDomainKeyFromUrl(url: string): string | null {
  try {
    const { hostname } = new URL(url);
    return hostname.toLowerCase();
  } catch {
    return null;
  }
}

export async function isDomainEnabled(url: string): Promise<boolean> {
  const key = getDomainKeyFromUrl(url);
  if (!key) return false;

  const stored = await browser.storage.local.get(STORAGE_KEY);
  const map = (stored?.[STORAGE_KEY] ?? {}) as Record<string, boolean>;
  return !!map[key];
}

export async function setDomainEnabled(url: string, enabled: boolean): Promise<boolean> {
  const key = getDomainKeyFromUrl(url);
  if (!key) return false;

  const stored = await browser.storage.local.get(STORAGE_KEY);
  const map = (stored?.[STORAGE_KEY] ?? {}) as Record<string, boolean>;
  map[key] = enabled;
  await browser.storage.local.set({ [STORAGE_KEY]: map });
  return enabled;
}

