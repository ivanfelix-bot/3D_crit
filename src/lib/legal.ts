import type { Locale } from "./i18n";

/**
 * Testi di base di Privacy e Cookie policy.
 * NB: sono un punto di partenza, non una consulenza legale. Quando aprirai la
 * partita IVA aggiungi ragione sociale, indirizzo e P.IVA del titolare.
 */

export interface LegalSection {
  heading: string;
  body: string[];
  list?: string[];
}

export const LEGAL_UPDATED = "2026-11-16";

export function privacySections(locale: Locale, email: string): LegalSection[] {
  const contact = email || (locale === "it" ? "l'indirizzo indicato nella pagina Contatti" : "the address shown on the Contact page");
  if (locale === "en") {
    return [
      { heading: "Data controller", body: [`The data controller is 3D Crit, reachable at ${contact}.`] },
      {
        heading: "What data we collect",
        body: ["This website is a catalogue and does not require registration. We only process:"],
        list: [
          "data you send us voluntarily by email or social networks (e.g. name, email address, message), used only to reply to you;",
          "anonymous statistics on product page visits and clicks on marketplace buttons: we do not store IP addresses, cookies or identifiers;",
          "technical data (e.g. IP address, browser) automatically processed by our hosting provider for security and to deliver the site.",
        ],
      },
      {
        heading: "Purchases",
        body: [
          "Purchases take place on external marketplaces (Vinted, eBay, Amazon, Wallapop). Their own privacy policies apply. If online payment is enabled on this site in the future, payments will be processed by Stripe or PayPal: we never see your card data.",
        ],
      },
      {
        heading: "Service providers",
        body: ["We use Vercel (hosting) and Supabase (database and image storage), which process data on our behalf in accordance with the GDPR."],
      },
      { heading: "Retention", body: ["Emails are kept for as long as needed to answer requests. Anonymous statistics may be kept indefinitely."] },
      {
        heading: "Your rights",
        body: [
          `You can ask for access, rectification, erasure or restriction of your data and object to processing by writing to ${contact}. You also have the right to lodge a complaint with the Italian Data Protection Authority (Garante per la protezione dei dati personali).`,
        ],
      },
    ];
  }
  return [
    { heading: "Titolare del trattamento", body: [`Il titolare del trattamento è 3D Crit, contattabile all'indirizzo ${contact}.`] },
    {
      heading: "Quali dati raccogliamo",
      body: ["Questo sito è un catalogo e non richiede registrazione. Trattiamo solo:"],
      list: [
        "i dati che ci invii volontariamente via email o social (es. nome, indirizzo email, messaggio), usati solo per risponderti;",
        "statistiche anonime sulle visite alle pagine prodotto e sui click ai bottoni dei marketplace: non salviamo indirizzi IP, cookie o identificativi;",
        "dati tecnici (es. indirizzo IP, browser) trattati automaticamente dal fornitore di hosting per sicurezza e per far funzionare il sito.",
      ],
    },
    {
      heading: "Acquisti",
      body: [
        "Gli acquisti avvengono sui marketplace esterni (Vinted, eBay, Amazon, Wallapop), che applicano le proprie informative privacy. Se in futuro verrà attivato il pagamento online su questo sito, i pagamenti saranno gestiti da Stripe o PayPal: non vediamo mai i dati della tua carta.",
      ],
    },
    {
      heading: "Fornitori di servizi",
      body: ["Utilizziamo Vercel (hosting) e Supabase (database e archivio immagini), che trattano i dati per nostro conto nel rispetto del GDPR."],
    },
    { heading: "Conservazione", body: ["Le email sono conservate per il tempo necessario a rispondere. Le statistiche anonime possono essere conservate senza limiti di tempo."] },
    {
      heading: "I tuoi diritti",
      body: [
        `Puoi chiedere accesso, rettifica, cancellazione o limitazione dei tuoi dati e opporti al trattamento scrivendo a ${contact}. Hai inoltre diritto di proporre reclamo al Garante per la protezione dei dati personali.`,
      ],
    },
  ];
}

export function cookieSections(locale: Locale): LegalSection[] {
  if (locale === "en") {
    return [
      {
        heading: "Technical cookies only",
        body: ["This website does not use profiling or advertising cookies, nor third-party analytics tools. For this reason no consent banner is required."],
      },
      {
        heading: "Cookies and storage used",
        body: ["We only use the following technical tools:"],
        list: [
          "NEXT_LOCALE – remembers the language you chose (duration: 1 year);",
          "authentication cookies (sb-…) – only for the site administrator in the reserved area;",
          "browser session storage – avoids counting the same product visit twice (deleted when you close the browser);",
          "browser local storage – keeps the cart contents, only if online payment is active.",
        ],
      },
      {
        heading: "External links",
        body: ["The buttons to Vinted, eBay, Amazon and Wallapop take you to external sites, which use their own cookies according to their policies."],
      },
      { heading: "How to manage cookies", body: ["You can delete or block cookies from your browser settings. The site keeps working, but your language choice will not be remembered."] },
    ];
  }
  return [
    {
      heading: "Solo cookie tecnici",
      body: ["Questo sito non utilizza cookie di profilazione o pubblicitari, né strumenti di analisi di terze parti. Per questo motivo non è necessario il banner di consenso."],
    },
    {
      heading: "Cookie e memorie utilizzate",
      body: ["Usiamo solo i seguenti strumenti tecnici:"],
      list: [
        "NEXT_LOCALE – ricorda la lingua che hai scelto (durata: 1 anno);",
        "cookie di autenticazione (sb-…) – solo per l'amministratore del sito nell'area riservata;",
        "memoria di sessione del browser – evita di contare due volte la stessa visita a un prodotto (si cancella alla chiusura del browser);",
        "memoria locale del browser – conserva il contenuto del carrello, solo se il pagamento online è attivo.",
      ],
    },
    {
      heading: "Link esterni",
      body: ["I bottoni verso Vinted, eBay, Amazon e Wallapop portano a siti esterni, che usano i propri cookie secondo le loro informative."],
    },
    { heading: "Come gestire i cookie", body: ["Puoi cancellare o bloccare i cookie dalle impostazioni del browser. Il sito continua a funzionare, ma la lingua scelta non verrà ricordata."] },
  ];
}
