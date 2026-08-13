export type Product = {
  slug: string;
  name: string;
  brand: string;
  category: 'Inverter' | 'Battery' | 'Solar Panel' | 'Appliance';
  price: number;
  oldPrice?: number;
  badge?: string;
  image: string;
  imageAlt: string;
  description: string;
};

export type SolarPackage = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  capacity: string;
  includes: string[];
  highlight?: boolean;
};

// Product names, prices and photography are based on Leaf Solar's current catalogue.
export const products: Product[] = [
  {
    slug: 'hisense-6kw-solar-inverter',
    name: 'Hisense 6kW 48V Solar Inverter',
    brand: 'Hisense',
    category: 'Inverter',
    price: 488900,
    oldPrice: 504000,
    badge: 'Launch offer',
    image: '/images/products/hisense-6kw-inverter.jpg',
    imageAlt: 'Hisense 6kW 48V solar inverter',
    description: 'A genuine Hisense 6kW, 48V solar inverter supplied brand new and factory sealed with manufacturer warranty.',
  },
  {
    slug: 'deye-6kw-off-grid-inverter',
    name: 'Deye 6kW LV Off-Grid Inverter',
    brand: 'Deye',
    category: 'Inverter',
    price: 531300,
    oldPrice: 547700,
    badge: '3% off',
    image: '/images/products/deye-6kw-inverter.jpg',
    imageAlt: 'Deye 6kW low-voltage off-grid inverter',
    description: 'A single-phase 6kW low-voltage off-grid inverter from Deye, supplied brand new with full manufacturer warranty.',
  },
  {
    slug: 'deye-7-6kwh-hv-battery',
    name: 'Deye 7.6kWh High-Voltage Battery',
    brand: 'Deye',
    category: 'Battery',
    price: 1738250,
    oldPrice: 1792000,
    badge: 'Lithium',
    image: '/images/products/deye-7-6kwh-battery.jpg',
    imageAlt: 'Deye 7.6kWh high-voltage lithium battery',
    description: 'A genuine Deye 7.6kWh high-voltage battery for compatible solar storage systems, factory sealed and warrantied.',
  },
  {
    slug: 'pylontech-5-12kwh-battery',
    name: 'Pylontech 5.12kWh Lithium-Ion Battery',
    brand: 'Pylontech',
    category: 'Battery',
    price: 1140750,
    oldPrice: 1176000,
    badge: 'Popular',
    image: '/images/products/pylontech-5-12kwh-battery.jpg',
    imageAlt: 'Pylontech 5.12kWh lithium-ion solar battery',
    description: 'A compact 5.12kWh lithium-ion storage battery for dependable home and small-business solar installations.',
  },
  {
    slug: 'jinko-725w-bifacial-panel',
    name: 'Jinko 725W Bifacial Solar Panel',
    brand: 'Jinko',
    category: 'Solar Panel',
    price: 186950,
    oldPrice: 192700,
    badge: 'High output',
    image: '/images/products/jinko-725w-panel.jpg',
    imageAlt: 'Jinko 725 watt bifacial solar panel',
    description: 'A high-output 725W bifacial solar panel designed to capture light from both sides for efficient energy generation.',
  },
  {
    slug: 'lg-1-5hp-inverter-ac',
    name: 'LG 1.5HP Split Inverter AC',
    brand: 'LG',
    category: 'Appliance',
    price: 444300,
    oldPrice: 458000,
    badge: 'Energy saving',
    image: '/images/products/lg-1-5hp-inverter-ac.jpg',
    imageAlt: 'LG 1.5 horsepower split inverter air conditioner',
    description: 'A genuine LG 1.5HP split inverter air conditioner, supplied brand new, factory sealed and covered by manufacturer warranty.',
  },
  {
    slug: 'hisense-90l-refrigerator',
    name: 'Hisense 90L Refrigerator',
    brand: 'Hisense',
    category: 'Appliance',
    price: 178500,
    badge: 'Bestseller',
    image: '/images/products/hisense-90l-refrigerator.jpg',
    imageAlt: 'Hisense 90 litre silver refrigerator',
    description: 'A compact 90-litre Hisense refrigerator in silver, ideal for smaller kitchens, offices and guest rooms.',
  },
  {
    slug: 'hisense-32-fhd-smart-tv',
    name: 'Hisense 32-inch FHD Smart TV',
    brand: 'Hisense',
    category: 'Appliance',
    price: 190150,
    badge: 'Smart TV',
    image: '/images/products/hisense-32-smart-tv.jpg',
    imageAlt: 'Hisense 32-inch full HD smart television',
    description: 'A genuine 32-inch Hisense Full HD smart television, supplied factory sealed with full manufacturer warranty.',
  },
];

export const packages: SolarPackage[] = [
  {
    slug: 'starter-1-5kva',
    name: 'Starter 1.5kVA',
    tagline: 'Lights, fan, TV and decoder',
    price: 1200000,
    capacity: '1.5 kVA · home essentials',
    includes: ['1.5kVA inverter', '220Ah tubular battery', 'Solar panel array', 'Accessories and protective devices', 'Professional installation'],
  },
  {
    slug: 'family-3-5kva',
    name: 'Family 3.5kVA',
    tagline: 'Everyday power for a family home',
    price: 2300000,
    capacity: '3.5 kVA · expanded home power',
    includes: ['3.5kVA inverter', '2 × 220Ah tubular batteries', 'Solar panel array', 'Accessories and protective devices', 'Professional installation'],
    highlight: true,
  },
  {
    slug: 'premium-5kva',
    name: 'Premium 5kVA',
    tagline: 'More capacity for appliances',
    price: 3800000,
    capacity: '5 kVA · whole-home essentials',
    includes: ['5kVA inverter', '4 × 220Ah tubular batteries', 'Solar panel array', 'Accessories and protective devices', 'Professional installation'],
  },
  {
    slug: 'lithium-5kva',
    name: 'Lithium 5kVA',
    tagline: 'Long-life lithium storage',
    price: 6000000,
    capacity: '5 kVA · 10 kWh lithium',
    includes: ['5kVA hybrid inverter', '10kWh lithium battery', 'Solar panel array', 'Accessories and protective devices', 'Professional installation'],
  },
];

export const site = {
  name: 'Leaf Solar Ltd',
  phone: '+234 703 756 1216',
  phoneHref: '+2347037561216',
  whatsapp: '2347037561216',
  email: 'hello@leafsolar.ng',
  address: 'Shop 4, DP Plaza, beside Living Proof Supermarket Junction, Akala Express, Ibadan',
  location: 'Ibadan, Oyo State',
  rcNumber: 'RC7896501',
  tagline: 'Light up your home',
  sub: 'Genuine solar systems and home appliances from an authorized dealer in Ibadan, with professional installation and fast local delivery.',
};

export function whatsappUrl(message = 'Hello Leaf Solar! I have an enquiry.') {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function formatNaira(n: number) {
  return '₦' + n.toLocaleString('en-NG');
}
