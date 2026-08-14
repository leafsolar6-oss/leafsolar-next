import type { Metadata } from 'next';
import PaymentResult from './PaymentResult';
import { deliverPaidOrder, isValidPaystackReference, verifyPaystackPayment } from '@/lib/paystack';

export const metadata: Metadata = {
  title: 'Payment status',
  description: 'Check the status of your Leaf Solar payment.',
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ reference?: string }>;
};

export default async function PaymentStatusPage({ searchParams }: Props) {
  const { reference = '' } = await searchParams;
  if (!isValidPaystackReference(reference)) {
    return <PaymentResult success={false} />;
  }

  let verifiedAmount: number | undefined;
  try {
    const payment = await verifyPaystackPayment(reference);
    verifiedAmount = payment.total;
    try {
      await deliverPaidOrder(payment);
    } catch (error) {
      console.error('Payment status order notification failed', error);
    }
  } catch (error) {
    console.error('Payment status verification failed', error);
  }

  return verifiedAmount === undefined
    ? <PaymentResult success={false} reference={reference} />
    : <PaymentResult success reference={reference} amount={verifiedAmount} />;
}
