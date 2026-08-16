import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Update order status
        await prisma.marketplaceOrder.updateMany({
          where: { stripeSessionId: session.id },
          data: {
            status: "completed",
            paymentStatus: "paid",
            paidAt: new Date(),
          },
        });

        // Update product stock
        const order = await prisma.marketplaceOrder.findFirst({
          where: { stripeSessionId: session.id },
          include: { product: true },
        });

        if (order && order.product.stock !== null) {
          await prisma.marketplaceProduct.update({
            where: { id: order.productId },
            data: {
              stock: { decrement: order.quantity },
              totalSales: { increment: order.quantity },
            },
          });
        }

        // Award points to buyer
        if (order) {
          await prisma.studentPoint.create({
            data: {
              studentId: order.buyerId,
              points: Math.floor(order.totalPrice / 10), // 1 point per $10 spent
              source: "marketplace_purchase",
              description: `Purchased: ${order.product.title}`,
            },
          });
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;

        await prisma.marketplaceOrder.updateMany({
          where: { stripeSessionId: session.id },
          data: { status: "cancelled" },
        });

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
