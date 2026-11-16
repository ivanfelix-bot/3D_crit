"use client";

import { useEffect } from "react";
import { cart } from "./store";

/** Svuota il carrello dopo un pagamento andato a buon fine. */
export function ClearCart() {
  useEffect(() => cart.clear(), []);
  return null;
}
