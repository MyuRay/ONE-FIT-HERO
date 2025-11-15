'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'HOME' },
    { href: '/workout', label: 'WORKOUT' },
    { href: '/trainers', label: 'TRAINERS' },
    { href: '/ranking', label: 'RANKING' },
    { href: '/exchange', label: 'EXCHANGE' },
  ];

  return (
    <nav className="border-b border-gray-700 bg-gray-800/30">
      <div className="container mx-auto px-4">
        <div className="flex gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'text-white border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

