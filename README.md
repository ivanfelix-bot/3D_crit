# 3D Crit

Sito vetrina/catalogo del brand di stampa 3D **3D Crit** (italiano + inglese), con pannello admin e pagamenti (Fase 2) già predisposti.

- **Stack:** Next.js 16 (App Router, TypeScript, Tailwind CSS 4) · Supabase (Postgres + Auth + Storage, con Row Level Security) · Vercel
- **Guida d'uso in italiano:** [GUIDA.md](./GUIDA.md)

## Sviluppo locale

```bash
cp .env.example .env.local   # inserisci URL e anon key di Supabase
npm install
npm run dev                  # http://localhost:3000
```

## Struttura

| Percorso | Contenuto |
| --- | --- |
| `src/app/[locale]/` | Pagine pubbliche (`/it/…`, `/en/…`) |
| `src/app/admin/` | Pannello admin (login, dashboard, prodotti, categorie, ordini, impostazioni) |
| `src/app/api/` | Statistiche anonime, checkout e webhook (Fase 2) |
| `src/lib/i18n/` | Testi del sito in italiano e inglese |
| `src/proxy.ts` | Redirect lingua e protezione `/admin` |
| `supabase/` | Schema del database, policy di sicurezza e dati demo |
