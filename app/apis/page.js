import LandingClient from './LandingClient';

export const metadata = {
  title: 'CoinsFlow API — Blockchain Data for Developers',
  description:
    'Programmatic access to Litecoin addresses, transactions, blocks, and live prices. Simple REST API, free tier included.',
};

export default function ApisPage() {
  return <LandingClient />;
}
