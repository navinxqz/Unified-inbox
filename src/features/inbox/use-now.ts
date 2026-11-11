"use client";

import { useSyncExternalStore } from "react";

/**
 * Live clock for relative timestamps, shared across every subscriber.
 * Returns `null` until the client clock is readable, so render stays pure
 * and server-rendered markup matches the first client render.
 */

let currentNow = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function tick() {
  currentNow = Date.now();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  if (currentNow === 0) currentNow = Date.now();
  listeners.add(listener);
  if (timer === null) {
    timer = setInterval(tick, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function useNowMs(): number | null {
  const now = useSyncExternalStore(
    subscribe,
    () => currentNow,
    () => 0,
  );
  return now === 0 ? null : now;
}
