export const metadata = { title: 'About' };

export default function About() {
  return (
    <section className="container-x py-14 max-w-4xl">
      <h1 className="font-display text-4xl md:text-5xl font-extrabold">Powering Nigeria, one home at a time.</h1>
      <p className="mt-5 text-lg text-gray-700">
        Leaf Solar Ltd is a Lagos-based clean-energy and home appliances retailer. We design, supply, install and maintain solar systems for homes, estates, and small businesses — and stock the brands Nigerians trust.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          {n:'12,000+',l:'Homes powered'},
          {n:'9 years',l:'In business'},
          {n:'3 cities',l:'Lagos · Abuja · PH'},
        ].map(s => (
          <div key={s.n} className="rounded-2xl bg-gray-50 p-6">
            <div className="font-display text-3xl font-extrabold text-leaf-700">{s.n}</div>
            <div className="text-gray-600 mt-1">{s.l}</div>
          </div>
        ))}
      </div>
      <h2 className="font-display text-2xl font-bold mt-12">What we stand for</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {[
          {t:'Genuine only',d:'We source directly from authorized distributors. Every product has its full manufacturer warranty.'},
          {t:'Engineered properly',d:'Our COREN-registered engineers size every system for your actual load — no overselling, no undersizing.'},
          {t:'After-sales care',d:'A 24/7 support line, on-site maintenance, and spare parts in stock for years after install.'},
          {t:'Affordable plans',d:'Pay-small-small options, partner financing, and trade-in for old inverters and batteries.'},
        ].map(v => (
          <div key={v.t} className="rounded-2xl border p-6">
            <div className="font-bold text-lg">{v.t}</div>
            <p className="mt-2 text-gray-600">{v.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
