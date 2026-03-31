export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-800">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="mb-3 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Contact
          </p>

          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            Contact Instabels
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            For support, billing questions, feature requests, or general inquiries,
            please email us directly.
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                Email
              </div>
              <a
                href="mailto:Tbcbusiness127@gmail.com"
                className="mt-2 inline-block text-lg font-semibold text-slate-900 hover:text-cyan-700"
              >
                Tbcbusiness127@gmail.com
              </a>
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                Response time
              </div>
              <p className="mt-2 text-slate-700">
                We usually respond within 1–2 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}