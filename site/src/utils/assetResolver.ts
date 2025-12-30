import { useEffect, useState } from 'react';

const assetResolutionCache = new Map<string, string>();

async function headRequest(url: string) {
  try {
    const response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (response.ok) {
      return true;
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.debug('[assetResolver] HEAD request failed for', url, error);
    }
  }
  return false;
}

export async function resolveAsset(localPath?: string, fallbackPath?: string): Promise<string> {
  const fallback = fallbackPath ?? '';

  if (typeof window === 'undefined') {
    return localPath ?? fallback;
  }

  if (!localPath) {
    return fallback;
  }

  const cacheKey = `${localPath}|${fallback}`;
  if (assetResolutionCache.has(cacheKey)) {
    return assetResolutionCache.get(cacheKey)!;
  }

  const resolved = (await headRequest(localPath)) ? localPath : fallback;
  assetResolutionCache.set(cacheKey, resolved);
  return resolved;
}

export function useResolvedAsset(localPath?: string, fallbackPath?: string): string {
  const fallback = fallbackPath ?? '';
  const [resolved, setResolved] = useState<string>(fallback);

  useEffect(() => {
    let cancelled = false;

    resolveAsset(localPath, fallback).then((result) => {
      if (!cancelled && result) {
        setResolved(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [localPath, fallback]);

  return resolved;
}

