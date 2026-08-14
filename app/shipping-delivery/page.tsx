import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';

export const metadata: Metadata = { title: 'Shipping & Delivery', description: 'Leaf Solar delivery information for Ibadan and destinations outside Ibadan.', robots: { index: true, follow: true }, alternates: { canonical: '/shipping-delivery' } };

export default function ShippingDeliveryPage() {
  return <PolicyPage eyebrow="Customer information" title="Shipping & delivery" intro="How delivery is currently handled for online orders from Leaf Solar. Exact timing and any destination-specific arrangements are confirmed for each order." sections={[
    { title: 'Ibadan delivery', paragraphs: ['Leaf Solar currently provides free delivery for online orders to addresses in Ibadan, Oyo State. The checkout address must identify Ibadan as the city and Oyo as the state for this option.'], bullets: ['A delivery date or time is not automatically guaranteed at checkout.', 'Leaf Solar will use the contact details on the paid order to arrange delivery.', 'If an address or order scope changes, Leaf Solar may need to review the delivery arrangement before dispatch.'] },
    { title: 'Destinations outside Ibadan', paragraphs: ['Online payment is not enabled until Leaf Solar reviews the destination and approves a delivery quote. No automatic rate is assumed.'], bullets: ['Submit the delivery address and cart through checkout.', 'Leaf Solar reviews the request and enters a confirmed delivery amount.', 'After approval, the customer can return to the quote-linked checkout and pay the product subtotal plus the approved delivery amount through Paystack.', 'An unapproved, cancelled or changed quote cannot be used to start payment.'] },
    { title: 'Receiving an order', bullets: ['Check the package and item identity when delivery is presented.', 'If an item appears damaged, incomplete or different from the order, record the issue and contact Leaf Solar promptly before installation or extended use.', 'Keep the Paystack reference and Leaf Solar order communications for support.'] },
  ]} />;
}
