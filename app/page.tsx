import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "Create polished labels fast",
    description:
      "Turn event menus into elegant buffet labels in minutes with a workflow built for hospitality speed.",
  },
  {
    title: "Save every sheet",
    description:
      "Keep event setups organized and return to them anytime from your private Instabels Workspace.",
  },
  {
    title: "Customize every detail",
    description:
      "Adjust colors, fonts, logos, allergens, and layouts without rebuilding from scratch.",
  },
  {
    title: "Print-ready by design",
    description:
      "Use Avery-friendly layouts and PDF-friendly printing with confidence.",
  },
  {
    title: "Made for real operations",
    description:
      "Built for caterers, banquet teams, wedding venues, resorts, and hospitality groups.",
  },
  {
    title: "Autosave built in",
    description:
      "Changes save in the background so your team can move quickly without losing work.",
  },
];

const industries = [
  "Hotels & Resorts",
  "Wedding Venues",
  "Catering Companies",
  "Banquet Teams",
  "Private Clubs",
  "Corporate Events",
];

const faqItems = [
  {
    question: "Can I save my label sheets and reopen them later?",
    answer:
      "Yes. Every sheet is saved to your account so you can reopen, edit, duplicate, and print it again whenever needed.",
  },
  {
    question: "Can I add logos and branding?",
    answer:
      "Yes. You can upload your logo, position it on the labels, and save that branding setup with the sheet.",
  },
  {
    question: "Does it support allergens and dietary notes?",
    answer:
      "Yes. Each label can include dietary and allergen information, and those selections are saved with the sheet.",
  },
  {
    question: "Can I print directly or save as PDF?",
    answer:
      "Yes. The workflow is built around print-ready output, including Avery-friendly layouts and PDF-friendly printing.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.20),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.15),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#020617_0%,#0f172a_40%,#ffffff_100%)]" />
      </div>

      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 pt-6 lg:px-8">
          <header className="mb-16 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-8 py-4 shadow-2xl shadow-cyan-500/5 backdrop-blur-xl">
  <Link href="/" className="flex items-center gap-4">
    <Image
      src="/logo-light.svg"
      alt="Instabels"
      width={220}
      height={56}
      priority
      className="block h-12 w-auto"
    />
  </Link>

  <nav className="flex items-center gap-3">
    <Link
      href="/login"
      className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
    >
      Sign in
    </Link>

    <Link
      href="/signup"
      className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-slate-100"
    >
      Start free
    </Link>
  </nav>
</header>

          <div className="grid items-center gap-16 pb-20 lg:grid-cols-[1.08fr_.92fr]">
            <div>
              <div className="mb-6 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 backdrop-blur">
                Meet Instabels — built for caterers, resorts, wedding venues, banquet teams, and hospitality groups
              </div>

              <h1 className="max-w-5xl text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">
                <span className="block">Instabels makes</span>
                <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
                  buffet labels feel premium.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                Create, save, edit, and print polished buffet labels from one
                beautiful workspace. Instabels is built for hospitality teams
                that need fast output without sacrificing presentation.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-7 py-3.5 text-base font-semibold text-white shadow-2xl shadow-cyan-500/30 transition hover:scale-[1.02]"
                >
                  Start with Instabels
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Sign in
                </Link>
              </div>

              <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-cyan-500/5 backdrop-blur">
                  <p className="text-3xl font-black text-white">Fast</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Build label sheets in minutes
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-violet-500/5 backdrop-blur">
                  <p className="text-3xl font-black text-white">Saved</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Reopen and reuse your work anytime
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-cyan-500/5 backdrop-blur">
                  <p className="text-3xl font-black text-white">Print-ready</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Avery-friendly layouts and PDF export
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-r from-cyan-400/20 via-sky-400/10 to-violet-500/20 blur-3xl" />

              <div className="relative rounded-[2.25rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
                <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Instabels Workspace
                      </p>
                      <p className="text-xs text-slate-400">
                        Wedding Buffet Labels · Saved at 3:42 PM
                      </p>
                    </div>

                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      Autosaved
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Chicken Marsala",
                      "Roasted Potatoes",
                      "Caesar Salad",
                      "Grilled Vegetables",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur"
                      >
                        <div
                          className={`mb-3 h-6 w-16 rounded-full ${
                            index % 2 === 0
                              ? "bg-cyan-400/20"
                              : "bg-violet-400/20"
                          }`}
                        />
                        <p className="text-base font-semibold text-white">
                          {item}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Print-ready label
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">
                        Saved sheets
                      </p>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-slate-300">
                        12 saved sheets
                      </span>
                    </div>

                    <div className="space-y-2">
                      {[
                        "Italian Dinner Labels",
                        "Resort Breakfast Buffet",
                        "Corporate Lunch Menu",
                      ].map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-200"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-6 -top-6 hidden rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-xl backdrop-blur xl:block">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Built for teams
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Save • Edit • Print • Reuse
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-white text-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
              Why Instabels
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              Built for the way hospitality teams actually work
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Instabels is designed to reduce busywork and help your team
              produce consistent, polished labels faster.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-lg ${
                    index % 3 === 0
                      ? "bg-gradient-to-br from-cyan-400 to-sky-500"
                      : index % 3 === 1
                      ? "bg-gradient-to-br from-violet-500 to-fuchsia-500"
                      : "bg-gradient-to-br from-slate-800 to-slate-900"
                  }`}
                >
                  ✦
                </div>
                <h3 className="text-xl font-bold text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.10),transparent_30%)]" />
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                Perfect for
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
                Teams that need labels done right every time
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Whether you’re preparing a wedding buffet, hotel breakfast,
                resort service, banquet event, or corporate lunch, Instabels
                helps your staff move faster while keeping the final presentation
                clean and professional.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {industries.map((useCase, index) => (
                <div
                  key={useCase}
                  className={`rounded-2xl border p-5 shadow-sm ${
                    index % 2 === 0
                      ? "border-cyan-200 bg-white"
                      : "border-violet-200 bg-white"
                  }`}
                >
                  <p className="font-semibold text-slate-900">{useCase}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
              Pricing
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              Simple pricing for teams using Instabels
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Start free, then upgrade to Instabels Pro when you’re ready to
              use it across real events and services.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-5 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Instabels
              </div>

              <h3 className="text-2xl font-bold text-slate-950">
                Start free
              </h3>

              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-black tracking-tight text-slate-950">
                  $0
                </span>
                <span className="pb-1 text-sm text-slate-500">
                  to get started
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                Explore the workflow, create label sheets, and experience the
                editor before moving to a paid plan.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "Create and save buffet label sheets",
                  "Edit titles, menu items, allergens, and styles",
                  "Print and save as PDF",
                  "Ideal for testing your workflow",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    {feature}
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Start free
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-900 bg-slate-950 p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.30),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.20),transparent_35%)]" />
              <div className="relative">
                <div className="absolute right-0 top-0 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-100">
                  Recommended
                </div>

                <div className="mb-5 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-100">
                  Instabels Pro
                </div>

                <h3 className="text-2xl font-bold">For active teams</h3>

                <div className="mt-4 flex items-end gap-2">
                  <span className="text-5xl font-black tracking-tight">$49.99</span>
                  <span className="pb-1 text-sm text-slate-300">/ month</span>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Built for caterers, banquet teams, hotels, and venues
                  creating labels regularly for live service and events.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    "Everything in the free plan",
                    "Unlimited saved sheets",
                    "Full editor workflow with autosave",
                    "Logo, styling, allergen, and print support",
                    "Ready for real hospitality operations",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100"
                    >
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Link
                    href="/signup"
                    className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Start Instabels Pro
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm md:p-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_.95fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
                  Frequently asked
                </p>
                <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
                  Common questions before you get started
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Everything you need to know before bringing Instabels into
                  your workflow.
                </p>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <h3 className="text-base font-semibold text-slate-900">
                      {item.question}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
          <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-500 p-[1px] shadow-2xl shadow-cyan-500/20">
            <div className="rounded-[2.45rem] bg-slate-950 px-8 py-12 text-white md:px-12">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  Ready to launch faster?
                </p>
                <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                  Start building beautiful buffet labels with Instabels.
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-300">
                  Create your account, save your sheets, and print professional
                  labels for your next service or event.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-base font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Create Instabels account
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

<footer className="border-t border-slate-200 bg-white text-slate-500">
  <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm md:flex-row md:items-center md:justify-between lg:px-8">
    
    <p>© 2026 Instabels. All rights reserved.</p>

    <div className="flex items-center gap-5">
      <Link href="/terms" className="transition hover:text-slate-900">
        Terms
      </Link>

      <Link href="/privacy" className="transition hover:text-slate-900">
        Privacy
      </Link>

      <Link href="/contact" className="transition hover:text-slate-900">
        Contact
      </Link>
    </div>

  </div>
</footer>
    </main>
  );
}