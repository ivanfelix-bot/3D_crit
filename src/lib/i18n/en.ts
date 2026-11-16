import type { it } from "./it";

/** Testi del sito in inglese. Deve avere la stessa struttura di it.ts. */
export const en: typeof it = {
  meta: {
    title: "3D Crit – 3D printed objects",
    description:
      "Useful 3D printed objects and gadgets: organizers, stands and accessories for home, desk, kitchen, gaming setup and garage. Handmade in Italy.",
  },
  nav: {
    home: "Home",
    catalog: "Shop",
    about: "About",
    contact: "Contact",
    faq: "FAQ",
    cart: "Cart",
    menu: "Menu",
    language: "Language",
  },
  home: {
    eyebrow: "Handcrafted 3D printing",
    heroTitle: "Useful objects, 3D printed.",
    heroText:
      "Organizers, stands and small accessories for your home, desk, kitchen, gaming setup and garage. Plus a few gadgets to keep your hands busy.",
    heroCta: "Browse the shop",
    heroSecondary: "About us",
    featured: "Featured",
    viewAll: "View all",
    categories: "Categories",
    aboutTitle: "About us",
    aboutText:
      "3D Crit is a small 3D printing workshop. We design and print simple objects that solve everyday problems, using durable materials and plenty of attention to detail.",
    aboutCta: "Read more",
    empty: "The first products are coming soon.",
  },
  catalog: {
    title: "Shop",
    subtitle: "All our 3D printed products.",
    all: "All",
    searchPlaceholder: "Search a product…",
    search: "Search",
    noResults: "No products found.",
    resultOne: "1 product",
    resultsMany: "{n} products",
  },
  product: {
    material: "Material",
    dimensions: "Dimensions",
    category: "Category",
    price: "Price",
    buyOn: "Buy on",
    noLinks: "Coming soon to marketplaces. Contact us for information.",
    contactUs: "Contact us",
    back: "Back to shop",
    related: "You may also like",
    demo: "Demo product",
    addToCart: "Add to cart",
    added: "Added!",
    status: {
      available: "Available",
      out_of_stock: "Sold out",
      made_to_order: "Made to order",
    },
  },
  about: {
    title: "About us",
    paragraphs: [
      "3D Crit was born from a passion for 3D printing and for objects that make life simpler.",
      "Every product is designed, tested and printed by us, one piece at a time. We use materials such as PLA and PETG, chosen according to the use: strength, lightness or finish.",
      "We make organizers, stands and accessories for home, desk, kitchen, gaming setups and garage, along with a few gadgets and fidgets for kids and adults.",
      "Have an idea or need a variant of a product? Write to us: we are happy to consider custom requests too.",
    ],
  },
  contact: {
    title: "Contact",
    text: "For information, custom requests or orders, write to us. We will reply as soon as possible.",
    email: "Email",
    tiktok: "TikTok",
    notSet: "Coming soon",
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        q: "How can I buy?",
        a: "Each product has buttons to buy it on the marketplaces where it is listed (Vinted, eBay, Amazon or Wallapop). Payment and shipping are handled by the chosen marketplace.",
      },
      {
        q: "What materials do you use?",
        a: "Mainly PLA and PETG. The material of each product is shown on its page.",
      },
      {
        q: "What does “made to order” mean?",
        a: "The product is printed after you order it, so it takes a few extra days before shipping.",
      },
      {
        q: "Do you make custom objects?",
        a: "Yes, for custom requests (color, size, variants) contact us by email or TikTok.",
      },
      {
        q: "Are the objects suitable for children?",
        a: "Gadgets contain small parts and are not suitable for children under 3.",
      },
    ],
  },
  legal: {
    privacyTitle: "Privacy policy",
    cookieTitle: "Cookie policy",
    updated: "Last updated",
  },
  footer: {
    tagline: "3D printed objects, handmade.",
    links: "Links",
    legal: "Information",
    privacy: "Privacy",
    cookies: "Cookies",
    rights: "All rights reserved.",
  },
  cart: {
    title: "Cart",
    empty: "Your cart is empty.",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    remove: "Remove",
    quantity: "Quantity",
    payCard: "Pay by card",
    payPaypal: "Pay with PayPal",
    processing: "Please wait…",
    error: "We could not start the payment. Please try again.",
    successTitle: "Thank you for your order!",
    successText: "We have received your payment. You will receive a confirmation by email.",
    cancelTitle: "Payment cancelled",
    cancelText: "The payment was not completed. Your cart is still available.",
    backToCart: "Back to cart",
    continue: "Continue shopping",
  },
  notFound: {
    title: "Page not found",
    text: "The page you are looking for does not exist or has been moved.",
    back: "Back to home",
  },
};
