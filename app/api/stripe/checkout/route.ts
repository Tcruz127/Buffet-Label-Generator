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

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (!process.env.STRIPE_PRICE_ID_MONTHLY) {
      throw new Error("STRIPE_PRICE_ID_MONTHLY is not set");
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_MONTHLY,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/app?upgraded=1`,
      cancel_url: `${baseUrl}/app?canceled=1`,
      allow_promotion_codes: true,
      metadata: {
        userId: user.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
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