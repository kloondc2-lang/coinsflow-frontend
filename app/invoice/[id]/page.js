import InvoiceClient from './InvoiceClient';

export async function generateMetadata({ params }) {
  return {
    title: 'Invoice — CoinsFlow Payments',
    description: 'Pay this invoice with Litecoin (LTC) via the CoinsFlow payment gateway.',
    robots: { index: false, follow: false },
  };
}

export default function InvoicePage({ params }) {
  return <InvoiceClient invoiceId={params.id} />;
}
