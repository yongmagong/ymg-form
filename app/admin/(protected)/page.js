import Link from 'next/link';
import { ADMIN_NAV } from '@/lib/adminNav';

export default function AdminHome() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {ADMIN_NAV.map((item) => (
        <Link key={item.href} href={item.href} className="card hover:shadow-md transition-shadow block">
          <span className={`w-11 h-11 rounded-full flex items-center justify-center text-xl mb-3 ${item.badge}`}>
            {item.icon}
          </span>
          <h2 className="text-lg font-bold mb-2">{item.label}</h2>
          <p className="text-gray-600 text-sm">{item.desc}</p>
        </Link>
      ))}
    </div>
  );
}
