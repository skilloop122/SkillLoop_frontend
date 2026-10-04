"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNow } from "./useNow";
import { useAuthStore } from "./authStore";
import { useRequestStore } from "./requestStore";

export const SESSION_DURATION_MS = 15 * 60 * 1000;
export const POLL_INTERVAL_MS = 20 * 1000;
export const COMPLETE_GRACE_MS = 0;

export type LifecycleSession = {
  id: string;
  session?: {
    id?: string;
    status?: string;
    scheduledAt?: string;
  } | null;
};

function endsAt(scheduledAt?: string) {
  const start = scheduledAt ? Date.parse(scheduledAt) : NaN;
  return Number.isNaN(start) ? NaN : start + SESSION_DURATION_MS;
}

function isCompleted(session?: { status?: string } | null) {
  return session?.status?.toLowerCase() === "completed";
}

type Options = {
  sessions: LifecycleSession[];
  onSessionCompleted?: (sessionId: string) => void;
};

/**
 * Keeps a 15-minute session clock reconciled with the backend.
 *
 * The backend owns the truth: its worker flips session.status to COMPLETED once
 * the window expires. This hook watches for that transition and, if the worker
 * never runs, completes the session itself after a grace period.
 */
export function useSessionLifecycle({
  sessions,
  onSessionCompleted,
}: Options) {
  const now = useNow();
  const ready = now > 0;
  const token = useAuthStore((state) => state.token);
  const fetchRequestById = useRequestStore((state) => state.fetchRequestById);
  const completeSession = useRequestStore((state) => state.completeSession);

  const doneRef = useRef<Set<string>>(new Set());
  const fallbackAttemptedRef = useRef<Set<string>>(new Set());

  const onCompletedRef = useRef(onSessionCompleted);
  useEffect(() => {
    onCompletedRef.current = onSessionCompleted;
  }, [onSessionCompleted]);

  // `sessions` is rebuilt every render by the page, so depend on a stable
  // signature of the tracked ids instead of the array identity.
  const trackKey = useMemo(
    () =>
      sessions
        .map((item) => `${item.id}:${isCompleted(item.session) ? 1 : 0}`)
        .sort()
        .join("|"),
    [sessions],
  );

  const tracked = useMemo(
    () =>
      sessions.filter(
        (item) => Boolean(item.session?.scheduledAt) && !isCompleted(item.session),
      ),
    [sessions],
  );

  const markCompleted = useCallback((requestId: string) => {
    if (doneRef.current.has(requestId)) return;
    doneRef.current.add(requestId);
    fallbackAttemptedRef.current.delete(requestId);
    onCompletedRef.current?.(requestId);
  }, []);

  const poll = useCallback(
    async (item: LifecycleSession, currentTime: number) => {
      if (doneRef.current.has(item.id)) return;
      // No point spending requests while the tab is in the background.
      if (document.hidden) return;

      const end = endsAt(item.session?.scheduledAt);
      const remaining = end - currentTime;

      // Outside the 15-minute window there is nothing to reconcile, and polling
      // anyway would hit the API every 20s for a session that may be days away.
      if (Number.isNaN(end) || remaining > SESSION_DURATION_MS) return;

      if (
        !Number.isNaN(end) &&
        remaining <= -COMPLETE_GRACE_MS &&
        item.session?.id &&
        !fallbackAttemptedRef.current.has(item.id)
      ) {
        // The worker did not expire this session, so finish it here. Waiting out
        // the grace period absorbs worker lag and stops clock skew from cutting a
        // live session short.
        fallbackAttemptedRef.current.add(item.id);
        const result = await completeSession(item.session.id, "completed");
        if (result.success) markCompleted(item.id);
        else fallbackAttemptedRef.current.delete(item.id);
        return;
      }

      const result = await fetchRequestById(item.id);
      if (!result.success || !result.data) return;
      if (isCompleted(result.data.session)) markCompleted(item.id);
    },
    [completeSession, fetchRequestById, markCompleted],
  );

  useEffect(() => {
    if (!token || !ready || tracked.length === 0) return;

    const active = tracked;
    const tick = () => {
      const current = Date.now();
      active.forEach((item) => void poll(item, current));
    };

    tick();
    const interval = window.setInterval(tick, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", tick);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
    // trackKey stands in for the tracked set so this does not re-run per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, ready, trackKey, poll]);

  return { now };
}