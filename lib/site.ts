export const site = {
  name: "Marijuana Land",
  tagline: "The Upper Peninsula's Premier Cannabis Dispensary",
  phone: "(954) 444-6660",
  phoneHref: "tel:+19544446660",
  email: "info@marijuanaland.com",
  address: "1204 W US HWY 2, Germfask MI 49836",
  hours: "9am – 9pm | Open Daily",
  hoursDetail: [
    "Monday – Friday: 9:00A – 9:00P",
    "Saturday – Sunday: 10:00A – 10:00P",
  ],
  directionsUrl:
    "https://www.google.com/maps/dir//1204%20W%20US%20HWY%202%20Germfask%20MI%2049836",
  instagramHandle: "MarijuanaLANDMI",
  promo: "Summer Sale For All Flower 1/8g, 25% OFF",
  licenses:
    "© 2024 Marijuana Land | All Rights Reserved | C11-0000661-LIC",
};

export const nav = [
  { label: "Shop", href: "/shop" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Gallery", href: "/gallery" },
];

// Mobile slide-out menu — mirrors the original site's 8-item mobile nav.
// "Brands" and "Deals" both pointed at the shop menu on the old site.
export const mobileNav = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Brands", href: "/shop" },
  { label: "Deals", href: "/shop" },
  { label: "FAQ", href: "/faq" },
  { label: "About Us", href: "/about-us" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact Us", href: "/contact" },
];

export const categories = [
  "Deals",
  "Flower",
  "Cartridges",
  "Edibles",
  "Pre-rolls",
  "Concentrates",
];

export const deals = [
  {
    title: "topicals",
    text: "buy 3, get 1 free",
    image: "/images/shop-6.png",
    tall: true,
  },
  {
    title: "flower sale",
    text: "$25 1/8oz",
    image: "/images/shop-2.png",
    tall: false,
  },
  {
    title: "pre-rolls",
    text: "3 for $49 singles · $99 5pk",
    image: "/images/shop-3.png",
    tall: false,
  },
  {
    title: "edible sale",
    text: "$30 100mg bags",
    image: "/images/shop-4.png",
    tall: false,
  },
  {
    title: "cartridges",
    text: "premium selection",
    image: "/images/shop-8.png",
    tall: true,
  },
];

// "Today at the Shop" deals strip (replaces the licensed brand-logo row).
// Deal copy is placeholder per the design handoff — swap for real offers,
// ideally sourced from the menu API so staff can change deals without a deploy.
export type MarkKind = "circle" | "bars" | "bar" | "diamond" | "dots" | "pill";

export type DealTile = {
  category: string;
  mark: MarkKind;
  figure: string;
  caption: string;
  staticLabel: string;
  href: string;
  tone: "green" | "accent";
};

export const dealTiles: DealTile[] = [
  { category: "FLOWER", mark: "circle", figure: "20%", caption: "OFF OUNCES", staticLabel: "20% OFF OUNCES", href: "/shop", tone: "green" },
  { category: "EDIBLES", mark: "bars", figure: "2/$30", caption: "GUMMY PACKS", staticLabel: "2/$30 GUMMY PACKS", href: "/shop", tone: "accent" },
  { category: "VAPES", mark: "bar", figure: "$25", caption: "ALL 1G CARTS", staticLabel: "$25 ALL 1G CARTS", href: "/shop", tone: "green" },
  { category: "CONCENTRATES", mark: "diamond", figure: "B1G1", caption: "LIVE ROSIN", staticLabel: "B1G1 LIVE ROSIN", href: "/shop", tone: "accent" },
  { category: "PRE-ROLLS", mark: "dots", figure: "5/$20", caption: "HALF GRAMS", staticLabel: "5/$20 HALF GRAMS", href: "/shop", tone: "green" },
  { category: "TOPICALS", mark: "pill", figure: "15%", caption: "BALMS + OILS", staticLabel: "15% BALMS + OILS", href: "/shop", tone: "accent" },
];

export const testimonials = [
  {
    quote:
      "Marijuana land dispensary is fantastic! The staff is super knowledgeable, and the selection is amazing. I found the perfect strain for me. Definitely coming back!",
    author: "Jamie S.",
  },
];

export const faqs = [
  {
    q: "Do I need a medical card to purchase cannabis?",
    a: "No medical card is needed for recreational purchases — just a valid government-issued ID proving you are 21 or older.",
  },
  {
    q: "What forms of payment do you accept?",
    a: "We accept cash and major credit/debit cards. An ATM is available on-site for your convenience.",
  },
  {
    q: "Can I order online and pick up in-store?",
    a: "Yes! Browse our online menu, place your order, and pick it up in-store at your convenience.",
  },
  {
    q: "What is your return policy?",
    a: "Due to state regulations, all cannabis sales are final. If there is an issue with your product, reach out and our team will make it right.",
  },
  {
    q: "Do you offer discounts or loyalty programs?",
    a: "We run daily deals and offer 20% off your first order when you subscribe to our text list. Ask in-store about loyalty rewards.",
  },
];

export const galleryImages = [
  "/images/Rectangle-98-1.png",
  "/images/Rectangle-99-1.png",
  "/images/Rectangle-100-2.png",
  "/images/Rectangle-102-1.png",
  "/images/Rectangle-104-1.png",
  "/images/Rectangle-107.png",
];

export const instagramImages = [
  "/images/Rectangle-98.jpg",
  "/images/Rectangle-99.png",
  "/images/Rectangle-100.png",
];

// Meadow online-menu embed (org 1192). Set to true once the account is
// confirmed active — the Shop page will then load the live menu.
export const MEADOW_ENABLED = false;
export const MEADOW_ORG_ID = "1192";

// ---------------------------------------------------------------------------
// Placeholder shop menu. Illustrative only — shown until the live Meadow menu
// is switched on with MEADOW_ENABLED. Names, potency and prices are samples,
// not real inventory, and the cards deliberately do not offer checkout.
export type MenuItem = {
  name: string;
  category: string;
  strain: "Indica" | "Sativa" | "Hybrid" | "CBD";
  thc: string;
  price: string;
  size: string;
  image: string;
};

export const menuCategories = [
  "Flower",
  "Pre-Rolls",
  "Cartridges",
  "Edibles",
  "Concentrates",
  "Topicals",
];

export const menuItems: MenuItem[] = [
  { name: "Northern Lights", category: "Flower", strain: "Indica", thc: "22%", price: "$25", size: "1/8 oz", image: "/images/shop-2.png" },
  { name: "Superior Haze", category: "Flower", strain: "Sativa", thc: "24%", price: "$30", size: "1/8 oz", image: "/images/shop-2.png" },
  { name: "Seney Sunset", category: "Flower", strain: "Hybrid", thc: "21%", price: "$28", size: "1/8 oz", image: "/images/shop-2.png" },
  { name: "Two-Hearted Preroll", category: "Pre-Rolls", strain: "Hybrid", thc: "20%", price: "$12", size: "1 g", image: "/images/shop-3.png" },
  { name: "Campfire 5-Pack", category: "Pre-Rolls", strain: "Indica", thc: "19%", price: "$45", size: "5 x 0.5 g", image: "/images/shop-3.png" },
  { name: "Trailhead Singles", category: "Pre-Rolls", strain: "Sativa", thc: "23%", price: "$10", size: "1 g", image: "/images/shop-3.png" },
  { name: "Copper Ridge Cart", category: "Cartridges", strain: "Hybrid", thc: "85%", price: "$40", size: "1 g", image: "/images/shop-8.png" },
  { name: "Lakeshore Live Resin", category: "Cartridges", strain: "Sativa", thc: "88%", price: "$50", size: "1 g", image: "/images/shop-8.png" },
  { name: "Evergreen Distillate", category: "Cartridges", strain: "Indica", thc: "82%", price: "$35", size: "0.5 g", image: "/images/shop-8.png" },
  { name: "Thimbleberry Gummies", category: "Edibles", strain: "Hybrid", thc: "100 mg", price: "$30", size: "10-pack", image: "/images/shop-4.png" },
  { name: "Maple Chews", category: "Edibles", strain: "Indica", thc: "100 mg", price: "$28", size: "10-pack", image: "/images/shop-4.png" },
  { name: "Birch Bark Mints", category: "Edibles", strain: "Sativa", thc: "50 mg", price: "$18", size: "20-pack", image: "/images/shop-4.png" },
  { name: "Pictured Rocks Rosin", category: "Concentrates", strain: "Hybrid", thc: "76%", price: "$55", size: "1 g", image: "/images/Rectangle-104-1.png" },
  { name: "Cold Smoke Badder", category: "Concentrates", strain: "Indica", thc: "72%", price: "$45", size: "1 g", image: "/images/Rectangle-104-1.png" },
  { name: "Driftwood Shatter", category: "Concentrates", strain: "Sativa", thc: "78%", price: "$40", size: "1 g", image: "/images/Rectangle-104-1.png" },
  { name: "Recovery Balm", category: "Topicals", strain: "CBD", thc: "200 mg", price: "$35", size: "2 oz", image: "/images/shop-6.png" },
  { name: "Trail Relief Oil", category: "Topicals", strain: "CBD", thc: "500 mg", price: "$48", size: "1 oz", image: "/images/shop-6.png" },
  { name: "Winter Salve", category: "Topicals", strain: "CBD", thc: "150 mg", price: "$30", size: "2 oz", image: "/images/shop-6.png" },
];
