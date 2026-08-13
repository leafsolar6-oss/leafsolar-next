export const metadata = { title: 'Blog' };

const posts = [
  { slug:'how-many-solar-panels', t:'How many solar panels do I need for a 3-bedroom flat in Nigeria?', d:'A simple load-based formula to size your array without oversizing.' },
  { slug:'lithium-vs-tubular', t:'Lithium vs. tubular batteries: which is actually cheaper?', d:'Total cost of ownership over 7 years — the answer may surprise you.' },
  { slug:'deye-hybrid-review', t:'Deye hybrid inverters: 2026 buyer\'s guide', d:'What the specs mean and which size fits loads from 1kVA to 15kVA.' },
];

export default function Blog() {
  return (
    <section className="container-x py-14">
      <h1 className="font-display text-4xl font-extrabold">Solar insights</h1>
      <p className="mt-2 text-gray-600">Honest, practical guides from our engineers.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {posts.map(p => (
          <article key={p.slug} className="rounded-2xl border overflow-hidden hover:shadow-md transition">
            <div className="h-40 bg-gradient-to-br from-leaf-100 to-leaf-500" />
            <div className="p-5">
              <h2 className="font-display font-bold text-lg leading-snug">{p.t}</h2>
              <p className="mt-2 text-sm text-gray-600">{p.d}</p>
              <a className="mt-4 inline-block text-leaf-700 font-semibold text-sm" href="#">Read more →</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
