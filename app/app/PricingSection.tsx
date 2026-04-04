import UpgradeButton from "./UpgradeButton";

export default function PricingSection() {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
          Instabels Pro
        </div>

        <h2 className="text-3xl font-black tracking-tight text-slate-950">
          Choose the plan that fits your team
        </h2>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Unlock unlimited sheets, premium templates, advanced design tools,
          and professional print formatting for catering, restaurants, and
          events.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="relative rounded-[2rem] border-2 border-cyan-300 bg-[linear-gradient(to_bottom,#f7fdff_0%,#ffffff_100%)] p-6 shadow-sm">
          <div className="absolute right-5 top-5 rounded-full bg-cyan-600 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white">
            Most Popular
          </div>

          <div className="mb-5">
            <h3 className="text-2xl font-black text-slate-950">Pro Monthly</h3>
            <p className="mt-2 text-sm text-slate-600">
              Best for most users who want flexibility.
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black tracking-tight text-slate-950">
                $49.99
              </span>
              <span className="pb-1 text-sm font-medium text-slate-500">
                / month
              </span>
            </div>
          </div>

          <div className="mb-6 space-y-3 text-sm text-slate-700">
            <div>✓ Unlimited label sheets</div>
            <div>✓ Premium templates</div>
            <div>✓ Advanced design tools</div>
            <div>✓ Professional print formatting</div>
            <div>✓ Menu import + Chef Bot tools</div>
          </div>

          <UpgradeButton billingCycle="monthly" />
        </div>

        <div className="relative rounded-[2rem] border border-slate-200 bg-[linear-gradient(to_bottom,#fafcff_0%,#ffffff_100%)] p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-2xl font-black text-slate-950">Pro Annual</h3>
            <p className="mt-2 text-sm text-slate-600">
              Ideal for teams and venues ready to commit for the year.
            </p>
          </div>

          <div className="mb-2">
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black tracking-tight text-slate-950">
                $550
              </span>
              <span className="pb-1 text-sm font-medium text-slate-500">
                / year
              </span>
            </div>
          </div>

          <div className="mb-6 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
            Save vs monthly billing
          </div>

          <div className="mb-6 space-y-3 text-sm text-slate-700">
            <div>✓ Everything in Pro Monthly</div>
            <div>✓ Simpler annual budgeting</div>
            <div>✓ Better fit for business accounts</div>
            <div>✓ Great for hotels, venues, and caterers</div>
            <div>✓ Same full Pro access</div>
          </div>

          <UpgradeButton billingCycle="annual" />
        </div>
      </div>
    </section>
  );
}