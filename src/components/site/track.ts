"use client";

/** Invia un evento statistico anonimo (nessun cookie, nessun dato personale). */
export function sendTrack(payload: { type: "view" | "click"; productId: string; marketplace?: string }) {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
    }
  } catch {
    // Le statistiche non devono mai bloccare la navigazione.
  }
}
