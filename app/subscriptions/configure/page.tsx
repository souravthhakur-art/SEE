"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { authClient } from "@/lib/auth-client"
import { subscriptionBoxes, products } from "@/lib/data"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Minus, 
  Check, 
  Trash2, 
  ShoppingBag, 
  Calendar, 
  Clock, 
  Truck, 
  Lock, 
  UserPlus 
} from "lucide-react"

// Eligible subscription products
const ELIGIBLE_PRODUCTS = products.filter(p => p.subscriptionEligible)

// Default products for each plan
const DEFAULT_PLAN_ITEMS: Record<string, { productId: string; quantity: number }[]> = {
  essential: [
    { productId: "kangra-orthodox-black", quantity: 1 },
    { productId: "wild-forest-honey", quantity: 1 }
  ],
  family: [
    { productId: "kangra-orthodox-black", quantity: 1 },
    { productId: "kangra-green-tea", quantity: 1 },
    { productId: "wild-forest-honey", quantity: 1 },
    { productId: "wild-plum-preserve", quantity: 1 }
  ],
  seasonal: [
    { productId: "kangra-orthodox-black", quantity: 1 },
    { productId: "kangra-green-tea", quantity: 1 },
    { productId: "wild-forest-honey", quantity: 1 },
    { productId: "wild-plum-preserve", quantity: 1 },
    { productId: "galgal-pickle", quantity: 1 }
  ],
  signature: [
    { productId: "kangra-orthodox-black", quantity: 1 },
    { productId: "kangra-green-tea", quantity: 1 },
    { productId: "wild-forest-honey", quantity: 1 },
    { productId: "wild-plum-preserve", quantity: 1 },
    { productId: "galgal-pickle", quantity: 2 }
  ]
}

function ConfigureSubscriptionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [session, setSession] = useState<any>(null)
  const [isSessionLoading, setIsSessionLoading] = useState(true)

  useEffect(() => {
    authClient.getSession()
      .then((res) => {
        if (res && res.data) {
          setSession(res.data)
        }
      })
      .catch((err) => {
        console.error("Failed to fetch session:", err)
      })
      .finally(() => {
        setIsSessionLoading(false)
      })
  }, [])
  
  const planId = searchParams.get("plan") || "family"
  const activePlan = subscriptionBoxes.find(b => b.id === planId) || subscriptionBoxes[1] // fallback to family

  // Wizard state
  const [step, setStep] = useState<1 | 2>(1)
  const [basket, setBasket] = useState<{ productId: string; quantity: number }[]>([])
  const [frequency, setFrequency] = useState<"monthly" | "bi_monthly" | "tri_monthly">("monthly")
  const [deliveryWindow, setDeliveryWindow] = useState<"early_month" | "late_month">("early_month")

  // Initialize basket on plan load
  useEffect(() => {
    const defaults = DEFAULT_PLAN_ITEMS[activePlan.id] || DEFAULT_PLAN_ITEMS.family
    setBasket(defaults)
  }, [activePlan.id])

  // Basket adjustment
  const handleUpdateQty = (productId: string, increment: number) => {
    setBasket(prev => {
      const existing = prev.find(item => item.productId === productId)
      if (existing) {
        const nextQty = existing.quantity + increment
        if (nextQty <= 0) {
          return prev.filter(item => item.productId !== productId)
        }
        return prev.map(item => item.productId === productId ? { ...item, quantity: nextQty } : item)
      } else if (increment > 0) {
        return [...prev, { productId, quantity: 1 }]
      }
      return prev
    })
  }

  const handleRemoveItem = (productId: string) => {
    setBasket(prev => prev.filter(item => item.productId !== productId))
  }

  const handleAddItem = (productId: string) => {
    setBasket(prev => {
      if (prev.some(item => item.productId === productId)) return prev
      return [...prev, { productId, quantity: 1 }]
    })
  }

  // Next delivery estimated total calculation
  const getNextDeliveryValue = () => {
    let sum = 0
    basket.forEach(item => {
      const prod = ELIGIBLE_PRODUCTS.find(p => p.id === item.productId)
      if (prod) {
        sum += prod.price * item.quantity
      }
    })
    return sum
  }

  const handleCheckoutRedirect = () => {
    const itemsStr = basket.map(b => `${b.productId}:${b.quantity}`).join(",")
    const url = `/checkout?mode=pantry&plan=${activePlan.id}&frequency=${frequency}&window=${deliveryWindow}&items=${encodeURIComponent(itemsStr)}`
    router.push(url)
  }

  if (isSessionLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center py-16 px-6 bg-ivory">
        <div className="w-8 h-8 border-2 border-forest/20 border-t-forest rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono tracking-widest text-charcoal/50 uppercase">Securing Connection...</p>
      </div>
    )
  }

  // Not signed in state
  if (!session) {
    return (
      <main className="min-h-[85vh] py-16 px-6 bg-ivory flex flex-col justify-center items-center relative" id="pantry-gate-page">
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-wood-light/15 to-transparent hidden lg:block" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-wood-light/15 to-transparent hidden lg:block" />

        <div className="max-w-md w-full text-center">
          <span className="label-ornate mb-4 block">PALUM DHARA MEMBERSHIP</span>
          <h1 className="heading-md mb-3 text-forest">A Harvest Tailored for You</h1>
          <p className="body-lg text-charcoal/60 text-sm max-w-sm mx-auto mb-10 leading-relaxed">
            Please enter your community gateway or register an account to customize your pantry, choose logistics and activate your membership.
          </p>

          <div className="bg-ivory-dark/10 border border-wood-light/20 rounded-md p-8 warm-card flex flex-col gap-4">
            <div className="flex justify-center mb-2 text-wood">
              <Lock className="w-10 h-10 stroke-[1.25]" />
            </div>
            
            <Link 
              href={`/sign-in?redirectTo=/subscriptions/configure?plan=${activePlan.id}`}
              className="btn-primary py-3 px-6 text-xs flex items-center justify-center gap-2 font-mono uppercase tracking-wider"
            >
              Sign In to Configure
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-wood-light/15"></div>
              <span className="flex-shrink mx-4 text-[9px] font-mono text-charcoal/40 uppercase">or browse plans</span>
              <div className="flex-grow border-t border-wood-light/15"></div>
            </div>

            <Link 
              href="/subscriptions"
              className="bg-ivory hover:bg-ivory-dark border border-wood-light/20 text-charcoal text-xs py-3 px-4 rounded-sm font-mono text-center transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Pantry Plans
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-ivory min-h-screen py-12 px-4 md:px-8 max-w-7xl mx-auto" id="pantry-config-page">
      {/* Top breadcrumb navigation link */}
      <div className="mb-8">
        <Link 
          href="/subscriptions" 
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-charcoal/50 hover:text-forest transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Pantry Plans
        </Link>
      </div>

      {/* Hero Header */}
      <div className="mb-10 pb-6 border-b border-wood-light/15">
        <span className="label text-xs mb-2">STEP-BY-STEP CUSTOMISATION</span>
        <h1 className="heading-md text-forest mb-2">Curate Your Himalayan Pantry</h1>
        <p className="text-sm text-charcoal/60 leading-relaxed max-w-xl">
          Adapt your staples list, determine dispatch intervals, and preview the next delivery box from our foothills orchards.
        </p>
      </div>

      {/* Progress Wizard Header */}
      <div className="grid grid-cols-2 gap-4 mb-10 max-w-lg">
        <button 
          onClick={() => setStep(1)}
          className={`pb-3 text-left border-b-2 text-xs font-mono uppercase tracking-widest transition-colors ${
            step === 1 ? "border-forest text-forest font-bold" : "border-wood-light/15 text-charcoal/40"
          }`}
        >
          01. Curate Basket
        </button>
        <button 
          onClick={() => basket.length > 0 ? setStep(2) : null}
          disabled={basket.length === 0}
          className={`pb-3 text-left border-b-2 text-xs font-mono uppercase tracking-widest transition-colors ${
            step === 2 ? "border-forest text-forest font-bold" : "border-wood-light/15 text-charcoal/40 disabled:opacity-50"
          }`}
        >
          02. Dispatch & Logistics
        </button>
      </div>

      {/* Main Grid: Forms on Left, Sticky Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Left Side Wizard steps */}
        <div className="lg:col-span-2 space-y-8">
          
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="heading-xs text-forest font-heading mb-2">Your Curated Basket Contents</h2>
                  <p className="text-xs text-charcoal/60 leading-relaxed font-body">
                    Every month, your package contains these custom selections. Add more regional goods or adjust quantities below.
                  </p>
                </div>

                {/* Basket List */}
                <div className="space-y-3">
                  {basket.length === 0 ? (
                    <div className="bg-ivory-dark/10 border border-dashed border-wood-light/30 rounded-sm p-8 text-center">
                      <p className="text-xs text-charcoal/50 italic mb-2">Your basket is currently empty.</p>
                      <p className="text-[10px] text-charcoal/40 font-mono">Select some harvest staples below to populate your pantry.</p>
                    </div>
                  ) : (
                    basket.map(item => {
                      const product = ELIGIBLE_PRODUCTS.find(p => p.id === item.productId)
                      if (!product) return null
                      return (
                        <div 
                          key={item.productId}
                          className="bg-ivory border border-wood-light/15 rounded-sm p-4 flex items-center justify-between shadow-sm hover:border-wood-light/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 bg-ivory-dark/20 rounded-sm overflow-hidden shrink-0">
                              <Image 
                                src={product.image} 
                                alt={product.name} 
                                fill 
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-charcoal font-body">{product.name}</h4>
                              <p className="text-[10px] text-charcoal/50 font-mono mt-0.5">₹{product.price} / {product.weight}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-ivory border border-wood-light/25 rounded-sm p-1">
                              <button 
                                onClick={() => handleUpdateQty(item.productId, -1)}
                                className="w-5 h-5 flex items-center justify-center hover:bg-ivory-dark/20 rounded-sm text-charcoal transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-4 text-center text-xs font-mono font-semibold text-charcoal">{item.quantity}</span>
                              <button 
                                onClick={() => handleUpdateQty(item.productId, 1)}
                                className="w-5 h-5 flex items-center justify-center hover:bg-ivory-dark/20 rounded-sm text-charcoal transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button 
                              onClick={() => handleRemoveItem(item.productId)}
                              className="text-terracotta/40 hover:text-terracotta p-1.5 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Add items to pantry */}
                <div className="pt-6 border-t border-wood-light/10">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-forest mb-4">Add More Mountain Goods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ELIGIBLE_PRODUCTS.map(prod => {
                      const isAlreadyAdded = basket.some(b => b.productId === prod.id)
                      return (
                        <div 
                          key={prod.id}
                          className={`border rounded-sm p-4 flex gap-3 transition-all relative overflow-hidden ${
                            isAlreadyAdded ? "border-forest/30 bg-forest/5" : "border-wood-light/15 bg-ivory hover:border-wood-light/30"
                          }`}
                        >
                          <div className="relative w-14 h-14 bg-ivory-dark/20 rounded-sm overflow-hidden shrink-0">
                            <Image 
                              src={prod.image} 
                              alt={prod.name} 
                              fill 
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="text-[11px] font-semibold text-charcoal font-body truncate leading-tight">{prod.name}</h4>
                              <p className="text-[10px] text-charcoal/50 font-mono mt-0.5">₹{prod.price} / {prod.weight}</p>
                            </div>

                            <div className="flex justify-end">
                              {isAlreadyAdded ? (
                                <span className="text-[10px] font-mono text-forest font-semibold flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  In Basket
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleAddItem(prod.id)}
                                  className="text-[10px] font-mono uppercase tracking-wider text-wood hover:text-forest font-bold transition-colors"
                                >
                                  + Add to Pantry
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Wizard Footer Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setStep(2)}
                    disabled={basket.length === 0}
                    className="btn-primary py-3 px-6 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Select Dispatch Window
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="heading-xs text-forest font-heading mb-2">Preferred Logistics & Rythms</h2>
                  <p className="text-xs text-charcoal/60 leading-relaxed font-body">
                    Choose how often you would like your basket dispatched and select the window when you prefer to receive it at your doorstep.
                  </p>
                </div>

                {/* Frequency selection cards */}
                <div className="space-y-4">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-charcoal/50 mb-2">1. Dispatch Frequency</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <button
                      onClick={() => setFrequency("monthly")}
                      className={`border p-4 rounded-sm text-left transition-all ${
                        frequency === "monthly" ? "border-forest bg-forest/5" : "border-wood-light/15 hover:border-wood-light/30 bg-ivory"
                      }`}
                    >
                      <span className="block text-xs font-semibold text-charcoal mb-1">Every Month</span>
                      <span className="block text-[10px] text-charcoal/50 leading-relaxed">Most popular. Keeps your kitchen stocked with fresh spring harvest teas and rich honey.</span>
                    </button>

                    <button
                      onClick={() => setFrequency("bi_monthly")}
                      className={`border p-4 rounded-sm text-left transition-all ${
                        frequency === "bi_monthly" ? "border-forest bg-forest/5" : "border-wood-light/15 hover:border-wood-light/30 bg-ivory"
                      }`}
                    >
                      <span className="block text-xs font-semibold text-charcoal mb-1">Every 2 Months</span>
                      <span className="block text-[10px] text-charcoal/50 leading-relaxed">Balanced. Recommended for individuals or smaller households enjoying casual brewing.</span>
                    </button>

                    <button
                      onClick={() => setFrequency("tri_monthly")}
                      className={`border p-4 rounded-sm text-left transition-all ${
                        frequency === "tri_monthly" ? "border-forest bg-forest/5" : "border-wood-light/15 hover:border-wood-light/30 bg-ivory"
                      }`}
                    >
                      <span className="block text-xs font-semibold text-charcoal mb-1">Every 3 Months</span>
                      <span className="block text-[10px] text-charcoal/50 leading-relaxed">Seasonal cadence. Ideal for keeping pantry preserves and traditional recipes aligned with seasons.</span>
                    </button>

                  </div>
                </div>

                {/* Dispatch Window Selection */}
                <div className="space-y-4 pt-4 border-t border-wood-light/10">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-charcoal/50 mb-2">2. Preferred Dispatch Window</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <button
                      onClick={() => setDeliveryWindow("early_month")}
                      className={`border p-4 rounded-sm text-left transition-all flex items-start gap-3 ${
                        deliveryWindow === "early_month" ? "border-forest bg-forest/5" : "border-wood-light/15 hover:border-wood-light/30 bg-ivory"
                      }`}
                    >
                      <Truck className="w-5 h-5 text-wood mt-0.5 shrink-0" />
                      <div>
                        <span className="block text-xs font-semibold text-charcoal mb-1">First Week (1st - 5th)</span>
                        <span className="block text-[10px] text-charcoal/50 leading-relaxed">Your package dispatches directly at the beginning of each calendar cycle.</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setDeliveryWindow("late_month")}
                      className={`border p-4 rounded-sm text-left transition-all flex items-start gap-3 ${
                        deliveryWindow === "late_month" ? "border-forest bg-forest/5" : "border-wood-light/15 hover:border-wood-light/30 bg-ivory"
                      }`}
                    >
                      <Clock className="w-5 h-5 text-wood mt-0.5 shrink-0" />
                      <div>
                        <span className="block text-xs font-semibold text-charcoal mb-1">Third Week (15th - 20th)</span>
                        <span className="block text-[10px] text-charcoal/50 leading-relaxed">Your package dispatches at the mid-point of each cycle, spacing out deliveries.</span>
                      </div>
                    </button>

                  </div>
                </div>

                {/* Back & Next buttons */}
                <div className="flex gap-4 pt-4 border-t border-wood-light/10">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-ivory hover:bg-ivory-dark border border-wood-light/20 text-charcoal text-xs py-3 px-6 rounded-sm font-mono text-center transition-colors"
                  >
                    Back to Basket
                  </button>
                  <button
                    onClick={handleCheckoutRedirect}
                    className="flex-1 btn-primary py-3 px-6 text-xs flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <Lock className="w-3.5 h-3.5" />
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Side sticky Summary card */}
        <div className="bg-ivory-dark/10 border border-wood-light/20 p-6 rounded-md warm-card lg:sticky lg:top-24 space-y-6">
          <div>
            <span className="label text-[9px]">SELECTED TIER</span>
            <h3 className="heading-xs text-forest mt-1">{activePlan.name}</h3>
            <p className="text-[11px] text-charcoal/60 italic font-body mt-1">{activePlan.subtitle}</p>
          </div>

          <div className="border-t border-wood-light/15 pt-4 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-charcoal/50 font-mono">Pantry Basket Qty</span>
              <span className="font-mono text-charcoal font-semibold">
                {basket.reduce((acc, item) => acc + item.quantity, 0)} items
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-charcoal/50 font-mono">Dispatch Rhythm</span>
              <span className="font-body text-charcoal font-semibold">
                {frequency === "monthly" ? "Every Month" : frequency === "bi_monthly" ? "Every 2 Months" : "Every 3 Months"}
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-charcoal/50 font-mono">Preferred Window</span>
              <span className="font-body text-charcoal font-semibold">
                {deliveryWindow === "early_month" ? "First Week" : "Third Week"}
              </span>
            </div>

            <div className="flex justify-between text-xs text-forest">
              <span className="font-mono">Logistics Delivery</span>
              <span className="font-mono font-bold uppercase text-[10px]">FREE DIRECT SHIPPING</span>
            </div>
          </div>

          {/* Value comparison */}
          <div className="border-t border-wood-light/15 pt-4">
            <span className="block text-[10px] font-mono text-charcoal/40 uppercase mb-2">Estimated Next Delivery Contents</span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {basket.map(item => {
                const prod = ELIGIBLE_PRODUCTS.find(p => p.id === item.productId)
                if (!prod) return null
                return (
                  <div key={item.productId} className="flex justify-between items-center text-[11px] font-body text-charcoal/70">
                    <span className="truncate max-w-[150px]">{prod.name}</span>
                    <span className="font-mono text-charcoal/50 shrink-0">x {item.quantity}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pricing Block */}
          <div className="border-t border-wood-light/20 pt-4 flex justify-between items-baseline">
            <div>
              <span className="text-xs font-mono uppercase text-charcoal/50">Membership Cost</span>
              <p className="text-[10px] text-charcoal/40 font-mono mt-0.5">Recurring billing per cycle</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-semibold font-mono text-forest">₹{activePlan.price}</span>
              <span className="text-xs text-charcoal/50 ml-1">/{activePlan.frequency.toLowerCase()}</span>
            </div>
          </div>

          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={basket.length === 0}
              className="w-full btn-primary py-3 px-6 text-xs flex items-center justify-center gap-2"
            >
              Select Logistics & Dispatch
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCheckoutRedirect}
              disabled={basket.length === 0}
              className="w-full btn-primary py-3 px-6 text-xs flex items-center justify-center gap-2"
            >
              Secure Checkout & Activate
              <Lock className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-mono text-charcoal/40 uppercase">
              <ShoppingBag className="w-3 h-3" />
              Direct-to-Home Foothills Harvest
            </span>
          </div>

        </div>

      </div>
    </main>
  )
}

export default function ConfigureSubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-ivory">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
        <p className="mt-4 text-xs font-mono text-charcoal/50">Loading Pantry Configurator...</p>
      </div>
    }>
      <ConfigureSubscriptionContent />
    </Suspense>
  )
}
