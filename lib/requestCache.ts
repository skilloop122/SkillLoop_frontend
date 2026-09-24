const inFlight = new Map<string, Promise<unknown>>();

export function dedupFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = inFlight.get(key) as Promise<T> | undefined;
  if (cached) return cached;
  const promise = fetcher().finally(() => {
    inFlight.delete(key);
  });
  inFlight.set(key, promise);
  return promise;
}
