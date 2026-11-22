import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrandTile, Eyebrow, LogoMark, Sparkle } from "../_landing/Brand";
import { AMAZON_ASSOCIATE_TAG, SHOP_SECTIONS, amazonSearchUrl, type SheetLayout } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Shop Supplies | Instabels",
  description: "Label sheets, menu cardstock and display supplies that work with Instabels.",
};

/** A letter page (8.5 × 11) with the product's layout drawn on it. */
function SheetDiagram({ layout }: { layout: SheetLayout }) {
  const page = { width: 8.5, height: 11 };
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  let cells: { x: number; y: number; w: number; h: number }[] = [];
  if (layout.kind === "labels") {
    const gridW = layout.columns * layout.labelWidth;
    const gridH = layout.rows * layout.labelHeight;
    const x0 = (page.width - gridW) / 2;
    const y0 = (page.height - gridH) / 2;
    for (let r = 0; r < layout.rows; r++) {
      for (let c = 0; c < layout.columns; c++) {
        cells.push({ x: x0 + c * layout.labelWidth, y: y0 + r * layout.labelHeight, w: layout.labelWidth, h: layout.labelHeight });
      }
    }
  } else if (layout.kind === "single-card") {
    cells = [{ x: (page.width - 3.5) / 2, y: (page.height - 2) / 2, w: 3.5, h: 2 }];
  }

  const landscape = layout.kind === "menu-halves";
  return (
    <div
      className="relative mx-auto bg-white shadow-md ring-1 ring-slate-200"
      style={{ aspectRatio: landscape ? "11 / 8.5" : "8.5 / 11", height: landscape ? "auto" : "7.5rem", width: landscape ? "9.5rem" : "auto" }}
      aria-hidden="true"
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          className="absolute rounded-[2px] border border-violet-300 bg-gradient-to-br from-cyan-50 to-violet-50"
          style={{ left: pct(cell.x, page.width), top: pct(cell.y, page.height), width: pct(cell.w, page.width), height: pct(cell.h, page.height) }}
        />
      ))}
      {landscape && (
        <>
          {[0, 1].map((half) => (
            <div key={half} className="absolute top-[14%] flex w-[36%] flex-col items-center gap-[6%]" style={{ left: half ? "57%" : "7%" }}>
              <span className="h-1 w-3/4 rounded-full bg-violet-300" />
              <span className="h-0.5 w-1/2 rounded-full bg-cyan-300" />
              <span className="mt-1 h-0.5 w-2/3 rounded-full bg-slate-300" />
              <span className="h-0.5 w-1/2 rounded-full bg-slate-300" />
              <span className="mt-1 h-0.5 w-2/3 rounded-full bg-slate-300" />
              <span className="h-0.5 w-1/2 rounded-full bg-slate-300" />
            </div>
          ))}
          <div className="absolute inset-y-1 left-1/2 border-l border-dashed border-slate-400" />
        </>
      )}
    </div>
  );
}

export default function ShopPage() {
  const tagged = Boolean(AMAZON_ASSOCIATE_TAG);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-8">
          <Link href="/" aria-label="Instabels home">
            <Image src="/logo-dark.svg" alt="Instabels" width={180} height={33} priority className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-4">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="whitespace-nowrap rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition hover:brightness-110 sm:px-5"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-3 pt-3 sm:px-4">
        <div className="mx-auto max-w-[1400px] rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-purple-500 p-[1.5px]">
          <div className="relative overflow-hidden rounded-[calc(2.5rem-1.5px)] bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_45%,#f5f3ff_100%)] px-6 py-14 text-center sm:px-10">
            <LogoMark gradientId="shop-mark" className="pointer-events-none absolute -right-16 -top-10 h-72 w-72 rotate-12 opacity-[0.12]" />
            <Sparkle className="pointer-events-none absolute left-[12%] top-12 h-5 w-5 text-cyan-400/70" />
            <div className="relative mx-auto max-w-2xl">
              <Eyebrow>Shop supplies</Eyebrow>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                Paper that prints{" "}
                <span className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">perfectly</span>
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Every sheet and supply here matches an Instabels print format, so your labels and menus line up the first time.
              </p>
              <nav className="mt-8 flex flex-wrap justify-center gap-2">
                {SHOP_SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-white"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Product sections */}
      {SHOP_SECTIONS.map((section, sectionIndex) => (
        <section key={section.id} id={section.id} className={`scroll-mt-24 py-16 ${sectionIndex % 2 ? "bg-[#f7f9fe]" : ""}`}>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-black tracking-tight text-slate-950">{section.title}</h2>
              <p className="mt-2 text-slate-600">{section.blurb}</p>
            </div>

            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {section.products.map((product) => (
                <li key={product.name} className="flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-slate-200/80">
                  <div className="flex h-44 items-center justify-center bg-[linear-gradient(135deg,#ecfeff,#f5f3ff)]">
                    {product.layout ? (
                      <SheetDiagram layout={product.layout} />
                    ) : (
                      <span className="text-6xl" aria-hidden="true">
                        {product.icon}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700 ring-1 ring-violet-100">
                      <Sparkle className="h-3 w-3" /> Works with {product.worksWith}
                    </span>
                    <h3 className="mt-4 text-xl font-bold text-slate-950">{product.name}</h3>
                    <p className="text-sm font-semibold text-slate-400">{product.detail}</p>
                    <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{product.description}</p>
                    <a
                      href={amazonSearchUrl(product.search)}
                      target="_blank"
                      rel={tagged ? "noopener noreferrer sponsored" : "noopener noreferrer"}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      View on Amazon
                      <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      {/* Printing tips */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <BrandTile innerClassName="p-8 sm:p-10">
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Print perfectly every time</h2>
            <ul className="mt-5 grid gap-4 text-sm leading-6 text-slate-700 sm:grid-cols-2">
              {[
                ["Scale 100%", "Choose “Actual size” or 100% in the print dialog. “Fit to page” shrinks the layout off the sheet."],
                ["Margins: None", "Instabels positions everything itself, so turn off the browser's own margins."],
                ["Test on plain paper", "Print one page on plain paper and hold it against your label sheet before using the good stock."],
                ["Check paper weight", "For heavy cardstock, use your printer's manual or rear feed tray if it has one."],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-3">
                  <Sparkle className="mt-1 h-3.5 w-3.5 shrink-0 text-purple-500" />
                  <span>
                    <span className="font-bold text-slate-900">{title}.</span> {body}
                  </span>
                </li>
              ))}
            </ul>
          </BrandTile>

          {tagged && (
            <p className="mt-6 text-center text-xs text-slate-400">As an Amazon Associate I earn from qualifying purchases.</p>
          )}
          <p className="mt-2 text-center text-xs text-slate-400">
            Product links open Amazon in a new tab. Avery is a trademark of its owner; Instabels is not affiliated with Avery.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row lg:px-8">
          <Image src="/logo-dark.svg" alt="Instabels" width={150} height={28} className="h-8 w-auto" />
          <div className="flex gap-6">
            <Link href="/" className="transition hover:text-slate-900">Home</Link>
            <Link href="/#pricing" className="transition hover:text-slate-900">Pricing</Link>
            <Link href="/contact" className="transition hover:text-slate-900">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
