"use client";

import { useEffect } from "react";
import { sendTrack } from "./track";

/** Registra una visita alla pagina prodotto (una volta per sessione del browser). */
export function TrackView({ productId }: { productId: string }) {
  useEffect(() => {
    const key = `viewed:${productId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage non disponibile: registra comunque.
    }
    sendTrack({ type: "view", productId });
  }, [productId]);
  return null;
}
