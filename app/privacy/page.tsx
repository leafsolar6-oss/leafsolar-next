import { site } from '@/lib/data';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Leaf Solar handles information on leafsolar.ng and in the Leaf Solar Admin Android app.',
};

const sections = [
  {
    title: 'Information we handle',
    body: [
      'Store customers may provide their name, email address, phone number, delivery address and order details when contacting us or checking out. Paystack processes payment credentials directly; Leaf Solar does not receive or store your full card or bank credentials.',
      'The owner-only Leaf Solar Admin app handles the authorized owner email address, short-lived login codes and a secure session cookie. It also displays and updates business catalogue information such as products, prices, availability, stock movements, offers and product images.',
      'Our servers may receive routine technical information needed to operate and protect the service, including IP address, device/browser type, request time and security logs.',
    ],
  },
  {
    title: 'Why we use information',
    body: [
      'We use information to authenticate the authorized administrator, manage inventory, fulfil orders, process and verify payments, arrange delivery, answer support requests, prevent fraud and abuse, maintain business records and comply with applicable legal obligations.',
      'We do not sell personal information. We do not use the Admin app for advertising, cross-app tracking or data-broker activity.',
    ],
  },
  {
    title: 'Service providers',
    body: [
      'We use providers that process information on our behalf to operate the service: Vercel for website hosting and product-image storage, Neon for the managed database, Resend for login and transactional email, and Paystack for payment processing. Their handling of information is also governed by their own terms and privacy notices.',
    ],
  },
  {
    title: 'Retention and security',
    body: [
      'Administrator login codes expire after 10 minutes and signed sessions expire after eight hours. Order, inventory and support records may be kept for as long as reasonably necessary for operations, warranty service, accounting, dispute resolution and legal obligations.',
      'We use encrypted HTTPS connections, restricted administrator access and secure session cookies. No online system can be guaranteed completely secure, so the authorized owner should also protect access to their email account and device.',
    ],
  },
  {
    title: 'Your choices and rights',
    body: [
      'You may ask to access, correct or delete personal information we hold about you, subject to records we must retain for legitimate business or legal reasons. The Admin app is restricted to Leaf Solar’s authorized owner and does not offer public account registration.',
      'To make a privacy request, contact us using the email address below. We may need to verify your identity before completing a request.',
    ],
  },
  {
    title: 'Children and changes',
    body: [
      'Our store and Admin app are not directed to children. We may update this policy when our services or legal obligations change. The current version will remain available on this page with its effective date.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-[#10261a] text-white">
        <div className="container-x py-14 md:py-20">
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-leaf-300">Legal &amp; privacy</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold md:text-6xl">Privacy Policy</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">This policy covers the Leaf Solar website, checkout and owner-only Leaf Solar Admin Android app.</p>
          <p className="mt-4 text-sm font-semibold text-white/50">Effective 14 August 2026</p>
        </div>
      </section>

      <main className="container-x py-14 md:py-20">
        <div className="max-w-3xl">
          <p className="text-lg leading-relaxed text-gray-600">Leaf Solar Ltd (“Leaf Solar”, “we”, “us”) is responsible for the information described in this policy. We operate leafsolar.ng and the Leaf Solar Admin app to sell products, manage inventory and support our customers.</p>
          <div className="mt-12 space-y-12">
            {sections.map(section => (
              <section key={section.title}>
                <h2 className="font-display text-2xl font-extrabold text-gray-950">{section.title}</h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-gray-600">
                  {section.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-14 rounded-3xl bg-[#f5f6f2] p-7 md:p-9">
            <h2 className="font-display text-2xl font-extrabold text-gray-950">Contact us</h2>
            <p className="mt-4 leading-7 text-gray-600">For privacy questions or requests, email <a className="font-bold text-leaf-700 underline" href={`mailto:${site.email}`}>{site.email}</a>, call <a className="font-bold text-leaf-700 underline" href={`tel:${site.phoneHref}`}>{site.phone}</a>, or write to {site.address}.</p>
          </section>
        </div>
      </main>
    </>
  );
}
