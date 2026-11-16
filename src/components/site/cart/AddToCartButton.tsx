"use client";

import { useState } from "react";
import { cart, type CartItem } from "./store";

export function AddToCartButton({
  item,
  label,
  addedLabel,
  disabled,
}: {
  item: Omit<CartItem, "qty">;
  label: string;
  addedLabel: string;
  disabled?: boolean;
}) {
  const [added, setAdded] = useState(false);
  return (
    <button
      type="button"
      disabled={disabled}
      className="btn-primary w-full"
      onClick={() => {
        cart.add(item);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? addedLabel : label}
    </button>
  );
}
