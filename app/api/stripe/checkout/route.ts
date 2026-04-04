export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { headers } from "next/headers";

function getBaseUrl(host: string | null) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (envUrl) {
    if (!envUrl.startsWith("http://") && !envUrl.startsWith("https://")) {
      throw new Error(
        "NEXT_PUBLIC_APP_URL must start with http:// or https://"
      );
    }

    return envUrl.replace(/\/$/, "");
  }

  if (!host) {
    throw new Error("Unable to determine app URL");
  }

  const protocol =
    host.includes("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https";

  return `${protocol}://${host}`;
}

type CheckoutRequestBody = {
  billingCycle?: "monthly" | "annual";
};

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as CheckoutRequestBody;
    const billingCycle = body.billingCycle === "annual" ? "annual" : "monthly";

    const [{ prisma }, { stripe }] = await Promise.all([
      import("@/lib/prisma"),
      import("@/lib/stripe"),
    ]);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: {
          userId: user.id,
        },
      });

      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId,
        },
      });
    }

    const headersList = await headers();
    const host = headersList.get("host");
    const baseUrl = getBaseUrl(host);

    const monthlyPriceId = process.env.STRIPE_PRICE_ID_MONTHLY;
    const annualPriceId = process.env.STRIPE_PRICE_ID_ANNUAL;

    if (!monthlyPriceId) {
      throw new Error("STRIPE_PRICE_ID_MONTHLY is not set");
    }

    if (!annualPriceId) {
      throw new Error("STRIPE_PRICE_ID_ANNUAL is not set");
    }

    const selectedPriceId =
      billingCycle === "annual" ? annualPriceId : monthlyPriceId;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      client_reference_id: user.id,
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/app?upgraded=1`,
      cancel_url: `${baseUrl}/app?canceled=1`,
      allow_promotion_codes: true,
      metadata: {
        userId: user.id,
        billingCycle,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          billingCycle,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
      },
      { status: 500 }
    );
  }
}