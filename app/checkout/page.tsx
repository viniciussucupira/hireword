import type { Metadata } from "next";
import CheckoutPlans from "./CheckoutPlans";

export const metadata: Metadata = {
  title: "Pricing — Hireword Pro",
  description:
    "Hireword Pro includes 600 rewrites a month for $19, cancel anytime. Secure payment by Paddle, full refund within 14 days of your first payment.",
  alternates: { canonical: "/checkout" },
};

export default function CheckoutPage() {
  return <CheckoutPlans />;
}
