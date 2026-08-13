import Link from 'next/link';
import { site, whatsappUrl } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.25fr_.75fr_.75fr_1.1fr]">
        <div>
          <Link href="/" className="font-display text-2xl font-extrabold text-white">Leaf<span className="text-leaf-500">Solar</span></Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-400">{site.sub}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            <span className="rounded-full border border-white/10 px-3 py-1.5">Fouani Authorized Dealer</span>
            <span className="rounded-full border border-white/10 px-3 py-1.5">{site.rcNumber}</span>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-white">Shop</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-gray-400">
            <li><Link className="hover:text-white" href="/packages">Solar packages</Link></li>
            <li><Link className="hover:text-white" href="/products?c=Inverter">Inverters</Link></li>
            <li><Link className="hover:text-white" href="/products?c=Battery">Batteries</Link></li>
            <li><Link className="hover:text-white" href="/products?c=Solar%20Panel">Solar panels</Link></li>
            <li><Link className="hover:text-white" href="/products?c=Appliance">Appliances</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-white">Company</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-gray-400">
            <li><Link className="hover:text-white" href="/about">About us</Link></li>
            <li><Link className="hover:text-white" href="/blog">Solar guides</Link></li>
            <li><Link className="hover:text-white" href="/contact">Contact</Link></li>
            <li><Link className="hover:text-white" href="/contact">Warranty support</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-white">Visit or contact us</h2>
          <address className="mt-4 space-y-3 text-sm not-italic leading-relaxed text-gray-400">
            <p>{site.address}</p>
            <p><a className="font-semibold text-white hover:text-leaf-400" href={`tel:${site.phoneHref}`}>{site.phone}</a></p>
            <p><a className="hover:text-white" href={`mailto:${site.email}`}>{site.email}</a></p>
          </address>
          <a href={whatsappUrl()} className="btn mt-5 bg-leaf-600 px-4 py-2.5 text-sm text-white hover:bg-leaf-500">Chat on WhatsApp</a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Leaf Solar Ltd. All rights reserved.</p>
          <p>{site.location} · {site.rcNumber}</p>
        </div>
      </div>
    </footer>
  );
}
