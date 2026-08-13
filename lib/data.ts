export type Product = {
  slug: string;
  name: string;
  brand: string;
  category: 'Inverter' | 'Battery' | 'Solar Panel' | 'Appliance' | 'Charger';
  price: number;       // in Naira
  oldPrice?: number;
  rating: number;
  badge?: string;
  image: string;       // gradient stub or url
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

export const products: Product[] = [
  { slug:'deye-5kva-hybrid', name:'Deye 5kVA Hybrid Inverter', brand:'Deye', category:'Inverter', price:1850000, oldPrice:2100000, rating:4.9, badge:'Bestseller', image:'from-amber-200 to-orange-400', description:'48V hybrid inverter with 100A MPPT, parallel support and Wi-Fi monitoring.' },
  { slug:'lithium-10kwh', name:'Lithium Battery 10kWh 48V', brand:'Maxi', category:'Battery', price:1650000, rating:4.8, badge:'5-yr warranty', image:'from-emerald-200 to-green-500', description:'LiFePO4 battery with 6,000 cycles and built-in BMS.' },
  { slug:'mora-400w-panel', name:'Mora 400W Mono Panel', brand:'Mora', category:'Solar Panel', price:185000, rating:4.7, image:'from-sky-200 to-blue-500', description:'Tier-1 monocrystalline panel, 25-year power warranty.' },
  { slug:'lg-1.5hp-split', name:'LG 1.5HP Dual Inverter AC', brand:'LG', category:'Appliance', price:585000, oldPrice:650000, rating:4.8, badge:'Inverter', image:'from-rose-200 to-pink-500', description:'Energy-saving split unit with 70% power savings.' },
  { slug:'hisense-200l-fridge', name:'Hisense 200L Refrigerator', brand:'Hisense', category:'Appliance', price:245000, rating:4.6, image:'from-slate-200 to-slate-500', description:'Double-door, low-voltage startup, 1-yr warranty.' },
  { slug:'5kva-stabilizer', name:'5kVA Automatic Stabilizer', brand:'Maxi', category:'Charger', price:95000, rating:4.5, image:'from-yellow-200 to-amber-500', description:'Wide-input relay stabilizer, 90V–280V.' },
  { slug:'deye-8kva', name:'Deye 8kVA Three-Phase Inverter', brand:'Deye', category:'Inverter', price:2950000, rating:4.9, image:'from-orange-200 to-red-500', description:'Three-phase hybrid for larger homes and small offices.' },
  { slug:'lithium-20kwh', name:'20kWh Stacked LiFePO4 Battery', brand:'Maxi', category:'Battery', price:3100000, rating:4.9, image:'from-lime-200 to-emerald-600', description:'Modular stacked battery, expand up to 80kWh.' },
];

export const packages: SolarPackage[] = [
  { slug:'starter-1.5kva', name:'Starter 1.5kVA', tagline:'Lights, fan, TV & decoder', price:1200000, capacity:'1.5 kVA · 2.5 kWh', includes:['1.5kVA hybrid inverter','2.5kWh lithium battery','2 × 400W panels','Changeover & accessories','Free installation in Lagos/Abuja'] },
  { slug:'family-3.5kva', name:'Family 3.5kVA', tagline:'24/7 power for a 3-bedroom', price:3450000, capacity:'3.5 kVA · 7.5 kWh', includes:['3.5kVA hybrid inverter','7.5kWh lithium battery','6 × 400W panels','Installation & 1-yr support','Free same-day delivery'], highlight:true },
  { slug:'premium-5kva', name:'Premium 5kVA', tagline:'Whole home + AC', price:5250000, capacity:'5 kVA · 10 kWh', includes:['5kVA hybrid inverter','10kWh lithium battery','8 × 400W panels','Smart Wi-Fi monitor','Premium 2-yr warranty'] },
  { slug:'estate-8kva', name:'Estate 8kVA 3-Phase', tagline:'Large home / small office', price:8900000, capacity:'8 kVA · 20 kWh', includes:['8kVA 3-phase inverter','20kWh stacked battery','12 × 400W panels','Distribution panel','Dedicated engineer'] },
];

export const site = {
  name: 'Leaf Solar Ltd',
  phone: '+234 800 LEAF SOLAR',
  whatsapp: '+2348000000000',
  email: 'hello@leafsolar.ng',
  address: 'Lagos · Abuja · Port Harcourt',
  tagline: 'LIGHT UP YOUR HOME',
  sub: 'Your one-stop power & appliance store — genuine LG, Hisense, Maxi, Mora & Deye. Solar packages from ₦1.2M, FREE same-day delivery till Dec 2026.',
};

export function formatNaira(n: number) {
  return '₦' + n.toLocaleString('en-NG');
}
