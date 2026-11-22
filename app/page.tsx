import Image from "next/image";
import Link from "next/link";
import HeroDemo from "./_landing/HeroDemo";
import LabelCard, { LABEL_THEMES, type LabelThemeId } from "./_landing/LabelCard";
import MenuPreview from "./_landing/MenuPreview";
import { BrandTile, Eyebrow, LogoMark, Sparkle } from "./_landing/Brand";

const quickLinks = [
  { href: "#designs", icon: "🏷️", label: "Buffet labels" },
  { href: "#menus", icon: "🍽️", label: "Plated menus" },
  { href: "#chef-bot", icon: "🧑‍🍳", label: "Allergen check" },
  { href: "#teams", icon: "🖨️", label: "Quick Print" },
  { href: "#teams", icon: "👥", label: "Team workspace" },
];

const showcase: { theme: LabelThemeId; name: string; ingredients: string; tags: string[] }[] = [
  { theme: "elegant", name: "Seared Salmon", ingredients: "lemon beurre blanc, fresh dill", tags: ["Gluten Free", "Contains Dairy"] },
  { theme: "rustic", name: "Braised Short Rib", ingredients: "red wine jus, root vegetables", tags: ["Gluten Free"] },
  { theme: "corporate", name: "Penne Vodka", ingredients: "san marzano tomato, cream, basil", tags: ["Vegetarian", "Contains Gluten", "Contains Dairy"] },
  { theme: "holiday", name: "Assorted Pastries", ingredients: "chef's daily selection", tags: ["Contains Gluten", "Contains Eggs", "Contains Nuts"] },
  { theme: "minimal", name: "Garden Salad", ingredients: "mixed greens, champagne vinaigrette", tags: ["Vegan", "Gluten Free"] },
  { theme: "classic", name: "Chicken Milanese", ingredients: "arugula, parmigiano reggiano", tags: ["Contains Gluten", "Contains Dairy", "Contains Eggs"] },
];

const steps = [
  {
    title: "Add your menu",
    body: "Type your dishes, or upload a PDF or Word menu and Instabels pulls the items in for you.",
  },
  {
    title: "Check allergens & style it",
    body: "Let Chef Bot flag allergens and dietary notes, then pick a design, fonts, colors and your logo.",
  },
  {
    title: "Print & reuse",
    body: "Print on Avery-friendly label sheets or save as PDF. Every sheet is saved for the next event.",
  },
];

const customers = [
  {
    name: "Crystal Springs Resort",
    location: "Hamburg, New Jersey",
    logo: "/Crystal_Springs_Resort_Logo.png",
    photo: "/crystal-springs-property.jpg",
    fact: "Used to create and manage every buffet label at the 2026 New Jersey Beer & Food Festival.",
  },
  {
    name: "Montammy Golf Country Club",
    location: "Alpine, New Jersey",
    logo: "/montammy-logo.png",
    photo: "/montammy-property.jpg",
    fact: "Keeps member dining, private event and banquet labels consistent and ready at a moment's notice.",
  },
];

const faqItems = [
  {
    question: "What are the limits on the free plan?",
    answer:
      "The free plan includes up to 3 saved label sheets with up to 20 labels per sheet. You can edit food names, allergens, dietary tags, and print or export to PDF at no cost.",
  },
  {
    question: "Can I save my label sheets and reopen them later?",
    answer:
      "Yes. Every sheet is saved to your account so you can reopen, edit, duplicate, and print it again whenever needed.",
  },
  {
    question: "What is the Plated Menu Builder?",
    answer:
      "A Pro feature for printed dinner menus. Click each course and pick dishes from your team's dish library, add your client's name, date and logo, choose fonts and borders, and print two menus per letter page, ready to cut.",
  },
  {
    question: "Can I add logos and branding?",
    answer:
      "Yes, on the Pro plan. You can upload your logo, position it on the labels, and save that branding setup with the sheet.",
  },
  {
    question: "Does it support allergens and dietary notes?",
    answer:
      "Yes. Each label can include dietary and allergen information, and those selections are saved with the sheet. Pro users can also run Chef Bot to automatically scan and suggest allergen flags across an entire sheet.",
  },
  {
    question: "Can my team share label sheets?",
    answer:
      "Yes, on the Pro plan. You can create an organization, invite team members by email, and share sheets across your entire team from one workspace.",
  },
  {
    question: "Can I print directly or save as PDF?",
    answer:
      "Yes. The workflow is built around print-ready output, including Avery-friendly layouts and PDF-friendly printing.",
  },
];

const plans = [
  {
    badge: "Instabels",
    name: "Start free",
    price: "$0",
    period: "to get started",
    blurb: "Get started at no cost and explore the full editor before committing to a plan.",
    features: [
      "Up to 3 saved label sheets",
      "Up to 20 labels per sheet",
      "Edit food names, allergens & dietary tags",
      "Print-ready output & PDF export",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    badge: "Most popular",
    name: "Pro Monthly",
    price: "$49.99",
    period: "/ month",
    blurb: "Built for caterers, banquet teams, hotels, and venues creating labels regularly for live service and events.",
    features: [
      "Everything in Free",
      "Unlimited saved sheets & labels",
      "Plated Menu Builder — click-to-build dinner menus",
      "Upload Menu — import from PDF or Word",
      "Chef Bot — AI allergen & dietary analysis",
      "Quick Print — search & print across all sheets",
      "Sheet Comments — leave notes inside the editor",
      "Custom logo upload & branding",
      "Team accounts with member invites",
    ],
    cta: "Get started monthly",
    highlight: true,
  },
  {
    badge: "Save vs monthly",
    name: "Pro Annual",
    price: "$550",
    period: "/ year",
    blurb: "Ideal for hotels, venues, and catering companies ready to commit for the year and simplify their billing.",
    features: [
      "Everything in Pro Monthly",
      "~$50 savings vs monthly billing",
      "Simplified annual budgeting",
      "Perfect for business accounts & invoicing",
      "Ideal for hotels, venues & caterers",
    ],
    cta: "Get started annually",
    highlight: false,
  },
];

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">{title}</h2>
      {body && <p className="mt-4 text-lg leading-8 text-slate-600">{body}</p>}
    </div>
  );
}

function Check() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-8">
          <Link href="/" aria-label="Instabels home">
            <Image src="/logo-dark.svg" alt="Instabels" width={180} height={33} priority className="h-10 w-auto" />
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-600 md:flex">
            <a href="#designs" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900">Designs</a>
            <a href="#menus" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900">Plated menus</a>
            <a href="#pricing" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900">Pricing</a>
            <a href="#faq" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900">FAQ</a>
            <Link href="/shop" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900">Shop</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="whitespace-nowrap rounded-full px-3 sm:px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="whitespace-nowrap rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 px-4 py-2.5 sm:px-5 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition hover:brightness-110"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="px-3 pt-3 sm:px-4">
        {/* Styled like the logo tile: pale cyan→violet wash inside a thin gradient stroke. */}
        <div className="mx-auto max-w-[1400px] rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-purple-500 p-[1.5px] shadow-[0_30px_80px_rgba(168,85,247,0.12)]">
          <div className="relative overflow-hidden rounded-[calc(2.5rem-1.5px)] bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_45%,#f5f3ff_100%)] px-6 pb-16 pt-14 sm:px-10 lg:px-16 lg:pt-20">
            <LogoMark gradientId="hero-mark-a" className="pointer-events-none absolute -right-20 -top-12 h-96 w-96 rotate-12 opacity-[0.13]" />
            <LogoMark gradientId="hero-mark-b" className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 -rotate-12 opacity-[0.1]" />
            <Sparkle className="pointer-events-none absolute left-[10%] top-20 h-5 w-5 text-cyan-400/70" />
            <Sparkle className="pointer-events-none absolute right-[14%] top-[42%] h-4 w-4 text-purple-400/70" />
            <Sparkle className="pointer-events-none absolute bottom-16 left-[46%] h-3 w-3 text-cyan-400/60" />

            <div className="relative mx-auto max-w-6xl">
              <div className="mx-auto max-w-3xl text-center">
                <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
                  <LogoMark gradientId="hero-chip" className="h-7 w-7" />
                  Buffet labels &amp; plated menus for hospitality teams
                </p>
                <h1 className="mt-6 text-5xl font-black leading-[1.02] tracking-tight text-slate-950 md:text-7xl">
                  What are you{" "}
                  <span className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">serving</span>{" "}
                  today?
                </h1>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                  Type a dish and watch it become a print-ready buffet label. Then build the whole sheet,
                  and your plated dinner menus, in minutes.
                </p>
              </div>

              <div className="mt-12">
                <HeroDemo />
              </div>
            </div>
          </div>
        </div>

        {/* Quick links, like category shortcuts */}
        <div className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-3 px-3">
          {quickLinks.map((q) => (
            <a
              key={q.label}
              href={q.href}
              className="group flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-2 pl-2 pr-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#ecfeff,#f5f3ff)] text-lg ring-1 ring-violet-200">
                {q.icon}
              </span>
              {q.label}
            </a>
          ))}
        </div>
      </section>

      {/* ── Customers strip ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 pt-16 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Trusted by New Jersey hospitality teams</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
          {customers.map((c) => (
            <Image key={c.name} src={c.logo} alt={c.name} width={160} height={64} className="h-12 w-auto object-contain opacity-80" />
          ))}
        </div>
      </section>

      {/* ── Design showcase ─────────────────────────────────────────── */}
      <section id="designs" className="scroll-mt-24 py-24">
        <div className="px-6">
          <SectionHeading
            eyebrow="Designs"
            title="Start from a design you love"
            body="Classic, elegant, rustic or modern. Pick a look, make it yours with your fonts, colors and logo, and every label on the sheet follows."
          />
        </div>

        {/* w-max + mx-auto centres the row when it fits and scrolls from the first card when it doesn't. */}
        <div className="mt-14 snap-x overflow-x-auto pb-6">
          <div className="mx-auto flex w-max gap-6 px-6 lg:px-8">
          {showcase.map((item, i) => (
            <figure
              key={item.name}
              className={`w-72 shrink-0 snap-center rounded-[1.75rem] bg-gradient-to-br p-5 ring-1 ring-violet-100 ${
                ["from-cyan-50 to-violet-100", "from-violet-50 to-cyan-100"][i % 2]
              }`}
            >
              <LabelCard name={item.name} ingredients={item.ingredients} tags={item.tags} theme={item.theme} className="shadow-lg" />
              <figcaption className="mt-4 text-sm font-bold text-slate-700">{LABEL_THEMES[item.theme].name}</figcaption>
            </figure>
          ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section className="bg-[#f7f9fe] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading eyebrow="How it works" title="From menu to printed labels in three steps" />
          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200/70">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ecfeff,#f5f3ff)] ring-1 ring-violet-200">
                  <span className="bg-gradient-to-br from-cyan-500 to-purple-500 bg-clip-text text-xl font-black text-transparent">{i + 1}</span>
                  <Sparkle className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 text-purple-400" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Spotlight: Plated menus ─────────────────────────────────── */}
      <section id="menus" className="scroll-mt-24 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1fr_1.25fr] lg:px-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              <Sparkle className="h-3 w-3" /> New · Pro
            </span>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">Plated dinner menus, in a few clicks</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Click a course and pick from your team&apos;s dish library. Add the client&apos;s name, date and logo, choose
              fonts, dividers and borders, and print two menus per page, perfectly centered for cutting.
            </p>
            <ul className="mt-6 space-y-3 text-sm font-medium text-slate-700">
              {[
                "Dish library shared across your team, organized by menu type",
                "Group logos, six fonts, dividers and borders",
                "Every menu saved, ready to duplicate for the next event",
              ].map((point) => (
                <li key={point} className="flex gap-2.5">
                  <Check />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          {/* min-w-0: the scaled 11in sheet inside must not set this column's minimum width. */}
          <BrandTile className="min-w-0" innerClassName="p-4 sm:p-8">
            <div className="overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/5">
              <MenuPreview design={{ border: "inset", courseDivider: "dots" }} />
            </div>
          </BrandTile>
        </div>
      </section>

      {/* ── Spotlight: Chef Bot ─────────────────────────────────────── */}
      <section id="chef-bot" className="scroll-mt-24 bg-[#f7f9fe] py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8">
          <div className="order-2 lg:order-1">
            <BrandTile className="mx-auto max-w-lg" innerClassName="p-8 sm:p-10">
            <div className="relative">
              <LabelCard
                name="Penne alla Vodka"
                ingredients="san marzano tomato, cream, parmesan"
                tags={["Vegetarian", "Contains Gluten", "Contains Dairy"]}
                theme="classic"
                className="shadow-2xl"
              />
              <div className="absolute -right-4 -top-6 rounded-2xl bg-white px-4 py-3 text-sm shadow-xl ring-1 ring-slate-200 sm:-right-10">
                <p className="font-bold text-slate-900">🧑‍🍳 Chef Bot</p>
                <p className="mt-0.5 text-xs text-slate-500">Found: dairy, gluten · Vegetarian</p>
              </div>
            </div>
            </BrandTile>
          </div>
          <div className="order-1 lg:order-2">
            <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-700">Pro</span>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">Allergens checked in one click</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Chef Bot scans the ingredients across your whole sheet and suggests allergen and dietary flags, so
              your team can review them instead of starting from scratch.
            </p>
          </div>
        </div>
      </section>

      {/* ── Spotlight: Teams & Quick Print ──────────────────────────── */}
      <section id="teams" className="scroll-mt-24 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
          <div>
            <span className="inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-700">Pro</span>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">One workspace for the whole kitchen</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Invite your team, share every sheet and menu, and leave notes right inside the editor. Need three labels
              for tonight? Quick Print finds them across all your sheets and prints them on one page.
            </p>
          </div>
          <BrandTile innerClassName="p-6 sm:p-8">
            <div className="space-y-3 rounded-2xl bg-white p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Sunday Brunch Buffet</p>
                <div className="flex -space-x-2">
                  {["bg-cyan-500", "bg-violet-500", "bg-slate-800"].map((c, i) => (
                    <span key={c} className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white ${c}`}>
                      {["JM", "AR", "KL"][i]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Chef:</span> Swap the quiche for the frittata, it&apos;s gluten free.
              </div>
              <div className="ml-8 rounded-xl bg-violet-50 px-4 py-3 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Banquet captain:</span> Updated and reprinted ✓
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
                🔍 Quick Print: <span className="font-semibold text-slate-700">&quot;frittata&quot;</span>
              </div>
            </div>
          </BrandTile>
        </div>
      </section>

      {/* ── Customers ───────────────────────────────────────────────── */}
      <section className="bg-[#f7f9fe] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading eyebrow="Customers" title="Used where presentation matters" />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {customers.map((c) => (
              <article key={c.name} className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200/70">
                <div className="relative h-48">
                  <Image src={c.photo} alt={c.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="flex items-start gap-4 p-7">
                  <Image src={c.logo} alt="" width={96} height={48} className="h-11 w-auto shrink-0 object-contain" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">{c.name}</h3>
                    <p className="text-xs font-medium text-slate-400">{c.location}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{c.fact}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────── */}
      <section id="pricing" className="scroll-mt-24 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple pricing for teams using Instabels"
            body="Start free, then upgrade to Instabels Pro when you're ready to use it across real events and services."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col overflow-hidden rounded-[2rem] p-8 ${
                  plan.highlight
                    ? "bg-slate-950 text-white shadow-2xl shadow-violet-500/20 ring-2 ring-purple-400/60"
                    : "bg-white ring-1 ring-slate-200"
                }`}
              >
                {plan.highlight && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.35),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.25),transparent_45%)]" />
                    <LogoMark gradientId="pricing-mark" className="pointer-events-none absolute -bottom-10 -right-10 h-44 w-44 opacity-20" />
                  </>
                )}
                <div className="relative flex flex-1 flex-col">
                  <span
                    className={`self-start rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      plan.highlight ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {plan.badge}
                  </span>
                  <h3 className="mt-5 text-2xl font-bold">{plan.name}</h3>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                    <span className={`pb-1 text-sm ${plan.highlight ? "text-slate-300" : "text-slate-500"}`}>{plan.period}</span>
                  </div>
                  <p className={`mt-4 text-sm leading-7 ${plan.highlight ? "text-slate-300" : "text-slate-600"}`}>{plan.blurb}</p>
                  <ul className="mt-6 flex-1 space-y-3 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2.5">
                        {plan.highlight ? <Sparkle className="mt-1 h-3 w-3 shrink-0 text-cyan-300" /> : <Check />}
                        <span className={plan.highlight ? "text-slate-100" : "text-slate-700"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition ${
                      plan.highlight
                        ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-white hover:brightness-110"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section id="faq" className="scroll-mt-24 bg-[#f7f9fe] py-24">
        <div className="mx-auto max-w-3xl px-6">
          <SectionHeading eyebrow="FAQ" title="Common questions" />
          <div className="mt-12 space-y-3">
            {faqItems.map((item) => (
              <details key={item.question} className="group rounded-2xl bg-white px-6 py-5 shadow-sm ring-1 ring-slate-200/70">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                  {item.question}
                  <span className="text-xl text-violet-500 transition group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-slate-500">
            Still have a question? Email{" "}
            <span className="select-all font-semibold text-slate-800">tbcbusiness127@gmail.com</span>, we typically
            respond within one business day.
          </p>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <section className="px-3 py-16 sm:px-4">
        <div className="mx-auto max-w-[1400px] rounded-[2.5rem] bg-gradient-to-r from-cyan-400 to-purple-500 p-[1.5px] shadow-2xl shadow-violet-500/20">
          <div className="relative overflow-hidden rounded-[calc(2.5rem-1.5px)] bg-slate-950 px-6 py-16 text-center text-white sm:px-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.28),transparent_40%)]" />
            <LogoMark gradientId="cta-mark" className="pointer-events-none absolute -right-12 -top-16 h-72 w-72 rotate-12 opacity-20" />
            <div className="relative">
              <Image src="/logo-light.svg" alt="Instabels" width={220} height={40} className="mx-auto h-12 w-auto" />
              <h2 className="mt-8 text-4xl font-black tracking-tight md:text-5xl">
                Your next event deserves{" "}
                <span className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">better labels.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
                Create your account, save your sheets, and print professional labels and menus for your next service.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-violet-500/30 transition hover:brightness-110"
                >
                  Start free
                </Link>
                <Link href="/login" className="rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-base font-bold text-white transition hover:bg-white/10">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white text-slate-500">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <Image src="/logo-dark.svg" alt="Instabels" width={170} height={31} className="h-9 w-auto" />
              <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
                Professional buffet labels and plated menus for hospitality teams.
              </p>
            </div>

            <div className="flex flex-wrap gap-10 text-sm">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Product</p>
                <Link href="/signup" className="transition hover:text-slate-900">Get started free</Link>
                <Link href="/login" className="transition hover:text-slate-900">Sign in</Link>
                <a href="#pricing" className="transition hover:text-slate-900">Pricing</a>
                <Link href="/shop" className="transition hover:text-slate-900">Shop supplies</Link>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Support</p>
                <Link href="/contact" className="transition hover:text-slate-900">Contact us</Link>
                <Link href="/login" className="transition hover:text-slate-900">Dashboard</Link>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Legal</p>
                <Link href="/terms" className="transition hover:text-slate-900">Terms</Link>
                <Link href="/privacy" className="transition hover:text-slate-900">Privacy</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-100 pt-6 text-xs text-slate-400">
            © {new Date().getFullYear()} Instabels. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
