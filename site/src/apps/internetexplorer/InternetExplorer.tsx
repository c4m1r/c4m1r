import { useMemo, useState } from 'react';

interface AllowedSite {
  label: string;
  url: string;
  description?: string;
}

const allowedSites: AllowedSite[] = [
  {
    label: 'MSN',
    url: 'https://www.msn.com/en-us',
    description: 'Microsoft Network portal',
  },
  {
    label: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Main_Page',
    description: 'Free encyclopedia',
  },
  {
    label: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/',
    description: 'Developer documentation',
  },
  {
    label: 'Archive.org',
    url: 'https://archive.org/',
    description: 'Digital library',
  },
];

export function InternetExplorer() {
  const defaultUrl = allowedSites[0]?.url ?? 'https://www.msn.com/en-us';
  const [currentUrl, setCurrentUrl] = useState(defaultUrl);
  const [addressBarValue, setAddressBarValue] = useState(defaultUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<string[]>([defaultUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  const currentSite = useMemo(() => {
    return allowedSites.find((site) => currentUrl.startsWith(site.url));
  }, [currentUrl]);

  const navigateTo = (url: string, pushHistory = true) => {
    setIsLoading(true);
    setCurrentUrl(url);
    setAddressBarValue(url);

    if (pushHistory) {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(url);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = addressBarValue.trim();
    if (!trimmed) return;

    const matchedSite =
      allowedSites.find((site) => site.url === trimmed) ??
      allowedSites.find((site) => trimmed.startsWith(site.url));

    if (matchedSite) {
      navigateTo(matchedSite.url);
      return;
    }

    // Fallback: treat as search query using MSN
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`;
    navigateTo(searchUrl);
  };

  const goBack = () => {
    if (!canGoBack) return;
    const target = history[historyIndex - 1];
    setHistoryIndex(historyIndex - 1);
    navigateTo(target, false);
  };

  const goForward = () => {
    if (!canGoForward) return;
    const target = history[historyIndex + 1];
    setHistoryIndex(historyIndex + 1);
    navigateTo(target, false);
  };

  return (
    <div className="flex h-full w-full flex-col bg-white text-xs font-tahoma select-none">
      <header className="flex flex-col border-b border-[#9eb7d3] bg-[#d6e5f6]">
        <div className="flex items-center gap-1 px-2 py-1 border-b border-[#b9cde3]">
          <button
            className="px-2 py-1 text-[11px] bg-white border border-[#7f9db9] rounded disabled:opacity-40"
            onClick={goBack}
            disabled={!canGoBack}
          >
            Back
          </button>
          <button
            className="px-2 py-1 text-[11px] bg-white border border-[#7f9db9] rounded disabled:opacity-40"
            onClick={goForward}
            disabled={!canGoForward}
          >
            Forward
          </button>
          <button
            className="px-2 py-1 text-[11px] bg-white border border-[#7f9db9] rounded"
            onClick={() => navigateTo(defaultUrl)}
          >
            Home
          </button>
          <button
            className="px-2 py-1 text-[11px] bg-white border border-[#7f9db9] rounded"
            onClick={() => navigateTo(currentUrl, false)}
          >
            Refresh
          </button>
          <div className="flex-1" />
          {isLoading && (
            <span className="text-[#1a4fa3] text-[11px] italic pr-2">Opening page...</span>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-2 py-1 bg-[#eef5ff]"
        >
          <label className="text-[#1a4fa3] text-[11px] font-semibold">Address</label>
          <div className="flex items-center border border-[#7f9db9] bg-white flex-1 h-6 px-1">
            <input
              value={addressBarValue}
              onChange={(event) => setAddressBarValue(event.target.value)}
              className="flex-1 text-xs outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1 bg-[#1a4fa3] text-white text-[11px] rounded border border-[#0c2f6d]"
          >
            Go
          </button>
        </form>
      </header>

      <div className="flex border-b border-[#d3dae6] bg-[#f3f6fb] px-3 py-2 text-[11px] text-[#1a4fa3] items-center gap-4">
        <div className="flex flex-col">
          <span className="font-semibold">{currentSite?.label ?? 'Browsing the web'}</span>
          <span className="text-[#4f6d9b]">{currentSite?.description ?? currentUrl}</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label className="font-semibold">Favorites:</label>
          <select
            className="border border-[#7f9db9] bg-white px-1 py-0.5 text-[11px]"
            value={currentSite?.url ?? ''}
            onChange={(event) => {
              const selected = allowedSites.find((site) => site.url === event.target.value);
              if (selected) {
                navigateTo(selected.url);
              }
            }}
          >
            {allowedSites.map((site) => (
              <option key={site.url} value={site.url}>
                {site.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 bg-white relative">
        <iframe
          key={currentUrl}
          src={currentUrl}
          title="Internet Explorer"
          className="w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-pointer-lock allow-downloads"
        />
        {!isLoading ? null : (
          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center text-[#1a4fa3] gap-2 text-sm">
            <div className="w-10 h-10 border-4 border-[#1a4fa3] border-t-transparent rounded-full animate-spin" />
            Opening page...
          </div>
        )}
      </div>

      <footer className="flex items-center justify-between border-t border-[#9eb7d3] bg-[#e4ecf6] px-3 py-1 text-[11px] text-[#1a4fa3]">
        <span>Done</span>
        <span>{currentUrl}</span>
      </footer>
    </div>
  );
}

