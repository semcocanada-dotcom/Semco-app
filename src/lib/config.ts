// ─── Store Configuration ──────────────────────────────────────────────────────
// Change this file to white-label this app for any store.

export const storeConfig = {
  // Identity
  name: "Bart's",
  nameFull: "Bart's Taping Tools",
  tagline: "Edmonton, AB",
  since: "1995",

  // Contact
  address: "6030 50th Street, Edmonton, AB T6B 3C4",
  phone: "780-465-8733",
  hours: "Mon–Fri 7am–5pm · Sat 8am–2pm",
  website: "bartstapingtools.ca",

  // Account (demo)
  accountName: "Mike",
  accountCompany: "Mike's Drywall",
  accountType: "Net-30",
  accountCredit: 4200,
  creditCardLast4: "4291",
  creditCardExpiry: "09/27",

  // Fulfillment
  pickupLocation: "6030 50th Street, Edmonton AB",
  pickupReady: "Ready today after 2pm",
  deliveryInfo: "Next business day",
  freeDeliveryThreshold: 500,
  taxRate: 0.05, // 5% GST

  // Reorder CTA
  reorderSubtitle: "Takes 30 seconds",

  // Order numbers
  orderPrefix: "BTT",

  // Colors — documentation only. The build reads colors from
  // tailwind.config.ts tokens + the CSS variables in src/app/globals.css.
  // To re-skin a vendor: update those two files to match these values.
  colors: {
    primary: "#1C3A6E",      // navy – main CTAs
    primaryDark: "#142B52",
    primaryLight: "#E8EDF6",
    brand: "#1B84AD",        // Bart's blue – logo / brand accent (from bartstapingtools.ca)
    brandDark: "#14688A",
    brandLight: "#E5F3F8",
  },
} as const;

export type StoreConfig = typeof storeConfig;
