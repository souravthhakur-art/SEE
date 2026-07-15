"use client"

import { useState, useEffect, useTransition } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  Truck,
  Calendar,
  Plus,
  Minus,
  Trash2,
  Settings,
  AlertCircle,
  Loader2,
  Check,
  Pause,
  Play,
  ArrowRight,
  ChevronDown,
  ShoppingBag,
  MapPin,
  Tag,
  Sparkles,
  Clock,
  ArrowLeft,
  History,
  X
} from "lucide-react"
import {
  getPantryData,
  createPantry,
  pausePantry,
  resumePantry,
  updatePantrySettings,
  addPantryItem,
  updatePantryItemQuantity,
  skipNextDelivery
} from "@/app/account/pantry-actions"
import { products } from "@/lib/data"

interface Address {
  id: string
  userId: string
  label: string | null
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  postalCode: string
  country: string
  phone: string | null
  isDefault: boolean
}

interface PantryTabProps {
  addresses: Address[]
  onShowMessage: (message: { type: "success" | "error"; text: string } | null) => void
}

export function PantryTab({ addresses, onShowMessage }: PantryTabProps) {
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)
  const [pantry, setPantry] = useState<any>(null)
  
  // Setup Wizard State
  const [setupStep, setSetupStep] = useState(1)
  const [pantryName, setPantryName] = useState("My Daily Harvest")
  const [frequency, setFrequency] = useState<"monthly" | "bi_monthly" | "tri_monthly">("monthly")
  const [tier, setTier] = useState<"monthly" | "three_month" | "six_month">("monthly")
  const [deliveryWindow, setDeliveryWindow] = useState<"early_month" | "late_month">("early_month")
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [wizardItems, setWizardItems] = useState<{ productId: string; quantity: number }[]>([])

  // Dashboard Sub-Views State
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [pauseReason, setPauseReason] = useState("Have too much tea stock")
  const [showAddItemDropdown, setShowAddItemDropdown] = useState(false)

  // Fetch pantry data on mount
  const loadPantry = async () => {
    setLoading(true)
    const res = await getPantryData()
    if (res.success && res.pantry) {
      setPantry(res.pantry)
      // Autofill settings modals
      setFrequency(res.pantry.frequency)
      setDeliveryWindow(res.pantry.deliveryWindow)
      setSelectedAddressId(res.pantry.shippingAddressId || "")
    } else {
      setPantry(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadPantry()
    // Default to first address if available
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0]
      setSelectedAddressId(defaultAddr.id)
    }
  }, [addresses])

  // Get active saving percentage based on tier
  const getSavingPercent = (t: "monthly" | "three_month" | "six_month") => {
    if (t === "three_month") return 5
    if (t === "six_month") return 10
    return 0
  }

  // Filter subscription eligible products
  const subscriptionProducts = products.filter(p => p.subscriptionEligible)

  // Wizard items calculations
  const calculateWizardTotal = () => {
    let subtotal = 0
    wizardItems.forEach(item => {
      const product = subscriptionProducts.find(p => p.id === item.productId)
      if (product) {
        subtotal += product.price * item.quantity
      }
    })
    const savingPercent = getSavingPercent(tier)
    const discount = (subtotal * savingPercent) / 100
    const total = subtotal - discount
    return { subtotal, discount, total }
  }

  // Adjust quantity in Wizard
  const handleWizardQtyChange = (productId: string, change: number) => {
    setWizardItems(prev => {
      const existing = prev.find(item => item.productId === productId)
      if (existing) {
        const newQty = existing.quantity + change
        if (newQty <= 0) {
          return prev.filter(item => item.productId !== productId)
        }
        return prev.map(item => item.productId === productId ? { ...item, quantity: newQty } : item)
      } else if (change > 0) {
        return [...prev, { productId, quantity: change }]
      }
      return prev
    })
  }

  // Handle new pantry creation
  const handleCreatePantry = () => {
    if (wizardItems.length === 0) {
      onShowMessage({ type: "error", text: "Please add at least one product to your pantry." })
      return
    }
    if (!selectedAddressId) {
      onShowMessage({ type: "error", text: "Please choose or add a delivery address first." })
      return
    }

    startTransition(async () => {
      const savingPercent = getSavingPercent(tier)
      const res = await createPantry({
        name: pantryName,
        deliveryWindow,
        frequency,
        tier,
        savingPercent,
        shippingAddressId: selectedAddressId,
        items: wizardItems
      })

      if (res.success) {
        onShowMessage({ type: "success", text: `Your subscription "${pantryName}" has been successfully curated!` })
        await loadPantry()
      } else {
        onShowMessage({ type: "error", text: res.error || "Failed to create subscription." })
      }
    })
  }

  // Handle active status controls
  const handleTogglePause = () => {
    if (!pantry) return

    startTransition(async () => {
      let res
      if (pantry.status === "active") {
        res = await pausePantry(pantry.id, pauseReason)
        setShowPauseModal(false)
      } else {
        res = await resumePantry(pantry.id)
      }

      if (res.success) {
        onShowMessage({
          type: "success",
          text: pantry.status === "active" ? "Pantry subscription paused successfully." : "Pantry subscription resumed!"
        })
        await loadPantry()
      } else {
        onShowMessage({ type: "error", text: res.error || "Action failed." })
      }
    })
  }

  // Handle settings update
  const handleUpdateSettings = () => {
    if (!pantry) return

    startTransition(async () => {
      const res = await updatePantrySettings(pantry.id, {
        deliveryWindow,
        frequency,
        shippingAddressId: selectedAddressId
      })

      if (res.success) {
        onShowMessage({ type: "success", text: "Pantry settings updated successfully!" })
        setShowSettingsModal(false)
        await loadPantry()
      } else {
        onShowMessage({ type: "error", text: res.error || "Update failed." })
      }
    })
  }

  // Add item to active pantry
  const handleAddActiveItem = (productId: string) => {
    if (!pantry) return

    startTransition(async () => {
      const res = await addPantryItem(pantry.id, productId, 1)
      if (res.success) {
        onShowMessage({ type: "success", text: "Product added to your next dispatch!" })
        setShowAddItemDropdown(false)
        await loadPantry()
      } else {
        onShowMessage({ type: "error", text: res.error || "Addition failed." })
      }
    })
  }

  // Adjust active item quantity
  const handleAdjustActiveItemQty = (itemId: string, currentQty: number, change: number) => {
    if (!pantry) return

    startTransition(async () => {
      const res = await updatePantryItemQuantity(pantry.id, itemId, currentQty + change)
      if (res.success) {
        onShowMessage({ type: "success", text: "Pantry quantity updated." })
        await loadPantry()
      } else {
        onShowMessage({ type: "error", text: res.error || "Update failed." })
      }
    })
  }

  // Skip a scheduled cycle
  const handleSkipCycle = (scheduleId: string) => {
    if (!pantry) return
    if (!confirm("Are you sure you want to skip this scheduled delivery cycle? You won't be billed for this skipped dispatch.")) return

    startTransition(async () => {
      const res = await skipNextDelivery(pantry.id, scheduleId)
      if (res.success) {
        onShowMessage({ type: "success", text: "Scheduled cycle skipped successfully." })
        await loadPantry()
      } else {
        onShowMessage({ type: "error", text: res.error || "Skip failed." })
      }
    })
  }

  // UI Helpers
  const getSelectedAddressText = (id: string) => {
    const addr = addresses.find(a => a.id === id)
    if (!addr) return "No delivery address chosen."
    return `${addr.label ? `[${addr.label}] ` : ""}${addr.addressLine1}, ${addr.city}, ${addr.state}`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-ivory-dark/10 border border-wood-light/20 rounded-md warm-card">
        <Loader2 className="w-8 h-8 text-forest animate-spin mb-4" />
        <p className="text-xs font-mono text-charcoal/50">Fetching mountain pantry coordinates...</p>
      </div>
    )
  }

  // ==================== SCREEN 1: NEW SUBSCRIBER WIZARD ====================
  if (!pantry) {
    const { subtotal, discount, total } = calculateWizardTotal()
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-ivory-dark/10 border border-wood-light/20 rounded-md p-8 warm-card"
        id="pane-pantry-wizard"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-wood" />
          <span className="label">MEMBER HARVEST STAPLES</span>
        </div>
        <h1 className="heading-sm mb-6 text-forest">My Pantry Subscription</h1>

        {/* Wizard Navigation Progress */}
        <div className="flex items-center justify-between mb-8 max-w-md bg-ivory-dark/15 border border-wood-light/10 p-1.5 rounded-sm">
          <button
            onClick={() => setSetupStep(1)}
            className={`flex-1 text-center py-1.5 text-[10px] tracking-wider uppercase font-mono rounded-sm transition-all ${
              setupStep === 1 ? "bg-forest text-ivory" : "text-charcoal/50"
            }`}
          >
            1. Curate
          </button>
          <button
            onClick={() => {
              if (wizardItems.length > 0) setSetupStep(2)
            }}
            disabled={wizardItems.length === 0}
            className={`flex-1 text-center py-1.5 text-[10px] tracking-wider uppercase font-mono rounded-sm transition-all ${
              setupStep === 2 ? "bg-forest text-ivory" : "text-charcoal/30 disabled:opacity-50"
            }`}
          >
            2. Logistics
          </button>
        </div>

        {/* STEP 1: SELECT ITEMS */}
        {setupStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3">
              <h3 className="heading-xs text-forest mb-4">Choose subscription-eligible items:</h3>
              <p className="text-xs text-charcoal/60 leading-relaxed font-body mb-6">
                Curate pristine Kangra orthodox leaf teas and artisanal wild forest goods delivered straight from the foothills to your table, with exclusive subscriber discounts applied.
              </p>

              <div className="flex flex-col gap-4">
                {subscriptionProducts.map(product => {
                  const currentItem = wizardItems.find(item => item.productId === product.id)
                  const qty = currentItem?.quantity || 0

                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between bg-ivory-dark/20 border border-wood-light/10 p-4 rounded-sm hover:border-wood-light/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-forest/5 border border-wood-light/15 rounded-sm overflow-hidden relative shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-charcoal font-body truncate">{product.name}</h4>
                          <p className="text-[10px] text-charcoal/50 font-mono mt-0.5">₹{product.price} / {product.weight}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleWizardQtyChange(product.id, -1)}
                          className="w-7 h-7 bg-ivory border border-wood-light/20 flex items-center justify-center text-charcoal hover:bg-ivory-dark/20 rounded-sm transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-semibold text-charcoal">{qty}</span>
                        <button
                          onClick={() => handleWizardQtyChange(product.id, 1)}
                          className="w-7 h-7 bg-ivory border border-wood-light/20 flex items-center justify-center text-charcoal hover:bg-ivory-dark/20 rounded-sm transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Step 1 Right Side Summary */}
            <div className="lg:col-span-2 bg-ivory-dark/20 border border-wood-light/15 p-6 rounded-sm flex flex-col justify-between self-start">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-forest font-heading mb-4 pb-2 border-b border-wood-light/15">Selected Staples</h3>
                
                {wizardItems.length === 0 ? (
                  <p className="text-xs italic text-charcoal/50 py-4 font-body text-center">Your curated staples list is empty.</p>
                ) : (
                  <div className="flex flex-col gap-3 mb-6">
                    {wizardItems.map(item => {
                      const product = subscriptionProducts.find(p => p.id === item.productId)
                      if (!product) return null
                      return (
                        <div key={item.productId} className="flex justify-between items-center text-xs font-body text-charcoal">
                          <span className="truncate pr-4">{product.name} <span className="text-[10px] font-mono text-charcoal/40">({item.quantity}x)</span></span>
                          <span className="font-mono">₹{product.price * item.quantity}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div>
                <div className="border-t border-wood-light/10 pt-4 flex justify-between items-center mb-6">
                  <span className="text-xs font-mono uppercase text-charcoal/50">Curated Price</span>
                  <span className="text-sm font-semibold font-mono text-charcoal">₹{subtotal}</span>
                </div>

                <button
                  onClick={() => setSetupStep(2)}
                  disabled={wizardItems.length === 0}
                  className="w-full btn-primary py-3 px-6 text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Configure Logistics
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LOGISTICS AND TIER SELECT */}
        {setupStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3">
              <h3 className="heading-xs text-forest mb-4">Set subscription cycle & billing terms:</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Subscription Name */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-mono uppercase text-charcoal/40 mb-2">Subscription Name</label>
                  <input
                    type="text"
                    value={pantryName}
                    onChange={(e) => setPantryName(e.target.value)}
                    className="w-full text-xs font-body p-3 border border-wood-light/20 rounded-sm bg-ivory outline-none focus:border-forest transition-colors"
                    placeholder="e.g. My Daily Staples"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-charcoal/40 mb-2">Harvest Dispatch Cycle</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full text-xs font-body p-3 border border-wood-light/20 rounded-sm bg-ivory outline-none focus:border-forest transition-colors"
                  >
                    <option value="monthly">Every Month (Staples)</option>
                    <option value="bi_monthly">Every 2 Months (Standard)</option>
                    <option value="tri_monthly">Every 3 Months (Seasonal)</option>
                  </select>
                </div>

                {/* Dispatch Window */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-charcoal/40 mb-2">Preferred Dispatch Window</label>
                  <select
                    value={deliveryWindow}
                    onChange={(e) => setDeliveryWindow(e.target.value as any)}
                    className="w-full text-xs font-body p-3 border border-wood-light/20 rounded-sm bg-ivory outline-none focus:border-forest transition-colors"
                  >
                    <option value="early_month">Early Month (1st-5th)</option>
                    <option value="late_month">Late Month (15th-20th)</option>
                  </select>
                </div>

                {/* Select Address */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-mono uppercase text-charcoal/40 mb-2">Dispatch Destination</label>
                  {addresses.length === 0 ? (
                    <div className="p-4 border border-terracotta/20 bg-terracotta/5 text-xs text-terracotta rounded-sm">
                      No saved addresses found. Please save a shipping address first in the <strong>Saved Addresses</strong> tab.
                    </div>
                  ) : (
                    <select
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="w-full text-xs font-body p-3 border border-wood-light/20 rounded-sm bg-ivory outline-none focus:border-forest transition-colors"
                    >
                      {addresses.map(addr => (
                        <option key={addr.id} value={addr.id}>
                          {addr.label ? `[${addr.label}] ` : ""}{addr.addressLine1}, {addr.city}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Billing Tiers */}
              <h4 className="block text-[10px] font-mono uppercase text-charcoal/40 mb-3">Subscription Tier Savings Plan</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setTier("monthly")}
                  className={`border p-4 rounded-sm text-left transition-all ${
                    tier === "monthly" ? "border-forest bg-forest/5" : "border-wood-light/20 hover:border-wood-light/40"
                  }`}
                >
                  <span className="block text-xs font-semibold text-charcoal mb-1">Standard Monthly</span>
                  <span className="block text-[10px] text-charcoal/50 leading-normal">Billing per cycle. Standard rates apply. 0% discount.</span>
                </button>

                <button
                  onClick={() => setTier("three_month")}
                  className={`border p-4 rounded-sm text-left transition-all relative overflow-hidden ${
                    tier === "three_month" ? "border-forest bg-forest/5" : "border-wood-light/20 hover:border-wood-light/40"
                  }`}
                >
                  <span className="absolute top-0 right-0 bg-wood text-ivory px-2 py-0.5 text-[8px] font-mono rounded-bl-sm">SAVE 5%</span>
                  <span className="block text-xs font-semibold text-charcoal mb-1">3-Month Term</span>
                  <span className="block text-[10px] text-charcoal/50 leading-normal">Commit to 3 harvest cycles. Exclusive 5% savings.</span>
                </button>

                <button
                  onClick={() => setTier("six_month")}
                  className={`border p-4 rounded-sm text-left transition-all relative overflow-hidden ${
                    tier === "six_month" ? "border-forest bg-forest/5" : "border-wood-light/20 hover:border-wood-light/40"
                  }`}
                >
                  <span className="absolute top-0 right-0 bg-forest text-ivory px-2 py-0.5 text-[8px] font-mono rounded-bl-sm">SAVE 10%</span>
                  <span className="block text-xs font-semibold text-charcoal mb-1">6-Month Term</span>
                  <span className="block text-[10px] text-charcoal/50 leading-normal">Commit to 6 harvest cycles. Best 10% savings.</span>
                </button>
              </div>
            </div>

            {/* Step 2 Right Side Final Summary & Checkout */}
            <div className="lg:col-span-2 bg-ivory-dark/20 border border-wood-light/15 p-6 rounded-sm flex flex-col justify-between self-start">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-forest font-heading mb-4 pb-2 border-b border-wood-light/15">Harvest Confirmation</h3>

                <div className="flex flex-col gap-3 mb-6 border-b border-wood-light/10 pb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-charcoal/50 font-mono uppercase text-[10px]">Staples Subtotal</span>
                    <span className="font-mono text-charcoal">₹{subtotal}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-xs text-forest">
                      <span className="font-mono uppercase text-[10px]">Tier Savings ({getSavingPercent(tier)}%)</span>
                      <span className="font-mono">- ₹{discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-charcoal/50 font-mono uppercase text-[10px]">Cycle Frequency</span>
                    <span className="font-body text-charcoal font-semibold">
                      {frequency === "monthly" ? "Every Month" : frequency === "bi_monthly" ? "Every 2 Months" : "Every 3 Months"}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="block text-[10px] font-mono uppercase text-charcoal/40 mb-1">Dispatch Coordinate</span>
                  <p className="text-xs text-charcoal font-body leading-relaxed">{getSelectedAddressText(selectedAddressId)}</p>
                </div>
              </div>

              <div>
                <div className="border-t border-wood-light/10 pt-4 flex justify-between items-center mb-6">
                  <span className="text-xs font-mono uppercase text-charcoal/50">Total Cycle Cost</span>
                  <span className="text-base font-semibold font-mono text-forest">₹{total}</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSetupStep(1)}
                    className="flex-1 bg-ivory hover:bg-ivory-dark border border-wood-light/20 text-charcoal text-xs py-3 px-4 rounded-sm font-mono text-center transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreatePantry}
                    disabled={isPending || addresses.length === 0}
                    className="flex-[2] btn-primary py-3 px-6 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Activate Pantry
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  // ==================== SCREEN 2: ACTIVE SUBSCRIBER DASHBOARD ====================
  const isActive = pantry.status === "active"
  const isPaused = pantry.status === "paused"

  // Calculate Active Pantry Cost
  const calculateActiveTotals = () => {
    let subtotal = 0
    pantry.items.forEach((item: any) => {
      const product = products.find(p => p.id === item.productId)
      if (product) {
        subtotal += product.price * item.quantity
      }
    })
    const discount = (subtotal * pantry.savingPercent) / 100
    const total = subtotal - discount
    return { subtotal, discount, total }
  }

  const totals = calculateActiveTotals()

  return (
    <div className="flex flex-col gap-8" id="pantry-active-dashboard">
      {/* 2.1 Overview / Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-ivory-dark/10 border border-wood-light/20 rounded-md p-8 warm-card"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="label">PERSONAL HARVEST CHAMBER</span>
              <span className={`badge uppercase rounded-sm px-2 py-0.5 text-[9px] font-semibold font-mono border ${
                isActive 
                  ? "bg-forest/5 border-forest/20 text-forest-light" 
                  : "bg-terracotta/5 border-terracotta/20 text-terracotta"
              }`}>
                {pantry.status}
              </span>
            </div>
            <h1 className="heading-sm text-forest mb-1">{pantry.name}</h1>
            <p className="text-xs text-charcoal/50 leading-none">
              Activated on {new Date(pantry.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>

          <div className="flex gap-3">
            {isActive ? (
              <button
                onClick={() => setShowPauseModal(true)}
                className="bg-ivory hover:bg-ivory-dark text-charcoal border border-wood-light/20 rounded-sm text-xs px-4 py-2.5 font-body flex items-center gap-2 transition-all"
              >
                <Pause className="w-3.5 h-3.5" />
                Pause Dispatch
              </button>
            ) : (
              <button
                onClick={handleTogglePause}
                disabled={isPending}
                className="bg-forest hover:bg-forest-light text-ivory rounded-sm text-xs px-4 py-2.5 font-body flex items-center gap-2 transition-all"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Resume Dispatch
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setShowSettingsModal(true)}
              className="bg-ivory hover:bg-ivory-dark text-charcoal border border-wood-light/20 rounded-sm text-xs px-4 py-2.5 font-body flex items-center gap-2 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              Logistics Settings
            </button>
          </div>
        </div>

        {/* Dynamic logistics quick overview widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-wood-light/10 pt-6 mt-6">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-wood mt-0.5" />
            <div>
              <span className="block text-[10px] font-mono uppercase text-charcoal/40 mb-0.5">Cycle & Window</span>
              <p className="text-xs font-semibold text-charcoal font-body">
                {pantry.frequency === "monthly" ? "Every Month" : pantry.frequency === "bi_monthly" ? "Every 2 Months" : "Every 3 Months"}
              </p>
              <span className="text-[10px] text-charcoal/50">
                {pantry.deliveryWindow === "early_month" ? "Early Month (1st-5th)" : "Late Month (15th-20th)"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-wood mt-0.5" />
            <div>
              <span className="block text-[10px] font-mono uppercase text-charcoal/40 mb-0.5">Destination</span>
              <p className="text-xs font-semibold text-charcoal font-body truncate max-w-[180px]">
                {addresses.find(a => a.id === pantry.shippingAddressId)?.label || "Saved Address"}
              </p>
              <span className="text-[10px] text-charcoal/50 truncate block max-w-[180px]">
                {getSelectedAddressText(pantry.shippingAddressId).replace(/\[.*?\]\s*/g, "")}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Tag className="w-5 h-5 text-wood mt-0.5" />
            <div>
              <span className="block text-[10px] font-mono uppercase text-charcoal/40 mb-0.5">Billing Terms</span>
              <p className="text-xs font-semibold text-charcoal font-body">
                {pantry.tier === "monthly" ? "Standard Monthly" : pantry.tier === "three_month" ? "3-Month Agreement" : "6-Month Agreement"}
              </p>
              {pantry.savingPercent > 0 && (
                <span className="badge text-[10px] bg-forest/5 text-forest border-forest/10 rounded-sm font-semibold py-0">
                  {pantry.savingPercent}% Saving Applied
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2.2 Core Layout: Staples & Scheduled Cycles */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left 3 Cols: Curated Staples & Modifiers */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-ivory-dark/10 border border-wood-light/20 rounded-md p-6 warm-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="heading-xs text-forest">Curated Staples Basket</h3>
              
              {/* Add item drawer button */}
              <div className="relative">
                <button
                  onClick={() => setShowAddItemDropdown(!showAddItemDropdown)}
                  className="bg-forest hover:bg-forest-light text-ivory text-[10px] font-mono uppercase font-semibold px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Mountain Staples
                </button>

                {showAddItemDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-ivory border border-wood-light/20 shadow-lg rounded-sm z-30 p-2 max-h-80 overflow-y-auto">
                    <div className="p-2 text-[10px] font-mono uppercase text-charcoal/40 border-b border-wood-light/10 mb-2 flex justify-between items-center">
                      <span>Subscribe to Tea & Goods</span>
                      <button onClick={() => setShowAddItemDropdown(false)}><X className="w-3.5 h-3.5 hover:text-charcoal" /></button>
                    </div>
                    {subscriptionProducts.map(p => {
                      const isAlreadyIn = pantry.items.some((item: any) => item.productId === p.id)
                      return (
                        <button
                          key={p.id}
                          onClick={() => handleAddActiveItem(p.id)}
                          disabled={isAlreadyIn}
                          className="w-full text-left p-2 hover:bg-ivory-dark/20 flex justify-between items-center text-xs font-body text-charcoal rounded-sm disabled:opacity-50 disabled:hover:bg-transparent"
                        >
                          <span className="truncate pr-4 font-semibold">{p.name}</span>
                          <span className="font-mono text-forest shrink-0">{isAlreadyIn ? "In Pantry" : `+ Add`}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              {pantry.items.length === 0 ? (
                <p className="text-xs italic text-charcoal/50 py-6 text-center font-body">No items in your subscription basket. Use "+ Add Mountain Staples" to populate it.</p>
              ) : (
                pantry.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-ivory-dark/20 border border-wood-light/10 p-4 rounded-sm hover:border-wood-light/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-forest/5 border border-wood-light/15 rounded-sm overflow-hidden shrink-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.product?.image || "/images/tea-black.jpg"}
                          alt={item.product?.name || "Item"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-charcoal font-body truncate">{item.product?.name || "Premium Staples"}</h4>
                        <p className="text-[10px] text-charcoal/50 font-mono mt-0.5">₹{item.product?.price || 499} / {item.product?.weight || "100g"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAdjustActiveItemQty(item.id, item.quantity, -1)}
                          className="w-6 h-6 bg-ivory border border-wood-light/20 flex items-center justify-center text-charcoal hover:bg-ivory-dark/20 rounded-sm transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-mono font-semibold text-charcoal">{item.quantity}</span>
                        <button
                          onClick={() => handleAdjustActiveItemQty(item.id, item.quantity, 1)}
                          className="w-6 h-6 bg-ivory border border-wood-light/20 flex items-center justify-center text-charcoal hover:bg-ivory-dark/20 rounded-sm transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleAdjustActiveItemQty(item.id, item.quantity, -item.quantity)}
                        className="text-terracotta/40 hover:text-terracotta p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Price Calculations footer block */}
            <div className="border-t border-wood-light/10 pt-4 mt-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-charcoal/50 font-mono">Basket Value</span>
                <span className="font-mono text-charcoal">₹{totals.subtotal}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between items-center text-xs text-forest">
                  <span className="font-mono">Subscription Savings ({pantry.savingPercent}%)</span>
                  <span className="font-mono">- ₹{totals.discount}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs border-t border-wood-light/5 pt-2">
                <span className="text-charcoal font-semibold">Active Cycle Cost</span>
                <span className="font-mono text-forest font-bold text-sm">₹{totals.total}</span>
              </div>
            </div>
          </div>

          {/* Harvest Dispatch Log / History Timeline */}
          <div className="bg-ivory-dark/10 border border-wood-light/20 rounded-md p-6 warm-card">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-wood" />
              <h3 className="heading-xs text-forest">Harvest Activity Log</h3>
            </div>
            
            <div className="flex flex-col gap-4 max-h-60 overflow-y-auto pr-2">
              {pantry.history?.length === 0 ? (
                <p className="text-xs italic text-charcoal/50 py-2">No past history recorded.</p>
              ) : (
                pantry.history?.map((log: any) => (
                  <div key={log.id} className="text-xs border-l border-wood-light/20 pl-4 relative">
                    <span className="absolute w-2 h-2 rounded-full bg-wood -left-[4.5px] top-1.5"></span>
                    <div className="flex justify-between items-center text-[10px] font-mono text-charcoal/40 mb-0.5">
                      <span className="uppercase">{log.action.replace(/_/g, " ")}</span>
                      <span>{new Date(log.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-charcoal/70 font-body leading-normal">{log.notes}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Delivery Schedules */}
        <div className="lg:col-span-2">
          <div className="bg-ivory-dark/10 border border-wood-light/20 rounded-md p-6 warm-card h-full">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-wood" />
              <h3 className="heading-xs text-forest">Upcoming Harvester Dispatches</h3>
            </div>
            <p className="text-xs text-charcoal/60 leading-relaxed font-body mb-6">
              Your Dhauladhar foothills harvests are scheduled dynamically. You can bypass any upcoming cycle if you are traveling or stocked up.
            </p>

            <div className="flex flex-col gap-4">
              {pantry.schedules?.length === 0 ? (
                <p className="text-xs italic text-charcoal/50 py-4 text-center">No delivery cycles scheduled.</p>
              ) : (
                pantry.schedules?.map((sched: any) => {
                  const scheduleMonthStr = new Date(sched.scheduledDate).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })

                  const isPending = sched.status === "pending"
                  const isSkipped = sched.status === "skipped"
                  const isCompleted = sched.status === "completed"

                  return (
                    <div
                      key={sched.id}
                      className="border border-wood-light/10 p-4 rounded-sm flex flex-col justify-between bg-ivory-dark/20"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-xs font-semibold text-charcoal font-body">{scheduleMonthStr}</h4>
                          <span className="text-[10px] font-mono text-charcoal/50">Est. Dispatch Date: 10th</span>
                        </div>
                        <span className={`badge uppercase rounded-sm px-1.5 py-0.5 text-[8px] font-semibold font-mono border ${
                          isPending 
                            ? "bg-wood/5 border-wood/20 text-wood" 
                            : isSkipped 
                              ? "bg-charcoal/5 border-charcoal/10 text-charcoal/50" 
                              : "bg-forest/5 border-forest/20 text-forest-light"
                        }`}>
                          {sched.status}
                        </span>
                      </div>

                      {isPending && isActive && (
                        <button
                          onClick={() => handleSkipCycle(sched.id)}
                          className="w-full text-center py-2 bg-ivory border border-terracotta/20 hover:bg-terracotta/5 text-terracotta text-[10px] font-mono uppercase rounded-sm transition-all"
                        >
                          Skip Cycle
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ==================== LOGISTICS SETTINGS MODAL ==================== */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-ivory border border-wood-light/20 p-6 rounded-md max-w-md w-full shadow-xl relative"
            >
              <button
                onClick={() => setShowSettingsModal(false)}
                className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="heading-xs text-forest font-medium mb-4">Edit Subscription Logistics</h3>
              
              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-charcoal/40 mb-1">Harvest Dispatch Cycle</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full text-xs font-body p-2 border border-wood-light/20 rounded-sm bg-ivory outline-none focus:border-forest"
                  >
                    <option value="monthly">Every Month (Staples)</option>
                    <option value="bi_monthly">Every 2 Months (Standard)</option>
                    <option value="tri_monthly">Every 3 Months (Seasonal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-charcoal/40 mb-1">Preferred Dispatch Window</label>
                  <select
                    value={deliveryWindow}
                    onChange={(e) => setDeliveryWindow(e.target.value as any)}
                    className="w-full text-xs font-body p-2 border border-wood-light/20 rounded-sm bg-ivory outline-none focus:border-forest"
                  >
                    <option value="early_month">Early Month (1st-5th)</option>
                    <option value="late_month">Late Month (15th-20th)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-charcoal/40 mb-1">Dispatch Destination</label>
                  <select
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="w-full text-xs font-body p-2 border border-wood-light/20 rounded-sm bg-ivory outline-none focus:border-forest"
                  >
                    {addresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label ? `[${addr.label}] ` : ""}{addr.addressLine1}, {addr.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t border-wood-light/10 pt-4">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="bg-ivory border border-wood-light/20 px-4 py-2 rounded-sm text-charcoal text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSettings}
                  disabled={isPending}
                  className="bg-forest hover:bg-forest-light px-4 py-2 rounded-sm text-ivory text-xs font-mono"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== PAUSE MODAL ==================== */}
      <AnimatePresence>
        {showPauseModal && (
          <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-ivory border border-wood-light/20 p-6 rounded-md max-w-sm w-full shadow-xl relative"
            >
              <button
                onClick={() => setShowPauseModal(false)}
                className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="heading-xs text-forest font-medium mb-2">Pause Harvester Subscription</h3>
              <p className="text-xs text-charcoal/60 font-body mb-4">
                Bypass upcoming dispatches temporarily. You can reactivate your pantry at any point with one click.
              </p>
              
              <div className="mb-6">
                <label className="block text-[10px] font-mono uppercase text-charcoal/40 mb-1.5">Specify Reason</label>
                <select
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                  className="w-full text-xs font-body p-2 border border-wood-light/20 rounded-sm bg-ivory outline-none focus:border-forest"
                >
                  <option value="Traveling / Away">Traveling / Out of town</option>
                  <option value="Have too much tea stock">Fully stocked with tea currently</option>
                  <option value="Financial adjustment">Budget adjustment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end border-t border-wood-light/10 pt-4">
                <button
                  onClick={() => setShowPauseModal(false)}
                  className="bg-ivory border border-wood-light/20 px-4 py-2 rounded-sm text-charcoal text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTogglePause}
                  disabled={isPending}
                  className="bg-terracotta text-ivory hover:bg-terracotta/90 px-4 py-2 rounded-sm text-xs font-mono"
                >
                  Pause Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
