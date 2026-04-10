import Link from 'next/link';
import Image from 'next/image';

const footerLinks = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Release Monitor', href: '/releases-monitor' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export default function Footer() {
  return (
    <footer className="mt-auto transition-colors duration-300">

      {/* Disclaimer */}
      <div className="py-4 px-6 text-center text-[11px] text-gray-400 dark:text-gray-600 font-extrabold leading-relaxed">
        Disclaimer: We present only public on-chain data and do not possess, infer, or confirm any
        identity or ownership information — we cannot assist with legal claims regarding on-chain
        transactions.
      </div>

      {/* Main footer row */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 items-center gap-6 text-[12px] text-gray-400 dark:text-gray-600">

        <div className="flex flex-col gap-2 -ml-2">
          <Image src="/logo.png" alt="CoinsFlow" width={110} height={32} className="object-contain dark:invert" />
          <Link href="/contact" className="font-extrabold hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
            Contact Us
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-extrabold text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-white hover:font-black transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="font-extrabold text-gray-400 whitespace-nowrap sm:text-right">
          CoinsFlow &copy; 2026. All Rights Reserved.
        </div>

      </div>
    </footer>
  );
}
