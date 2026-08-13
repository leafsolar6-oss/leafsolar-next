export const metadata = { title: 'Mobile banking demo' };

export default function DemoPage() {
  return (
    <section className="container-x py-8">
      <div className="rounded-2xl border border-gray-200 p-6 mb-6 bg-gray-50">
        <h1 className="font-display text-2xl font-extrabold">Wells Fargo Mobile — UI demo</h1>
        <p className="mt-2 text-gray-600 max-w-2xl">
          This is a UI prototype of a mobile banking app. Use <b>jordan.morgan</b> / <b>Wells@2026</b> to sign in.
          A verification code is emailed to the registered inbox and shown on-screen for the demo.
        </p>
        <p className="mt-2 text-sm text-gray-500">Best viewed on a phone. <a className="text-leaf-700 font-semibold" href="/demo/index.html">Open full screen →</a></p>
      </div>
      <div className="flex justify-center">
        <iframe
          src="/demo/index.html"
          title="Banking demo"
          className="h-[820px] w-full max-w-[420px] rounded-[36px] border-[10px] border-gray-900 bg-white shadow-2xl"
        />
      </div>
    </section>
  );
}
