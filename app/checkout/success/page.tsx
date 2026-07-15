import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle2, Copy, ArrowRight, MessageSquare, ShieldCheck, MapPin } from "lucide-react"

export const metadata = {
  title: "Order Placed Successfully — Palum Dhara",
  description: "Your mountain harvest order has been logged successfully.",
}

// Client helper for WhatsApp prefilled message
function buildWhatsAppConfirmLink(orderNumber: string, grandTotal: number) {
  const message = `Hi! I've placed an order on Palum Dhara.\n\nOrder Number: ${orderNumber}\nTotal: ₹${grandTotal}\n\nPlease confirm availability and dispatch schedule. Thank you!`;
  return `https://wa.me/919999999999?text=${encodeURIComponent(message)}`;
}

interface SuccessPageProps {
  searchParams: Promise<{ orderNumber?: string }>
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedParams = await searchParams;
  const orderNumber = resolvedParams.orderNumber;

  if (!orderNumber) {
    redirect("/shop")
  }

  // Fetch the order from the database
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
    },
  })

  if (!order) {
    return (
      <main className="section-padding py-20 min-h-screen flex flex-col items-center justify-center text-center bg-ivory/25">
        <h1 className="heading-md text-stone-900 mb-4">Receipt Not Found</h1>
        <p className="body text-charcoal/60 mb-8 max-w-sm">
          We could not locate an active transaction with order number <strong className="font-mono">{orderNumber}</strong>.
        </p>
        <Link href="/shop" className="btn-primary px-8 py-3 text-xs tracking-wider uppercase font-body">
          Return to Shop
        </Link>
      </main>
    )
  }

  const shipping = order.shippingAddress as any;

  return (
    <main className="section-padding py-12 md:py-20 min-h-screen bg-ivory/25">
      <div className="max-w-3xl mx-auto bg-white border border-forest/10 p-8 md:p-12 rounded-md shadow-sm warm-card">
        
        {/* Animated Check & Congrats */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-forest/5 rounded-full flex items-center justify-center text-forest mb-6 border border-forest/15">
            <CheckCircle2 className="w-10 h-10 animate-scale-up" />
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-wood mb-2">Himalayan Harvest Logged</p>
          <h1 className="heading-md text-forest mb-3">Thank you for your order!</h1>
          <p className="text-xs text-charcoal/60 leading-relaxed max-w-md font-body">
            Your order has been registered securely in our ledger. Below is your official purchase receipt. We will dispatch your package within 24–48 hours from Palampur.
          </p>
        </div>

        {/* WhatsApp Settlement CTA */}
        <div className="p-6 border border-forest/20 bg-forest/[0.02] rounded-md mb-8 flex flex-col md:flex-row gap-5 items-center justify-between">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-xs font-semibold text-forest uppercase flex items-center justify-center md:justify-start gap-1.5 font-heading">
              <MessageSquare className="w-4 h-4" />
              Accelerate Delivery via WhatsApp
            </h4>
            <p className="text-[11px] text-charcoal/60 font-body leading-relaxed">
              Message our operations desk with your order number. We'll fast-track your dispatch verification instantly.
            </p>
          </div>
          <a
            href={buildWhatsAppConfirmLink(order.orderNumber, order.grandTotal)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary py-3 px-6 text-[11px] tracking-wider uppercase font-semibold flex items-center gap-2 shadow-sm whitespace-nowrap shrink-0"
          >
            Confirm via WhatsApp
          </a>
        </div>

        {/* Receipt Grid */}
        <div className="border-t border-forest/10 pt-8 grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          
          {/* Order Details (Left 7 Columns) */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40 mb-3">
                Shipping Details
              </h3>
              <div className="p-4 bg-ivory-dark/5 border border-wood-light/10 rounded-sm text-xs text-charcoal/80 space-y-1 font-body">
                <p className="font-semibold text-forest">{order.customerName}</p>
                <p>{shipping.addressLine1}</p>
                {shipping.addressLine2 && <p>{shipping.addressLine2}</p>}
                <p>{shipping.city}, {shipping.state} — {shipping.postalCode}</p>
                <p className="text-charcoal/40 font-mono mt-1">India</p>
                {order.customerPhone && (
                  <p className="text-charcoal/50 font-mono text-[11px] pt-1 border-t border-wood-light/5 mt-2">
                    Phone: {order.customerPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40 mb-3">
                Items Purchased
              </h3>
              <ul className="divide-y divide-forest/5 border border-forest/10 rounded-sm overflow-hidden bg-white">
                {order.items.map((item) => (
                  <li key={item.id} className="p-4 flex justify-between gap-4 items-center">
                    <div className="flex gap-3 items-center">
                      <div className="relative w-10 h-12 bg-ivory-dark/40 shrink-0 overflow-hidden rounded-sm border border-forest/5">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-forest leading-tight truncate max-w-[150px] sm:max-w-[200px]">
                          {item.productName}
                        </h4>
                        <p className="text-[10px] text-charcoal/40 mt-1 font-mono">{item.weight} x {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-xs text-forest font-semibold font-mono">
                      ₹{item.price * item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ledger Summary (Right 5 Columns) */}
          <div className="md:col-span-5 space-y-6">
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40 mb-3">
                Ledger Summary
              </h3>
              
              <div className="p-5 border border-forest/10 rounded-sm space-y-3 bg-white" id="receipt-ledger-box">
                <div className="text-xs font-body border-b border-forest/5 pb-2">
                  <span className="text-charcoal/40 block font-mono text-[9px] uppercase">Official Order ID</span>
                  <span className="text-forest font-mono font-semibold mt-0.5 block flex items-center justify-between gap-1 select-all">
                    {order.orderNumber}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-charcoal/60">Cart Subtotal</span>
                  <span className="font-mono text-charcoal">₹{order.subtotal}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between items-center text-xs text-forest font-semibold">
                    <span>Discount ({order.couponCode})</span>
                    <span className="font-mono">-₹{order.discount}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs">
                  <span>Delivery Fee</span>
                  <span className="font-mono">
                    {order.shippingFee === 0 ? (
                      <span className="text-forest font-semibold uppercase text-[10px]">Free</span>
                    ) : (
                      `₹${order.shippingFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-charcoal/40 pb-2 border-b border-forest/5">
                  <span>Included Tax (5% GST)</span>
                  <span className="font-mono">₹{order.tax}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-semibold text-forest uppercase">Grand Total</span>
                  <span className="font-heading text-lg text-forest font-semibold">₹{order.grandTotal}</span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-forest bg-forest/5 p-2 rounded-sm mt-3 border border-forest/10 font-body">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Settlement
                  </span>
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Unpaid (COD)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Page Navigation */}
        <div className="border-t border-forest/10 pt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link
            href="/account"
            className="text-stone hover:text-forest text-xs tracking-wider uppercase font-semibold flex items-center gap-1.5 transition-colors duration-200"
          >
            Go to My Account
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/shop"
            className="btn-primary py-3 px-8 text-xs tracking-wider uppercase font-body"
          >
            Continue Exploring
          </Link>
        </div>

      </div>
    </main>
  )
}
