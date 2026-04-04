export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

function getUnixDate(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000);
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  const [{ stripe }, { prisma }] = await Promise.all([
    import("@/lib/stripe"),
    import("@/lib/prisma"),
  ]);

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

        const stripeCustomerId =
          typeof checkoutSession.customer === "string"
            ? checkoutSession.customer
            : null;

        const stripeSubscriptionId =
          typeof checkoutSession.subscription === "string"
            ? checkoutSession.subscription
            : null;

        const metadataUserId =
          typeof checkoutSession.metadata?.userId === "string"
            ? checkoutSession.metadata.userId
            : null;

        const clientReferenceUserId =
          typeof checkoutSession.client_reference_id === "string"
            ? checkoutSession.client_reference_id
            : null;

        const userId = metadataUserId || clientReferenceUserId;

        let subscription: Stripe.Subscription | null = null;

        if (stripeSubscriptionId) {
          subscription = await stripe.subscriptions.retrieve(
            stripeSubscriptionId
          );
        }

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: stripeCustomerId ?? undefined,
              stripeSubscriptionId: stripeSubscriptionId ?? null,
              subscriptionStatus: subscription?.status ?? "active",
              subscriptionPriceId:
                subscription?.items.data[0]?.price.id ?? null,
              currentPeriodEnd: subscription
                ? getUnixDate(subscription.items.data[0]?.current_period_end)
                : null,
              cancelAtPeriodEnd:
                subscription?.cancel_at_period_end ?? false,
            },
          });
        } else if (stripeCustomerId) {
          await prisma.user.updateMany({
            where: { stripeCustomerId },
            data: {
              stripeSubscriptionId: stripeSubscriptionId ?? null,
              subscriptionStatus: subscription?.status ?? "active",
              subscriptionPriceId:
                subscription?.items.data[0]?.price.id ?? null,
              currentPeriodEnd: subscription
                ? getUnixDate(subscription.items.data[0]?.current_period_end)
                : null,
              cancelAtPeriodEnd:
                subscription?.cancel_at_period_end ?? false,
            },
          });
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const stripeCustomerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : null;

        const userId =
          typeof subscription.metadata?.userId === "string"
            ? subscription.metadata.userId
            : null;

        const updateData =
          event.type === "customer.subscription.deleted"
            ? {
                stripeSubscriptionId: null,
                subscriptionStatus: "canceled",
                subscriptionPriceId: null,
                currentPeriodEnd: getUnixDate(
                  subscription.items.data[0]?.current_period_end
                ),
                cancelAtPeriodEnd: false,
              }
            : {
                stripeSubscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                subscriptionPriceId:
                  subscription.items.data[0]?.price.id ?? null,
                currentPeriodEnd: getUnixDate(
                  subscription.items.data[0]?.current_period_end
                ),
                cancelAtPeriodEnd:
                  subscription.cancel_at_period_end ?? false,
              };

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: stripeCustomerId ?? undefined,
              ...updateData,
            },
          });
        } else if (stripeCustomerId) {
          const existingUser = await prisma.user.findFirst({
            where: { stripeCustomerId },
            select: { id: true },
          });

          if (existingUser) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: updateData,
            });
          } else {
            // Manually-sent invoice: no userId metadata and no customerId in DB yet.
            // Look up the Stripe customer email and match to an Instabels account.
            const customer = await stripe.customers.retrieve(stripeCustomerId);
            if (!("deleted" in customer) && customer.email) {
              await prisma.user.updateMany({
                where: { email: customer.email },
                data: { stripeCustomerId, ...updateData },
              });
            }
          }
        }

        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        const stripeCustomerId =
          typeof invoice.customer === "string" ? invoice.customer : null;
        const sub = invoice.parent?.subscription_details?.subscription;
        const invoiceSubscriptionId =
          sub != null
            ? typeof sub === "string"
              ? sub
              : sub.id
            : null;

        if (stripeCustomerId) {
          let subscriptionData: Record<string, unknown> = {
            subscriptionStatus: "active",
          };

          if (invoiceSubscriptionId) {
            const sub = await stripe.subscriptions.retrieve(invoiceSubscriptionId);
            subscriptionData = {
              subscriptionStatus: "active",
              stripeSubscriptionId: invoiceSubscriptionId,
              subscriptionPriceId: sub.items.data[0]?.price.id ?? null,
              currentPeriodEnd: getUnixDate(
                sub.items.data[0]?.current_period_end
              ),
              cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
            };
          }

          const existingUser = await prisma.user.findFirst({
            where: { stripeCustomerId },
            select: { id: true },
          });

          if (existingUser) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: subscriptionData,
            });
          } else {
            // Manually-sent invoice: match by Stripe customer email.
            const customer = await stripe.customers.retrieve(stripeCustomerId);
            if (!("deleted" in customer) && customer.email) {
              await prisma.user.updateMany({
                where: { email: customer.email },
                data: { stripeCustomerId, ...subscriptionData },
              });
            }
          }
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        const stripeCustomerId =
          typeof invoice.customer === "string" ? invoice.customer : null;

        if (stripeCustomerId) {
          await prisma.user.updateMany({
            where: { stripeCustomerId },
            data: {
              subscriptionStatus: "past_due",
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