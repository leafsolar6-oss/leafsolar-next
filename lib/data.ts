import catalogue from './catalog.json';

export type Product = {
  id: number;
  slug: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  categoryLabel: string;
  department: 'electronics' | 'solar' | 'packages';
  price: number;
  oldPrice?: number | null;
  onSale: boolean;
  image: string;
  imageAlt: string;
  description: string;
  inStock: boolean;
  gallery?: string[];
  specifications?: Array<{ name: string; value: string }>;
  basePrice?: number;
  trackInventory?: boolean;
  stockQuantity?: number | null;
  lowStockThreshold?: number | null;
  offerId?: number | null;
  offerTitle?: string | null;
  offerBadge?: string | null;
  offerEndsAt?: string | null;
  offerFeatured?: boolean;
  featured?: boolean;
};

export type SolarPackage = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  capacity: string;
  includes: string[];
  series: string;
  image: string;
  productId: number;
};

export const products = catalogue as Product[];

export const electronics = products.filter(product => product.department === 'electronics');
export const solarEquipment = products.filter(product => product.department === 'solar');
export const packageProducts = products.filter(product => product.department === 'packages');

function packageCapacity(name: string) {
  const kva = name.match(/([\d.]+)KVA/i)?.[1];
  const kwh = name.match(/([\d.]+)kWh/i)?.[1];
  if (kva && kwh) return `${kva}kVA · ${kwh}kWh lithium`;
  if (kva) return `${kva}kVA catalogue configuration`;
  return 'Solar package starting point';
}

function packageSeries(category: string) {
  if (category === 'Tubular Packages') return 'Tubular';
  if (category === 'Lithium Packages') return 'Lithium';
  if (category === 'Commercial Packages') return 'Commercial';
  return 'Industrial';
}

function packageTagline(product: Product) {
  const series = packageSeries(product.category);
  return `${series} package starting point; final load and site design must be confirmed`;
}

export function packagesFromProducts(source: Product[]): SolarPackage[] {
  return source
    .filter(product => product.department === 'packages')
    .map(product => ({
      slug: product.slug,
      name: product.name,
      tagline: packageTagline(product),
      price: product.price,
      capacity: packageCapacity(product.name),
      includes: [],
      series: packageSeries(product.category),
      image: product.image,
      productId: product.id,
    }))
    .sort((a, b) => a.price - b.price);
}

export const packages: SolarPackage[] = packagesFromProducts(products);

export type ShopCategory = {
  slug: string;
  name: string;
  shortName: string;
  image: string;
  count: number;
};

const categoryBasics: Omit<ShopCategory, 'count'>[] = [
  { slug: 'TVs', name: 'TVs & Audio', shortName: 'TVs', image: '/images/categories/tvs.webp' },
  { slug: 'Fridges & Freezers', name: 'Fridges & Freezers', shortName: 'Fridges', image: '/images/categories/fridges-freezers.webp' },
  { slug: 'Air Conditioners', name: 'Air Conditioners', shortName: 'ACs', image: '/images/categories/air-conditioners.webp' },
  { slug: 'Washers & Dryers', name: 'Washers & Dryers', shortName: 'Washers', image: '/images/categories/washers-dryers.webp' },
  { slug: 'Kitchen & Cooking', name: 'Kitchen & Cooking', shortName: 'Kitchen', image: '/images/categories/kitchen-cooking.webp' },
  { slug: 'Fans & Coolers', name: 'Fans & Coolers', shortName: 'Fans', image: '/images/categories/fans-coolers.webp' },
  { slug: 'Solar', name: 'Solar & Inverters', shortName: 'Solar', image: '/images/categories/solar.webp' },
  { slug: 'Generators & Power', name: 'Generators & Power', shortName: 'Power', image: '/images/categories/generators-power.webp' },
];

export function shopCategoriesFromProducts(source: Product[]): ShopCategory[] {
  return categoryBasics.map(category => ({
    ...category,
    count: category.slug === 'TVs'
      ? source.filter(item => item.categoryLabel === 'Televisions' || item.categoryLabel === 'Audio & Sound').length
      : category.slug === 'Solar'
        ? source.filter(item => item.department !== 'electronics').length
        : source.filter(item => item.category === category.slug).length,
  }));
}

export const shopCategories: ShopCategory[] = shopCategoriesFromProducts(products);

const offerIds = new Set([1121, 1161, 1192, 1272, 1381, 1401]);
export const weeklyOffers = products.filter(product => offerIds.has(product.id));

const bestsellerIds = new Set([1121, 1168, 1192, 1255, 1310, 1381, 1401, 1463]);
export const bestsellers = products.filter(product => bestsellerIds.has(product.id));

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
  sub: 'Electronics, home appliances, solar equipment and project-specific solar quotations from an authorized dealer in Ibadan.',
};

export function whatsappUrl(message = 'Hello Leaf Solar! I have an enquiry.') {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function formatNaira(n: number) {
  return '₦' + n.toLocaleString('en-NG');
}

export function productBadge(product: Product) {
  if (product.offerBadge) return product.offerBadge;
  if (product.onSale) return 'Sale';
  return undefined;
}
