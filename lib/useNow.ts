"use client";

import { useSyncExternalStore } from "react";

/**
 * A page-wide clock: one interval shared by every consumer, so N countdown cards
 * cost a single timer rather than N.
 *
 * Snapshot is cached in a module variable because useSyncExternalStore compares
 * successive getSnapshot results; returning Date.now() directly would yield a
 * new value on every call and spin the render loop.
 */
let timer: number | null = null;
let currentNow = 0;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (timer === null) {
    // Set currentNow immediately so the very first getSnapshot call after mount
    // returns a real timestamp — not 0 — without waiting a full second for the
    // first interval tick.
    currentNow = Date.now();
    // Notify all existing listeners so components that were already subscribed
    // (e.g. after a fast re-mount) re-render with the fresh timestamp.
    listeners.forEach((entry) => entry());
    timer = window.setInterval(() => {
      currentNow = Date.now();
      listeners.forEach((entry) => entry());
    }, 1000);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      window.clearInterval(timer);
      timer = null;
      // Reset so the next subscriber starts fresh.
      currentNow = 0;
    }
  };
}

const getSnapshot = () => currentNow;

/**
 * Zero on the server so the first client render matches the server HTML. Reading
 * the real clock during render would be a hydration mismatch.
 */
const getServerSnapshot = () => 0;

export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}