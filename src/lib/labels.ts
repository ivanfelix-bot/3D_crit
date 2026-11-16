import type { OrderStatus, ProductStatus } from "./types";

/** Etichette in italiano usate nell'admin. */
export const STATUS_LABELS: Record<ProductStatus, string> = {
  available: "Disponibile",
  made_to_order: "Su ordinazione",
  out_of_stock: "Esaurito",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "In attesa",
  paid: "Pagato",
  shipped: "Spedito",
  cancelled: "Annullato",
  refunded: "Rimborsato",
};
