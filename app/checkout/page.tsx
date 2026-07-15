import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutContent from "@/components/checkout/checkout-content";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Checkout | Palum Dhara",
  description: "Review your order and place it via WhatsApp — Cash on Delivery available.",
};

export default async function CheckoutPage() {
  const session = await getCurrentSession();
  
  let dbUser = null;
  let dbAddresses: any[] = [];
  
  if (session?.user?.id) {
    dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
      },
    });
    
    dbAddresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefaultShipping: "desc" },
    });
  }

  return (
    <section className="section-padding py-12 md:py-16 bg-ivory/30 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-4 text-xs text-charcoal/50 font-mono tracking-wider">
          <span>PALUM DHARA</span>
          <span>/</span>
          <span className="text-forest">CHECKOUT</span>
        </div>
        <h1 className="heading-lg mb-8 text-forest">Secure Checkout</h1>
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white border border-forest/10 p-8 rounded-md">
            <div className="w-6 h-6 border-2 border-forest/20 border-t-forest rounded-full animate-spin" />
            <p className="text-[10px] text-charcoal/40 font-mono tracking-wider uppercase">Loading Checkout...</p>
          </div>
        }>
          <CheckoutContent initialUser={dbUser} initialAddresses={dbAddresses} />
        </Suspense>
      </div>
    </section>
  );
}
