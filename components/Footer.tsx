import Link from 'next/link';
import { site, whatsappUrl } from '@/lib/data';

export default function Footer() {
  return (
    <footer className="bg-[#0d1711] text-gray-300">
      <div className="border-b border-white/10">
        <div className="container-wide grid gap-5 py-8 sm:grid-cols-3">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-leaf-300"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg></span><span><b className="block text-sm text-white">Managed delivery</b><small className="text-xs text-white/45">Free in Ibadan · quote elsewhere</small></span></div>
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-leaf-300"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg></span><span><b className="block text-sm text-white">Warranty information</b><small className="text-xs text-white/45">Confirm terms for each product</small></span></div>
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-leaf-300"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14v3a2 2 0 0 0 2 2h2v-7H6a2 2 0 0 0-2 2Zm16 0v3a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2Z"/></svg></span><span><b className="block text-sm text-white">Helpful support</b><small className="text-xs text-white/45">Real people in Ibadan</small></span></div>
        </div>
      </div>

      <div className="container-wide grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1.2fr]">
        <div>
          <Link href="/" className="flex items-center gap-2 font-display text-2xl font-black text-white"><span className="grid h-10 w-10 place-items-center rounded-xl bg-leaf-700"><svg width="25" height="25" viewBox="0 0 28 28" fill="none"><path d="M7 20c8.5-.2 13.8-5.1 15-14-8.9.4-14.7 4.8-15 14Z" fill="#fff"/><path d="M7 21c3.5-5.7 7.2-8.8 12-11.5" stroke="#facc15" strokeWidth="2" strokeLinecap="round"/></svg></span>LEAF<span className="-ml-2 text-leaf-400">SOLAR</span></Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">{site.sub}</p><div className="mt-5 flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-wider text-white/55"><span className="rounded-md border border-white/10 px-2.5 py-1.5">Fouani Authorized</span><span className="rounded-md border border-white/10 px-2.5 py-1.5">{site.rcNumber}</span></div>
        </div>
        <FooterLinks title="Electronics" links={[["/products?c=Televisions","TVs"],["/products?c=Fridges%20%26%20Freezers","Fridges & freezers"],["/products?c=Air%20Conditioners","Air conditioners"],["/products?c=Washers%20%26%20Dryers","Washers & dryers"],["/products?c=Kitchen%20%26%20Cooking","Kitchen appliances"]]} />
        <FooterLinks title="Power & solar" links={[["/packages","Solar packages"],["/products?d=solar","Solar equipment"],["/products?c=Generators%20%26%20Power","Generators & UPS"],["/solar-calculator","Solar calculator"],["/contact","Site assessment"]]} />
        <FooterLinks title="Customer care" links={[["/contact","Contact & support"],["/shipping-delivery","Shipping & delivery"],["/returns","Returns"],["/warranty","Warranty"],["/solar-installation-policy","Solar installation"],["/privacy","Privacy policy"]]} />
        <div><h2 className="text-sm font-bold text-white">Visit or contact us</h2><address className="mt-4 space-y-3 text-sm not-italic leading-relaxed text-white/50"><p>{site.address}</p><p><a className="font-bold text-white hover:text-leaf-300" href={`tel:${site.phoneHref}`}>{site.phone}</a></p><p><a className="hover:text-white" href={`mailto:${site.email}`}>{site.email}</a></p></address><a href={whatsappUrl()} className="btn mt-5 bg-[#25D366] px-4 py-2.5 text-xs text-white hover:bg-[#20bd5a]">Chat on WhatsApp</a></div>
      </div>

      <div className="border-t border-white/10"><div className="container-wide flex flex-col gap-2 py-5 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Leaf Solar Ltd. All rights reserved. · <Link className="hover:text-white" href="/privacy">Privacy</Link></p><p>Secure Paystack payments · Verified order confirmation · Ibadan-based support</p></div></div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: [string, string][] }) {
  return <div><h2 className="text-sm font-bold text-white">{title}</h2><ul className="mt-4 space-y-2.5 text-sm text-white/45">{links.map(([href,label]) => <li key={href+label}><Link className="transition hover:text-white" href={href}>{label}</Link></li>)}</ul></div>;
}
