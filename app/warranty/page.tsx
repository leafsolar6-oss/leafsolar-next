import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';

export const metadata: Metadata = { title: 'Warranty', description: 'Leaf Solar product-specific warranty information and support-request guidance.', robots: { index: true, follow: true }, alternates: { canonical: '/warranty' } };

export default function WarrantyPage() {
  return <PolicyPage eyebrow="Customer information" title="Warranty" intro="Warranty coverage is product-specific. This policy does not assign a warranty period or coverage to a product unless it has been confirmed for that item." sections={[
    { title: 'Confirm before purchase', paragraphs: ['Ask Leaf Solar to confirm the warranty information for the exact product or installation scope before payment. Manufacturer, supplier and workmanship terms may be different and should not be treated as interchangeable.'], bullets: ['Coverage period, start date and responsible provider.', 'Parts, labour, transport, inspection or call-out arrangements.', 'Required registration, installation or maintenance conditions.', 'Exclusions or actions that may affect coverage.'] },
    { title: 'Requesting warranty support', bullets: ['Provide the order reference, product identity and serial number where available.', 'Describe the fault and when it started; include clear photographs or video when useful.', 'Do not open, alter or arrange an unauthorised repair before receiving guidance if that could affect the applicable process.', 'Keep invoices, payment confirmation, installation records and any written warranty information supplied with the order.'] },
    { title: 'No universal promise', paragraphs: ['A statement about one brand or product does not establish the terms for another. If a product page does not show verified warranty details, contact Leaf Solar for written confirmation.'] },
  ]} />;
}
