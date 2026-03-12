export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;

        const userId = checkoutSession.metadata?.userId;
        const stripeCustomerId =
          typeof checkoutSession.customer === "string"
            ? checkoutSession.customer
            : null;
        const stripeSubscriptionId =
          typeof checkoutSession.subscription === "string"
            ? checkoutSession.subscription
            : null;

        if (userId) {
          let subscription: Stripe.Subscription | null = null;

          if (stripeSubscriptionId) {
            subscription = await stripe.subscriptions.retrieve(
              stripeSubscriptionId
            );
          }

          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: stripeCustomerId ?? undefined,
              stripeSubscriptionId: stripeSubscriptionId ?? undefined,
              subscriptionStatus: subscription?.status ?? "active",
              subscriptionPriceId:
                subscription?.items.data[0]?.price.id ?? undefined,
            },
          });
        }

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;

        const stripeCustomerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : null;

        if (stripeCustomerId) {
          await prisma.user.updateMany({
            where: { stripeCustomerId },
            data: {
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              subscriptionPriceId:
                subscription.items.data[0]?.price.id ?? null,
            },
          });
        }

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}