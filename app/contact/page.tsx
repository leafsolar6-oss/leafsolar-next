import ContactForm from './ContactForm';

export const metadata = { title: 'Contact' };

export default function Contact({ searchParams }: { searchParams: { pkg?: string } }) {
  return (
    <section className="container-x py-14 grid gap-10 md:grid-cols-5">
      <div className="md:col-span-2">
        <h1 className="font-display text-4xl font-extrabold">Let&apos;s talk</h1>
        <p className="mt-3 text-gray-600">Send us a message and an engineer will get back to you within one business hour.</p>
        <div className="mt-8 space-y-5 text-gray-800">
          <div><b>Sales</b><br/><a className="text-leaf-700" href="tel:+2348000000000">0800 LEAF SOLAR</a></div>
          <div><b>WhatsApp</b><br/><a className="text-leaf-700" href="https://wa.me/2348000000000">+234 800 000 0000</a></div>
          <div><b>Email</b><br/><a className="text-leaf-700" href="mailto:hello@leafsolar.ng">hello@leafsolar.ng</a></div>
          <div><b>Showrooms</b><br/>Lagos · Abuja · Port Harcourt</div>
        </div>
      </div>
      <div className="md:col-span-3">
        <ContactForm initialPkg={searchParams.pkg || ''} />
      </div>
    </section>
  );
}
