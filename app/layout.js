import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ThemeProvider from './components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CoinsFlow — Blockchain Explorer',
  description:
    'Search for blocks, transactions, and addresses across Bitcoin, Ethereum, Litecoin, and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-white dark:bg-[#020d1c] text-gray-900 dark:text-gray-100 antialiased min-h-screen flex flex-col transition-colors duration-300`}
      >
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
