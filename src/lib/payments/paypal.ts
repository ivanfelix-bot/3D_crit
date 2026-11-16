import "server-only";

/**
 * FASE 2 – PayPal tramite API REST (Orders v2), senza SDK aggiuntivi.
 * PAYPAL_ENV = "live" per i pagamenti veri, altrimenti usa la sandbox di test.
 */
function baseUrl() {
  return process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

async function accessToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Credenziali PayPal non configurate");
  const res = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal token ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function paypalRequest<T>(path: string, init: { method: string; body?: unknown }): Promise<T> {
  const token = await accessToken();
  const res = await fetch(`${baseUrl()}${path}`, {
    method: init.method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) throw new Error(`PayPal ${path} ${res.status} ${JSON.stringify(data)}`);
  return data;
}

export const cents = (c: number) => (c / 100).toFixed(2);
