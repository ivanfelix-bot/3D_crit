# Guida di 3D Crit

Questa guida spiega come usare e far crescere il sito, senza bisogno di programmare.

- **Sito:** `https://<tuo-progetto>.vercel.app` (poi il tuo dominio, es. `https://www.3dcrit.it`)
- **Pannello admin:** stesso indirizzo + `/admin` (es. `https://<tuo-progetto>.vercel.app/admin`)

---

## 1. Primo accesso all'admin

L'account admin è uno solo e non esiste una pagina di registrazione pubblica.

1. Apri [supabase.com/dashboard](https://supabase.com/dashboard) → il progetto **3d-crit** → **Authentication → Users**.
2. **Add user → Create new user**: inserisci la tua email e una password robusta, spunta **Auto Confirm User** e conferma.
3. Il **primo** utente creato diventa automaticamente l'admin. Qualsiasi altro utente creato dopo **non** ha alcun permesso.
4. Vai su `…/admin`, inserisci email e password. Fatto.

**Password dimenticata?** Supabase → Authentication → Users → clic sul tuo utente → *Send password recovery* oppure imposta una nuova password dal menu dell'utente.

**Sicurezza consigliata:** in Supabase → Authentication → Sign In / Providers → **Email**, disattiva *Allow new users to sign up*.
(Anche se rimanesse attivo, un nuovo utente non avrebbe accesso a nulla: i permessi sono controllati dal database.)

---

## 2. Aggiungere e gestire i prodotti

Tutto si fa da **Admin → Prodotti** (comodo anche dal telefono).

1. **+ Nuovo prodotto**.
2. **Foto:** tocca *Aggiungi* e scegli una o più foto (dal telefono puoi anche scattarle al momento). La prima è la copertina; usa ← → per riordinarle e ✕ per toglierle. Le foto vengono ridotte automaticamente, non serve ridimensionarle.
3. **Informazioni:** nome e descrizione in italiano (l'inglese è facoltativo: se lo lasci vuoto viene mostrato l'italiano), prezzo (es. `15,00`), categoria, materiale, dimensioni.
4. **Disponibilità:** stato (*Disponibile*, *Su ordinazione*, *Esaurito*), quantità in scorta, *In evidenza in home*, *Visibile sul sito*.
5. **Link marketplace:** incolla il link dell'annuncio su Vinted, eBay, Amazon o Wallapop. Sul sito appaiono **solo** i bottoni dei link che inserisci.
6. **Salva.** Il sito si aggiorna subito.

Nella lista prodotti puoi cambiare al volo lo **stato**, la **stella** (in evidenza) e **Online/Nascosto**.

**Prodotti demo:** i 4 prodotti con "[DEMO]" sono solo esempi. Eliminali tutti insieme da **Dashboard → Elimina prodotti demo**.

**Categorie:** *Admin → Categorie* per aggiungerle, rinominarle (IT/EN), cambiarne l'ordine o eliminarle.

**Contatti:** *Admin → Impostazioni* per email e profilo TikTok mostrati nel sito.

**Statistiche:** la *Dashboard* mostra numero di prodotti, visite alle pagine prodotto e click sui bottoni dei marketplace (7/30/90/365 giorni). Sono anonime: niente cookie, niente dati personali.

---

## 3. Come chiedermi modifiche in futuro

Apri una nuova sessione di Claude Code sul repository GitHub del sito e scrivi la richiesta in italiano, in modo concreto. Esempi:

- "Cambia il testo della home: il titolo deve essere …"
- "Aggiungi una domanda alle FAQ: … / risposta: …"
- "Sostituisci il logo testuale con il file logo.svg che ho caricato"
- "Aggiungi il marketplace Etsy ai bottoni dei prodotti"
- "Attiva la Fase 2 dei pagamenti" (vedi sotto)

Utile sapere dove stanno le cose:
- testi del sito: `src/lib/i18n/it.ts` e `src/lib/i18n/en.ts`
- colori: `src/app/globals.css` (sezione `@theme`)
- logo: `src/components/site/Logo.tsx`
- privacy e cookie: `src/lib/legal.ts`

Ogni modifica pubblicata su GitHub (ramo `main`) viene messa online da Vercel in automatico in 1-2 minuti.

---

## 4. Attivare i pagamenti (Fase 2)

Il carrello e il checkout con **Stripe** (carte, Apple Pay, Google Pay) e **PayPal** sono già pronti nel codice ma spenti.
Attivali solo quando avrai la partita IVA (servono anche termini di vendita, diritto di recesso e dati fiscali nel sito: chiedimeli).

1. **Chiave Supabase per gli ordini:** Supabase → Project Settings → API → copia la chiave **service_role** (segreta).
2. **Stripe:** crea l'account su [stripe.com](https://stripe.com) → Developers → API keys → copia la **Secret key**.
   Poi Developers → **Webhooks → Add endpoint**: URL `https://<tuo-sito>/api/webhooks/stripe`, eventi `checkout.session.completed` e `checkout.session.async_payment_succeeded` → copia il **Signing secret**.
3. **PayPal** (facoltativo): [developer.paypal.com](https://developer.paypal.com) → Apps & Credentials → crea un'app **Live** → copia *Client ID* e *Secret*.
4. Su **Vercel → Project → Settings → Environment Variables** aggiungi (mai in chat o su GitHub):

   | Nome | Valore |
   | --- | --- |
   | `SUPABASE_SERVICE_ROLE_KEY` | chiave service_role |
   | `STRIPE_SECRET_KEY` | Secret key Stripe |
   | `STRIPE_WEBHOOK_SECRET` | Signing secret del webhook |
   | `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | credenziali PayPal |
   | `PAYPAL_ENV` | `live` |
   | `SHIPPING_FLAT_CENTS` | costo spedizione in centesimi (es. `500`) |

5. Vercel → **Deployments → … → Redeploy** per caricare le nuove variabili.
6. **Admin → Impostazioni → Pagamenti online**: accendi l'interruttore. In alternativa imposta `PAYMENTS_ENABLED=true` su Vercel.

Da quel momento sul sito compaiono il carrello e il bottone "Aggiungi al carrello"; i bottoni dei marketplace restano.
Gli ordini pagati arrivano in **Admin → Ordini** e la scorta viene scalata automaticamente.
Per spegnere tutto basta disattivare l'interruttore.

> Consiglio: prova prima con le chiavi di **test** di Stripe (iniziano con `sk_test_`) e `PAYPAL_ENV=sandbox`.

---

## 5. Collegare un dominio (es. 3dcrit.it)

1. Compra il dominio da un registrar (es. Aruba, Register.it, Namecheap, Cloudflare). *È a pagamento: circa 10-15 €/anno.*
2. Vercel → Project → **Settings → Domains → Add** → scrivi `3dcrit.it` (Vercel propone anche `www.3dcrit.it`).
3. Vercel mostra i record DNS da inserire nel pannello del registrar (di solito un record **A** `76.76.21.21` per `3dcrit.it` e un **CNAME** `cname.vercel-dns.com` per `www`). Il certificato HTTPS è automatico e gratuito.
4. Su Vercel → Environment Variables imposta `NEXT_PUBLIC_SITE_URL=https://www.3dcrit.it` (o il dominio principale scelto) e fai **Redeploy**: così sitemap, link condivisi e Google usano il nuovo dominio.
5. Supabase → Authentication → **URL Configuration** → *Site URL*: inserisci il nuovo dominio.
6. Se hai attivato Stripe, aggiorna l'URL del webhook con il nuovo dominio.
7. (Facoltativo) Registra il sito su [Google Search Console](https://search.google.com/search-console) e invia `https://www.3dcrit.it/sitemap.xml`.

---

## 6. Costi

Tutto funziona con i piani **gratuiti** di Vercel (Hobby), Supabase (Free) e GitHub.
Nota: su Supabase Free un progetto senza visite per 7 giorni viene messo in pausa; basta riattivarlo dalla dashboard (con un sito visitato ogni giorno non succede).
Stripe e PayPal non hanno costi fissi: trattengono una commissione solo sulle vendite.
