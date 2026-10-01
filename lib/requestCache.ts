const inFlight = new Map<string, Promise<unknown>>();

function cloneIfResponse<T>(value: T): T {
  return value instanceof Response ? (value.clone() as T) : value;
}

export function dedupFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = inFlight.get(key);
  if (cached) {
    return (cached as Promise<T>).then(cloneIfResponse);
  }

  const promise = fetcher();
  inFlight.set(key, promise);

  // The stored promise is never handed to a caller and never read, so the raw
  // body stays pristine and can be cloned once per consumer. Cloning a body
  // that another caller already consumed throws "Response body is already
  // used", which is why the raw instance is deliberately never returned.
  const cleanup = () => {
    if (inFlight.get(key) === promise) inFlight.delete(key);
  };
  promise.then(cleanup, cleanup);

  return promise.then(cloneIfResponse);
}
