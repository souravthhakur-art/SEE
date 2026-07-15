"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingBag, 
  MapPin, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Check, 
  Loader2, 
  AlertCircle, 
  Tag, 
  CreditCard,
  Truck,
  Plus
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { products, subscriptionBoxes } from "@/lib/data";
import type { CartItem } from "@/types";
import { validateCoupon, placeOrder } from "@/app/checkout/actions";

interface Address {
  id: string;
  userId: string;
  label: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefaultShipping: boolean;
}

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
}

interface CheckoutContentProps {
  initialUser: UserProfile | null;
  initialAddresses: Address[];
}

export default function CheckoutContent({ initialUser, initialAddresses }: CheckoutContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cartItems = useCartStore((s) => s.items);
  const cartTotal = useCartStore((s) => s.getTotal());
  const clearCart = useCartStore((s) => s.clearCart);

  const mode = searchParams.get("mode");
  const isBuyNow = mode === "buy-now";
  const isPantry = mode === "pantry";

  // Checkout Lines & calculations
  let lines: CartItem[] = [];
  let baseTotal = 0;

  if (isBuyNow) {
    const slug = searchParams.get("slug");
    const qty = Math.max(1, parseInt(searchParams.get("qty") || "1", 10) || 1);
    const product = products.find((p) => p.slug === slug);

    if (product) {
      lines = [
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
          weight: product.weight,
          quantity: qty,
        },
      ];
      baseTotal = product.price * qty;
    }
  } else if (isPantry) {
    const plan = searchParams.get("plan") || "family";
    const planInfo = subscriptionBoxes.find((b) => b.id === plan) || subscriptionBoxes[1];
    lines = [
      {
        id: `pantry-plan-${plan}`,
        slug: `pantry-plan-${plan}`,
        name: `${planInfo.name} Plan`,
        price: planInfo.price,
        image: "/images/subscriptions/seasonal-harvests.jpg",
        weight: "Box",
        quantity: 1,
      },
    ];
    baseTotal = planInfo.price;
  } else {
    lines = cartItems;
    baseTotal = cartTotal;
  }

  // 1. Contact Form State
  const [customerName, setCustomerName] = useState(initialUser?.fullName || "");
  const [customerEmail, setCustomerEmail] = useState(initialUser?.email || "");
  const [customerPhone, setCustomerPhone] = useState(initialUser?.phone || "");

  // 2. Shipping Coordinates State
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    initialAddresses.find((a) => a.isDefaultShipping)?.id || initialAddresses[0]?.id || "new"
  );

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressPhone, setAddressPhone] = useState("");

  // Sync selected address to form if saved address selected
  useEffect(() => {
    if (selectedAddressId && selectedAddressId !== "new" && initialAddresses.length > 0) {
      const addr = initialAddresses.find((a) => a.id === selectedAddressId);
      if (addr) {
        setAddressLine1(addr.addressLine1);
        setAddressLine2(addr.addressLine2 || "");
        setCity(addr.city);
        setState(addr.state);
        setPostalCode(addr.postalCode);
        setAddressPhone(addr.phone || customerPhone || "");
      }
    } else if (selectedAddressId === "new") {
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setPostalCode("");
      setAddressPhone(customerPhone || "");
    }
  }, [selectedAddressId, initialAddresses]);

  // 3. Billing Address State (Same as Shipping)
  const [useDifferentBilling, setUseDifferentBilling] = useState(false);
  const [billingLine1, setBillingLine1] = useState("");
  const [billingLine2, setBillingLine2] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");

  // 4. Coupons & Promotions State
  const [couponCode, setCouponCode] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    description: string | null;
  } | null>(null);

  // 5. Order Execution State
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  // Calculations
  const discount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? Math.round((baseTotal * appliedCoupon.discountValue) / 100)
      : appliedCoupon.discountValue
    : 0;

  const shippingFee = baseTotal >= 1000 ? 0 : 99;
  const gst = Math.round((baseTotal - discount) * 0.05);
  const grandTotal = Math.max(0, baseTotal - discount + shippingFee);

  // Handle Coupon Apply
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (!customerEmail) {
      setCouponError("Please enter your email address first to validate coupons.");
      setCouponSuccess(null);
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    const res = await validateCoupon(couponCode, customerEmail);
    setIsValidatingCoupon(false);

    if (res.valid) {
      setAppliedCoupon({
        code: res.code!,
        discountType: res.discountType!,
        discountValue: res.discountValue!,
        description: res.description || null,
      });
      setCouponSuccess(`Coupon "${res.code}" applied! ${res.description || `${res.discountValue}% discount applied.`}`);
    } else {
      setAppliedCoupon(null);
      setCouponError(res.error || "Failed to apply coupon.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess(null);
    setCouponError(null);
    setCouponCode("");
  };

  // Handle Order Submit
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail) {
      setOrderError("Please complete your contact details first.");
      return;
    }

    if (!addressLine1 || !city || !state || !postalCode) {
      setOrderError("Please complete your delivery coordinates.");
      return;
    }

    setIsPlacingOrder(true);
    setOrderError(null);

    const mappedItems = lines.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }));

    const shippingAddressObj = {
      addressLine1,
      addressLine2: addressLine2 || null,
      city,
      state,
      postalCode,
      country: "India",
    };

    const billingAddressObj = useDifferentBilling
      ? {
          addressLine1: billingLine1,
          addressLine2: billingLine2 || null,
          city: billingCity,
          state: billingState,
          postalCode: billingPostalCode,
          country: "India",
        }
      : shippingAddressObj;

    const res = await placeOrder({
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      shippingAddress: shippingAddressObj,
      billingAddress: billingAddressObj,
      couponCode: appliedCoupon?.code || null,
      items: mappedItems,
      notes: notes || null,
      // Additive parameters for pantry membership
      isPantry,
      pantryPlan: isPantry ? (searchParams.get("plan") || "family") : undefined,
      pantryFrequency: isPantry ? (searchParams.get("frequency") || "monthly") : undefined,
      pantryWindow: isPantry ? (searchParams.get("window") || "early_month") : undefined,
      pantryItems: isPantry ? (searchParams.get("items") || "").split(",").map(i => {
        const [pId, qtyStr] = i.split(":");
        return { productId: pId, quantity: parseInt(qtyStr, 10) || 1 };
      }).filter(i => !!i.productId) : undefined,
    });

    setIsPlacingOrder(false);

    if (res.success && res.orderNumber) {
      // Clear local cart if not a buy now or pantry checkout
      if (!isBuyNow && !isPantry) {
        clearCart();
      }
      // Redirect to Order Confirmation Success page
      router.push(`/checkout/success?orderNumber=${res.orderNumber}`);
    } else {
      setOrderError(res.error || "Unable to place order. Please check your information and try again.");
    }
  };

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-forest/10 bg-white p-8 rounded-md" id="empty-checkout">
        <ShoppingBag className="w-10 h-10 text-charcoal/20 mb-4" strokeWidth={1} />
        <p className="text-charcoal/60 mb-6 font-body">
          {isBuyNow ? "We couldn't find that product." : "Your cart is empty."}
        </p>
        <Link href="/shop" className="btn-primary px-8 py-3 text-xs tracking-wider uppercase font-body">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="checkout-root">
      {/* Checkout Forms (Left 7 columns) */}
      <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6" id="checkout-forms">
        
        {/* SECTION 1: CONTACT DETAILS */}
        <div className="bg-white border border-forest/10 p-6 rounded-md shadow-sm warm-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-forest/5 text-forest flex items-center justify-center">
              <UserIcon className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-forest font-body">
              1. Contact Information
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-forest/5 pt-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="customerName" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                Full Name <span className="text-terracotta">*</span>
              </label>
              <input
                id="customerName"
                type="text"
                required
                placeholder="Sanjay Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none font-body transition-colors duration-200"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="customerEmail" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                Email Address <span className="text-terracotta">*</span>
              </label>
              <input
                id="customerEmail"
                type="email"
                required
                placeholder="sanjay@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none font-body transition-colors duration-200"
              />
              <p className="text-[9px] text-charcoal/40 mt-1">Used to verify first-order welcome promotions.</p>
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label htmlFor="customerPhone" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                Mobile Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-charcoal/40" />
                <input
                  id="customerPhone"
                  type="text"
                  placeholder="+91 98765 43210 (WhatsApp preferred)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-10 w-full border border-wood-light/30 focus:border-forest pl-9 pr-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none font-body transition-colors duration-200"
                />
              </div>
              <p className="text-[9px] text-charcoal/40 mt-1">For delivery status and dispatcher confirmations over WhatsApp.</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: DISPATCH COORDINATES */}
        <div className="bg-white border border-forest/10 p-6 rounded-md shadow-sm warm-card">
          <div className="flex items-center gap-3 mb-4 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-forest/5 text-forest flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-forest font-body">
                2. Shipping Coordinates
              </h2>
            </div>
            {initialUser && (
              <span className="text-[10px] font-mono text-forest bg-forest/5 px-2 py-0.5 rounded-sm">
                Saved Address Enabled
              </span>
            )}
          </div>

          <div className="border-t border-forest/5 pt-4 space-y-4">
            {/* Saved Addresses List (Authenticated Only) */}
            {initialUser && initialAddresses.length > 0 && (
              <div className="mb-4">
                <label className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body block mb-2">
                  Select Dispatch Address
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="checkout-saved-addresses">
                  {initialAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`border p-4 rounded-sm cursor-pointer transition-all duration-200 relative ${
                        selectedAddressId === addr.id
                          ? "border-forest bg-forest/5 shadow-sm"
                          : "border-wood-light/20 hover:border-forest/40 bg-transparent/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-forest">
                          {addr.label || "Address"}
                        </span>
                        {selectedAddressId === addr.id && (
                          <Check className="w-4 h-4 text-forest" />
                        )}
                      </div>
                      <div className="text-[11px] text-charcoal/70 space-y-0.5 font-body">
                        <p className="truncate">{addr.addressLine1}</p>
                        <p className="truncate">{addr.city}, {addr.state} — {addr.postalCode}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Option for new address */}
                  <div
                    onClick={() => setSelectedAddressId("new")}
                    className={`border p-4 rounded-sm cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 ${
                      selectedAddressId === "new"
                        ? "border-forest bg-forest/5 shadow-sm"
                        : "border-wood-light/20 hover:border-forest/40 bg-transparent/5"
                    }`}
                  >
                    <Plus className="w-4 h-4 text-forest" />
                    <span className="text-xs font-semibold text-forest">Ship to New Address</span>
                  </div>
                </div>
              </div>
            )}

            {/* Address fields */}
            {(selectedAddressId === "new" || !initialUser) && (
              <div className="space-y-4 animate-fade-in" id="new-shipping-address-fields">
                <div className="flex flex-col gap-1">
                  <label htmlFor="addressLine1" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                    Address Line 1 <span className="text-terracotta">*</span>
                  </label>
                  <input
                    id="addressLine1"
                    type="text"
                    required
                    placeholder="House/Flat No., Building Name, Street Name"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none font-body transition-colors duration-200"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="addressLine2" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    id="addressLine2"
                    type="text"
                    placeholder="Landmark, Locality, Area"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none font-body transition-colors duration-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="city" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                      City / Town <span className="text-terracotta">*</span>
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      placeholder="Shimla"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none font-body transition-colors duration-200"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="state" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                      State <span className="text-terracotta">*</span>
                    </label>
                    <input
                      id="state"
                      type="text"
                      required
                      placeholder="Himachal Pradesh"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none font-body transition-colors duration-200"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="postalCode" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                      PIN Code / Postal <span className="text-terracotta">*</span>
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      required
                      placeholder="171001"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none font-body transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Read-only address preview if saved address selected */}
            {initialUser && selectedAddressId !== "new" && (
              <div className="p-4 bg-forest/[0.02] border border-forest/10 rounded-sm" id="saved-shipping-address-preview">
                <p className="text-xs text-forest font-semibold mb-1">Delivering to saved address:</p>
                <p className="text-xs text-charcoal font-body leading-relaxed">
                  {addressLine1}
                  {addressLine2 && `, ${addressLine2}`}
                  <br />
                  {city}, {state} — {postalCode}
                </p>
              </div>
            )}

            {/* Billing Address Toggle */}
            <div className="border-t border-forest/5 pt-4 mt-2">
              <div className="flex items-center gap-3">
                <input
                  id="different-billing-toggle"
                  type="checkbox"
                  checked={useDifferentBilling}
                  onChange={(e) => setUseDifferentBilling(e.target.checked)}
                  className="w-4 h-4 border border-wood-light/40 accent-forest cursor-pointer"
                />
                <label htmlFor="different-billing-toggle" className="text-xs text-charcoal/70 font-body cursor-pointer select-none">
                  Use a different billing (invoice) address
                </label>
              </div>

              {useDifferentBilling && (
                <div className="space-y-4 mt-4 p-4 border border-wood-light/10 bg-transparent/5 rounded-sm animate-fade-in" id="billing-address-fields">
                  <h4 className="text-xs font-semibold uppercase text-forest mb-2">Billing Coordinates</h4>
                  
                  <div className="flex flex-col gap-1">
                    <label htmlFor="billingLine1" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                      Address Line 1 <span className="text-terracotta">*</span>
                    </label>
                    <input
                      id="billingLine1"
                      type="text"
                      required={useDifferentBilling}
                      placeholder="Billing street address"
                      value={billingLine1}
                      onChange={(e) => setBillingLine1(e.target.value)}
                      className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none font-body transition-colors duration-200"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="billingLine2" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      id="billingLine2"
                      type="text"
                      placeholder="Apartment, suite, etc."
                      value={billingLine2}
                      onChange={(e) => setBillingLine2(e.target.value)}
                      className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none font-body transition-colors duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="billingCity" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                        City <span className="text-terracotta">*</span>
                      </label>
                      <input
                        id="billingCity"
                        type="text"
                        required={useDifferentBilling}
                        placeholder="City"
                        value={billingCity}
                        onChange={(e) => setBillingCity(e.target.value)}
                        className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none font-body transition-colors duration-200"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="billingState" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                        State <span className="text-terracotta">*</span>
                      </label>
                      <input
                        id="billingState"
                        type="text"
                        required={useDifferentBilling}
                        placeholder="State"
                        value={billingState}
                        onChange={(e) => setBillingState(e.target.value)}
                        className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none font-body transition-colors duration-200"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="billingPostalCode" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                        PIN Code <span className="text-terracotta">*</span>
                      </label>
                      <input
                        id="billingPostalCode"
                        type="text"
                        required={useDifferentBilling}
                        placeholder="PIN Code"
                        value={billingPostalCode}
                        onChange={(e) => setBillingPostalCode(e.target.value)}
                        className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none font-body transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: TRANSACTIONAL DETAILS (COD, NOTES) */}
        <div className="bg-white border border-forest/10 p-6 rounded-md shadow-sm warm-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-forest/5 text-forest flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-forest font-body">
              3. Payment & Settlement
            </h2>
          </div>

          <div className="border-t border-forest/5 pt-4 space-y-4">
            <div className="p-4 border border-forest/20 bg-forest/[0.02] rounded-sm flex gap-4 items-start">
              <input
                type="radio"
                id="payment-cod"
                checked
                readOnly
                className="w-4 h-4 mt-0.5 accent-forest"
              />
              <div>
                <label htmlFor="payment-cod" className="text-xs font-semibold text-forest block cursor-pointer">
                  Cash on Delivery (COD)
                </label>
                <p className="text-[11px] text-charcoal/60 font-body leading-relaxed mt-1">
                  Pay at your doorstep upon receiving your parcel. We currently support COD across India. For fully prepaid digital settlement options, please contact our merchant desk on WhatsApp after submitting your order.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-2">
              <label htmlFor="orderNotes" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                Order Notes / Dispatch Requests (Optional)
              </label>
              <textarea
                id="orderNotes"
                placeholder="Special delivery instructions, gate codes, or organic packaging requests..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border border-wood-light/30 focus:border-forest p-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none font-body transition-colors duration-200 resize-none"
              />
            </div>
          </div>
        </div>

        {/* ERROR SUMMARY */}
        {orderError && (
          <div className="p-4 bg-terracotta/5 border border-terracotta/20 text-terracotta rounded-sm text-xs leading-relaxed font-body flex items-start gap-2 animate-shake" id="checkout-error-alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{orderError}</span>
          </div>
        )}

        {/* PRIMARY SUBMIT ACTION */}
        <button
          type="submit"
          disabled={isPlacingOrder}
          className="btn-primary w-full py-4 text-xs uppercase tracking-widest font-heading font-medium flex items-center justify-center gap-3 shadow-md"
          id="btn-confirm-order"
        >
          {isPlacingOrder ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing Order Coordinates...
            </>
          ) : (
            <>
              Confirm & Place Order — ₹{grandTotal}
            </>
          )}
        </button>

        <p className="text-[10px] text-charcoal/40 text-center leading-relaxed max-w-md mx-auto">
          By placing your order, you authorize Palum Dhara to log this transaction securely. Dispatch details, delivery timelines, and tracking details will sync to your profile automatically.
        </p>

      </form>

      {/* Order Summary (Right 5 columns) */}
      <div className="lg:col-span-5 bg-white border border-forest/10 p-6 rounded-md shadow-sm warm-card space-y-6 lg:sticky lg:top-8" id="checkout-sidebar">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-forest mb-4 pb-2 border-b border-forest/10">
            Order Review
          </h2>

          {/* Cart Products List */}
          <ul className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 divide-y divide-forest/5" id="checkout-items-list">
            {lines.map((item) => (
              <li key={item.id} className="flex gap-4 pt-4 first:pt-0">
                <div className="relative w-14 h-16 bg-ivory-dark/40 flex-shrink-0 overflow-hidden rounded-sm border border-forest/5">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h3 className="text-xs text-forest font-semibold truncate leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-[10px] text-charcoal/40 mt-0.5 font-mono">{item.weight}</p>
                  </div>
                  <p className="text-[11px] text-charcoal/50">Qty: {item.quantity}</p>
                </div>
                <span className="text-xs text-forest font-semibold self-center font-mono">
                  ₹{item.price * item.quantity}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* PROMOTION / COUPON PORT */}
        <div className="border-t border-forest/10 pt-4">
          <label className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body block mb-2">
            Have a Promo Code?
          </label>
          
          {appliedCoupon ? (
            <div className="p-3 bg-forest/5 border border-forest/20 rounded-sm flex items-center justify-between animate-fade-in" id="applied-coupon-display">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-forest" />
                <span className="text-xs font-semibold text-forest uppercase font-mono">{appliedCoupon.code}</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-[10px] text-terracotta hover:underline font-mono uppercase font-semibold"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2" id="form-apply-coupon">
              <input
                type="text"
                placeholder="e.g. WELCOME5"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="h-9 flex-1 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal uppercase font-mono outline-none"
              />
              <button
                type="submit"
                disabled={isValidatingCoupon || !couponCode.trim()}
                className="px-4 py-1 border border-forest text-forest hover:bg-forest hover:text-ivory rounded-sm text-[11px] tracking-wider uppercase font-semibold transition-all duration-200 disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                {isValidatingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
              </button>
            </form>
          )}

          {couponError && (
            <p className="text-[10px] text-terracotta mt-1.5 flex items-center gap-1 font-body animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5" />
              {couponError}
            </p>
          )}
          {couponSuccess && (
            <p className="text-[10px] text-forest mt-1.5 flex items-center gap-1 font-body animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              {couponSuccess}
            </p>
          )}
          
          <p className="text-[9px] text-charcoal/40 mt-1.5 font-body leading-tight">
            * Try the code <strong className="font-semibold text-forest">WELCOME5</strong> to enjoy a 5% discount on your inaugural order.
          </p>
        </div>

        {/* MATH METRICS SUMMARY */}
        <div className="border-t border-forest/10 pt-4 space-y-2.5" id="checkout-calculation-metrics">
          <div className="flex justify-between items-center text-xs">
            <span className="text-charcoal/60">Cart Subtotal</span>
            <span className="font-mono text-charcoal">₹{baseTotal}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between items-center text-xs text-forest font-semibold">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Discount ({appliedCoupon?.code})
              </span>
              <span className="font-mono">-₹{discount}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-charcoal/40" />
              Delivery Fee
            </span>
            <span className="font-mono text-charcoal">
              {shippingFee === 0 ? (
                <span className="text-forest font-semibold uppercase text-[10px]">Free Shipping</span>
              ) : (
                `₹${shippingFee}`
              )}
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px] text-charcoal/40 border-b border-forest/5 pb-2.5">
            <span>Estimated GST/Taxes (5% Included)</span>
            <span className="font-mono">₹{gst}</span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-xs font-semibold text-forest uppercase">Estimated Total</span>
            <span className="font-heading text-xl text-forest font-semibold">₹{grandTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
