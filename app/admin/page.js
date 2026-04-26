import AdminClient from './AdminClient';

export const metadata = {
  title: 'Admin Panel — CoinsFlow',
  description: 'CoinsFlow admin dashboard.',
  robots: 'noindex, nofollow',
};

export default function AdminPage() {
  return <AdminClient />;
}
