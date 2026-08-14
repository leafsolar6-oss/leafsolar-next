import { requireAdmin } from '@/lib/admin-auth';
import { getAdminOrders } from '@/lib/admin-data';

export const dynamic = 'force-dynamic';

function csv(value: unknown) {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  await requireAdmin();
  const url = new URL(request.url);
  const orders = await getAdminOrders({ q: url.searchParams.get('q') || '', status: url.searchParams.get('status') || '', limit: 1000 });
  const headers = ['Reference', 'Status', 'Paid at', 'Customer', 'Email', 'Phone', 'Address', 'City', 'State', 'Items', 'Subtotal NGN', 'Delivery NGN', 'Delivery basis', 'Total NGN', 'Payment channel', 'Delivery quote', 'Tracking reference', 'Fulfilment notes'];
  const lines = [headers.map(csv).join(',')];
  for (const order of orders) {
    const items = order.items.map(item => `${item.quantity} x ${item.name} [${item.sku || item.id}]`).join('; ');
    lines.push([
      order.reference, order.status, order.paidAt, [order.firstName, order.lastName].filter(Boolean).join(' '), order.customerEmail,
      order.phone, order.address, order.city, order.state, items, order.subtotal, order.deliveryAmount,
      order.deliveryKind === 'approved-quote' ? 'Approved delivery quote' : order.deliveryKind === 'ibadan-free' ? 'Free — Ibadan' : 'Not recorded (legacy order)',
      order.amount, order.paymentChannel, order.quoteCode || '', order.trackingReference, order.fulfilmentNotes,
    ].map(csv).join(','));
  }
  const date = new Date().toISOString().slice(0, 10);
  return new Response(`\uFEFF${lines.join('\r\n')}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leaf-solar-orders-${date}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
