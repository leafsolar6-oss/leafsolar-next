import Link from 'next/link';
import { site } from '@/lib/data';
import Newsletter from './Newsletter';

export default function Footer() {
  return (
    <footer className="mt-20 bg-gray-950 text-gray-300">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl font-extrabold text-white">Leaf<span className="text-leaf-500">Solar</span></div>
          <p className="mt-3 text-sm text-gray-400 max-w-xs">{site.sub}</p>
          <div className="mt-4 flex gap-2">
            {['facebook','instagram','twitter','youtube'].map(s => (
              <a key={s} href="#" className="h-9 w-9 rounded-full bg-white/10 inline-flex items-center justify-center hover:bg-leaf-600">
                <span className="text-xs uppercase">{s[0]}</span>
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/packages">Solar packages</Link></li>
            <li><Link href="/products?c=Inverter">Inverters</Link></li>
            <li><Link href="/products?c=Battery">Batteries</Link></li>
            <li><Link href="/products?c=Solar Panel">Panels</Link></li>
            <li><Link href="/products?c=Appliance">Appliances</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about">About us</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/demo">Customer app demo</Link></li>
            <li><a href="#">Warranty &amp; returns</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Get in touch</h4>
          <ul className="space-y-2 text-sm">
            <li>{site.address}</li>
            <li><a href={`tel:${site.whatsapp}`}>{site.phone}</a></li>
            <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
          </ul>
          <Newsletter />
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Leaf Solar Ltd. All rights reserved.
      </div>
    </footer>
  );
}
