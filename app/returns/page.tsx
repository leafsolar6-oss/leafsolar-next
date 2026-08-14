import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';

export const metadata: Metadata = { title: 'Returns', description: 'Leaf Solar information for raising a return request or reporting an order problem.', robots: { index: true, follow: true }, alternates: { canonical: '/returns' } };

export default function ReturnsPage() {
  return <PolicyPage eyebrow="Customer information" title="Returns" intro="How to raise a return request or report an order problem. Leaf Solar does not promise a universal return window or automatic outcome; each request is reviewed against the order facts and applicable requirements." sections={[
    { title: 'Report an order problem', paragraphs: ['Contact Leaf Solar as soon as you identify a problem and provide enough information for the team to review the order.'], bullets: ['Your Paystack or Leaf Solar order reference.', 'The product name and, where available, model or serial number.', 'A clear description of the issue, supported by photographs or video when relevant.', 'Whether the item has been installed, connected, used or altered.'] },
    { title: 'Review before a return', paragraphs: ['Leaf Solar will review the product, order record, condition, reason for the request and any applicable manufacturer or supplier process before confirming what happens next.'], bullets: ['Do not send an item back without receiving return instructions and a confirmed destination.', 'Do not continue installing or using an item that appears unsafe, damaged or incorrectly supplied.', 'No return window, collection fee, restocking fee, exchange promise or refund timing should be assumed unless Leaf Solar confirms it for the case.'] },
    { title: 'Applicable rights', paragraphs: ['Nothing on this page is intended to remove rights or remedies that cannot lawfully be excluded. Leaf Solar will assess each request against the order facts and applicable requirements.'] },
  ]} />;
}
