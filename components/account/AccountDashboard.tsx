"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User as UserIcon, 
  MapPin, 
  Mail, 
  Shield, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  AlertCircle,
  Loader2,
  Calendar,
  LogOut,
  Phone,
  ShoppingBag,
  ChevronRight,
  Clock,
  ArrowLeft,
  Copy,
  ExternalLink,
  Tag,
  Truck
} from "lucide-react"
import { updateProfile, updateNewsletterPreferences, saveAddress, deleteAddress } from "@/app/account/actions"
import { PantryTab } from "@/components/account/PantryTab"
import { authClient } from "@/lib/auth-client"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useCartStore } from "@/lib/cart-store"

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
  isDefaultShipping: boolean
  isDefaultBilling: boolean
  createdAt: Date
}

interface UserProfile {
  id: string
  fullName: string
  email: string
  phone: string | null
  createdAt: Date
  marketingConsent: boolean
}

interface OrderItem {
  id: string
  productId: string | null
  productName: string
  quantity: number
  price: number
  weight: string
  image: string
}

interface OrderHistory {
  id: string
  status: string
  notes: string | null
  createdAt: Date
}

interface Order {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  shippingFee: number
  discount: number
  tax: number
  grandTotal: number
  couponCode: string | null
  notes: string | null
  customerName: string
  customerEmail: string
  customerPhone: string | null
  shippingAddress: any
  billingAddress: any
  createdAt: Date
  items: OrderItem[]
  history: OrderHistory[]
}

interface AccountDashboardProps {
  user: UserProfile
  addresses: Address[]
  newsletterActive: boolean
  orders?: Order[]
}

type TabType = "profile" | "orders" | "addresses" | "newsletter" | "security" | "settings" | "pantry"

export function AccountDashboard({ user, addresses, newsletterActive, orders = [] }: AccountDashboardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>("profile")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  // Sync tab search param with activeTab state
  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam === "addresses" || tabParam === "newsletter" || tabParam === "security" || tabParam === "settings" || tabParam === "profile" || tabParam === "orders" || tabParam === "pantry") {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Profile / Settings Forms State
  const [fullName, setFullName] = useState(user.fullName)
  const [phone, setPhone] = useState(user.phone || "")

  // Newsletter States
  const [subscribed, setSubscribed] = useState(newsletterActive)
  const [marketingConsent, setMarketingConsent] = useState(user.marketingConsent)

  // Password / Security Form States
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressLabel, setAddressLabel] = useState("")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [addressPhone, setAddressPhone] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [isDefaultShipping, setIsDefaultShipping] = useState(false)
  const [isDefaultBilling, setIsDefaultBilling] = useState(false)

  // Reset address form
  const resetAddressForm = () => {
    setEditingAddress(null)
    setAddressLabel("")
    setAddressLine1("")
    setAddressLine2("")
    setCity("")
    setState("")
    setPostalCode("")
    setAddressPhone("")
    setIsDefault(false)
    setIsDefaultShipping(false)
    setIsDefaultBilling(false)
    setShowAddressForm(false)
  }

  // Edit address trigger
  const startEditAddress = (addr: Address) => {
    setEditingAddress(addr)
    setAddressLabel(addr.label || "")
    setAddressLine1(addr.addressLine1)
    setAddressLine2(addr.addressLine2 || "")
    setCity(addr.city)
    setState(addr.state)
    setPostalCode(addr.postalCode)
    setAddressPhone(addr.phone || "")
    setIsDefault(addr.isDefault)
    setIsDefaultShipping(addr.isDefaultShipping)
    setIsDefaultBilling(addr.isDefaultBilling)
    setShowAddressForm(true)
  }

  // Handlers
  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setMessage(null)

    const res = await updateProfile({ fullName, phone })
    setIsPending(false)

    if (res.success) {
      setMessage({ type: "success", text: "Your profile has been updated successfully." })
    } else {
      setMessage({ type: "error", text: res.error || "An error occurred." })
    }
  }

  const handleNewsletterUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setMessage(null)

    const res = await updateNewsletterPreferences({ subscribed, marketingConsent })
    setIsPending(false)

    if (res.success) {
      setMessage({ type: "success", text: "Your notification preferences have been saved." })
    } else {
      setMessage({ type: "error", text: res.error || "An error occurred." })
    }
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setMessage(null)

    const res = await saveAddress({
      id: editingAddress?.id,
      label: addressLabel,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      phone: addressPhone,
      isDefault,
      isDefaultShipping,
      isDefaultBilling,
    })

    setIsPending(false)

    if (res.success) {
      setMessage({ 
        type: "success", 
        text: editingAddress ? "Address updated successfully." : "Address saved successfully." 
      })
      resetAddressForm()
    } else {
      setMessage({ type: "error", text: res.error || "An error occurred." })
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to remove this address?")) return
    setIsPending(true)
    setMessage(null)

    const res = await deleteAddress(id)
    setIsPending(false)

    if (res.success) {
      setMessage({ type: "success", text: "Address removed successfully." })
    } else {
      setMessage({ type: "error", text: res.error || "An error occurred." })
    }
  }

  // Left sidebar tab navigation config
  const navItems = [
    { id: "profile", label: "My Profile", icon: UserIcon },
    { id: "pantry", label: "My Pantry", icon: Truck },
    { id: "orders", label: "Order History", icon: ShoppingBag, count: orders.length },
    { id: "addresses", label: "Saved Addresses", icon: MapPin, count: addresses.length },
    { id: "newsletter", label: "Newsletter & Alerts", icon: Mail },
    { id: "security", label: "Security", icon: Shield },
    { id: "settings", label: "Account Settings", icon: Settings },
  ] as const

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start w-full" id="account-dashboard">
      {/* Sidebar Navigation */}
      <div className="col-span-1 flex flex-col gap-1 w-full" id="dashboard-sidebar">
        <div className="bg-ivory-dark/15 border border-wood-light/15 rounded-md p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-11 h-11 rounded-full bg-forest text-ivory flex items-center justify-center font-heading text-xl font-medium">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-forest truncate">{user.fullName}</h2>
              <p className="text-xs text-charcoal/50 truncate font-mono">{user.email}</p>
            </div>
          </div>
          <div className="border-t border-wood-light/10 pt-3 flex items-center gap-2 text-[11px] text-charcoal/50">
            <Calendar className="w-3.5 h-3.5 text-wood" />
            <span>Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 bg-ivory-dark/5 rounded-md border border-wood-light/10 p-2" id="dashboard-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setMessage(null)
                  resetAddressForm()
                }}
                className={`flex items-center justify-between px-4 py-3 text-xs tracking-wider uppercase font-body rounded-sm transition-all duration-300 ${
                  isActive 
                    ? "bg-forest text-ivory font-medium shadow-sm" 
                    : "text-charcoal/60 hover:text-charcoal hover:bg-ivory-dark/20"
                }`}
                type="button"
                id={`nav-${item.id}`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 opacity-80" />
                  {item.label}
                </span>
                {"count" in item && item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${isActive ? "bg-ivory text-forest" : "bg-forest/10 text-forest"}`}>
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 mt-4 text-xs tracking-wider uppercase font-body rounded-sm text-terracotta hover:bg-terracotta/5 transition-colors duration-200"
            type="button"
            id="nav-logout"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </nav>
      </div>

      {/* Main Content Pane */}
      <div className="col-span-1 lg:col-span-3 min-h-[50vh]" id="dashboard-content-pane">
        {/* Toast Notification/Banners */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 border rounded-sm flex items-start gap-3 ${
              message.type === "success" 
                ? "bg-forest/5 border-forest/20 text-forest-light" 
                : "bg-terracotta/5 border-terracotta/20 text-terracotta"
            }`}
            id="dashboard-alert-banner"
          >
            {message.type === "success" ? (
              <Check className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div className="text-sm leading-relaxed font-body">
              {message.text}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-ivory-dark/10 border border-wood-light/20 rounded-md p-8 warm-card"
              id="pane-profile"
            >
              <span className="label mb-2">COLLECTIVE IDENTIFICATION</span>
              <h1 className="heading-sm mb-6 text-forest">My Profile</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-wood-light/10 pt-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-charcoal/40">Full Legal Name</span>
                  <p className="text-sm font-semibold text-charcoal font-body">{user.fullName}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-charcoal/40">Registered Email Address</span>
                  <p className="text-sm font-semibold text-charcoal font-body truncate">{user.email}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-charcoal/40">Registered Mobile Number</span>
                  <p className="text-sm font-semibold text-charcoal font-body">
                    {user.phone ? (
                      <span className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-wood" />
                        {user.phone}
                      </span>
                    ) : (
                      <span className="text-charcoal/30 italic">No phone number linked</span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase text-charcoal/40">Himalayan Origin Account Status</span>
                  <span className="badge w-fit bg-forest/5 py-0.5 border-forest/10 font-semibold rounded-sm">
                    Verified Customer
                  </span>
                </div>
              </div>

              <div className="mt-10 bg-ivory-dark/20 border border-wood-light/15 p-6 rounded-sm">
                <h3 className="heading-xs text-forest font-medium mb-2">Palum Dhara Member Services</h3>
                <p className="text-xs text-charcoal/70 leading-relaxed font-body">
                  Welcome to our mountain-inspired customer dashboard. From here, you can manage your dispatch addresses, subscribe to newsletter stories, and control your password preferences securely. Future dispatch histories and subscription packages will link to this verified identity automatically.
                </p>
              </div>
            </motion.div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === "addresses" && (
            <motion.div
              key="addresses-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-ivory-dark/10 border border-wood-light/20 rounded-md p-8 warm-card"
              id="pane-addresses"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="label mb-2">SECURE DISPATCH COORDINATES</span>
                  <h1 className="heading-sm text-forest">Saved Addresses</h1>
                </div>
                {!showAddressForm && (
                  <button
                    onClick={() => {
                      resetAddressForm()
                      setShowAddressForm(true)
                    }}
                    className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2"
                    type="button"
                    id="btn-add-address"
                  >
                    <Plus className="w-4 h-4" />
                    New Address
                  </button>
                )}
              </div>

              {/* Address Form */}
              {showAddressForm ? (
                <form onSubmit={handleAddressSubmit} className="border-t border-wood-light/15 pt-6 flex flex-col gap-5" id="form-address">
                  <h3 className="text-xs tracking-wider uppercase font-semibold text-forest mb-2">
                    {editingAddress ? "Edit Address Details" : "Add New Shipping Coordinates"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="addressLabel" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                        Address Name / Label
                      </label>
                      <input
                        id="addressLabel"
                        type="text"
                        placeholder="Home, Office, Cottage"
                        value={addressLabel}
                        onChange={(e) => setAddressLabel(e.target.value)}
                        className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none transition-colors duration-200 font-body"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="addressPhone" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                        Contact Phone
                      </label>
                      <input
                        id="addressPhone"
                        type="text"
                        placeholder="e.g. +91 98765 43210"
                        value={addressPhone}
                        onChange={(e) => setAddressPhone(e.target.value)}
                        className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none transition-colors duration-200 font-body"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="addressLine1" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                      Address Line 1
                    </label>
                    <input
                      id="addressLine1"
                      type="text"
                      required
                      placeholder="Street address, P.O. box, company name, c/o"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none transition-colors duration-200 font-body"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="addressLine2" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      id="addressLine2"
                      type="text"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none transition-colors duration-200 font-body"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="addressCity" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                        City
                      </label>
                      <input
                        id="addressCity"
                        type="text"
                        required
                        placeholder="Shimla"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none transition-colors duration-200 font-body"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="addressState" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                        State
                      </label>
                      <input
                        id="addressState"
                        type="text"
                        required
                        placeholder="Himachal Pradesh"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none transition-colors duration-200 font-body"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="addressPostalCode" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                        Postal Code (PIN)
                      </label>
                      <input
                        id="addressPostalCode"
                        type="text"
                        required
                        placeholder="171001"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none transition-colors duration-200 font-body"
                      />
                    </div>
                  </div>

                  {/* Defaults Toggles */}
                  <div className="flex flex-col gap-3 mt-2 border-t border-wood-light/10 pt-4">
                    <div className="flex items-center gap-3">
                      <input
                        id="addr-default"
                        type="checkbox"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="w-4 h-4 border border-wood-light/40 accent-forest cursor-pointer"
                      />
                      <label htmlFor="addr-default" className="text-[11px] text-charcoal/70 font-body cursor-pointer select-none">
                        Set as general default address
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        id="addr-shipping"
                        type="checkbox"
                        checked={isDefaultShipping}
                        onChange={(e) => setIsDefaultShipping(e.target.checked)}
                        className="w-4 h-4 border border-wood-light/40 accent-forest cursor-pointer"
                      />
                      <label htmlFor="addr-shipping" className="text-[11px] text-charcoal/70 font-body cursor-pointer select-none">
                        Set as default dispatch (shipping) address
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        id="addr-billing"
                        type="checkbox"
                        checked={isDefaultBilling}
                        onChange={(e) => setIsDefaultBilling(e.target.checked)}
                        className="w-4 h-4 border border-wood-light/40 accent-forest cursor-pointer"
                      />
                      <label htmlFor="addr-billing" className="text-[11px] text-charcoal/70 font-body cursor-pointer select-none">
                        Set as default invoice (billing) address
                      </label>
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex justify-end gap-3 mt-4 border-t border-wood-light/10 pt-4">
                    <button
                      onClick={resetAddressForm}
                      className="px-6 py-2.5 text-xs tracking-wider uppercase font-body border border-wood-light/30 rounded-sm text-charcoal/70 hover:bg-ivory-dark/20 transition-all duration-300"
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="btn-primary py-2.5 px-8 text-xs flex items-center gap-2"
                      id="btn-address-submit"
                    >
                      {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Coordinates
                    </button>
                  </div>
                </form>
              ) : (
                /* Address List */
                <div className="border-t border-wood-light/10 pt-6">
                  {addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center" id="addresses-empty-state">
                      <MapPin className="w-8 h-8 text-stone/40 mb-3 stroke-1" />
                      <h4 className="text-sm font-semibold text-forest mb-1">No Saved Addresses</h4>
                      <p className="text-xs text-charcoal/50 max-w-xs leading-relaxed font-body">
                        You have not saved any dispatch coordinates yet. Add an address to make your checkout experience seamless.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="addresses-list-container">
                      {addresses.map((addr) => (
                        <div 
                          key={addr.id} 
                          className="border border-wood-light/20 bg-ivory-dark/5 p-5 rounded-sm relative flex flex-col justify-between"
                        >
                          <div className="mb-4">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-xs font-semibold text-forest tracking-wide font-body">
                                {addr.label || "Saved Address"}
                              </span>
                              <div className="flex gap-1.5 flex-wrap justify-end">
                                {addr.isDefault && (
                                  <span className="text-[8px] tracking-wider px-1.5 py-0.5 font-mono bg-stone/20 text-stone-900 uppercase font-semibold rounded-sm">
                                    Default
                                  </span>
                                )}
                                {addr.isDefaultShipping && (
                                  <span className="text-[8px] tracking-wider px-1.5 py-0.5 font-mono bg-forest/10 text-forest-light uppercase font-semibold rounded-sm">
                                    Shipping
                                  </span>
                                )}
                                {addr.isDefaultBilling && (
                                  <span className="text-[8px] tracking-wider px-1.5 py-0.5 font-mono bg-terracotta/10 text-terracotta uppercase font-semibold rounded-sm">
                                    Billing
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-charcoal/80 space-y-0.5 font-body leading-relaxed">
                              <p>{addr.addressLine1}</p>
                              {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                              <p>{addr.city}, {addr.state} — {addr.postalCode}</p>
                              <p className="text-charcoal/50 mt-1 font-mono">{addr.country}</p>
                              {addr.phone && (
                                <p className="text-charcoal/60 mt-1 text-[11px] flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-wood" /> {addr.phone}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-3 border-t border-wood-light/10 pt-3 mt-auto justify-end">
                            <button
                              onClick={() => startEditAddress(addr)}
                              className="text-stone hover:text-forest text-[11px] font-body tracking-wider uppercase inline-flex items-center gap-1.5 transition-colors duration-200"
                              type="button"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-stone hover:text-terracotta text-[11px] font-body tracking-wider uppercase inline-flex items-center gap-1.5 transition-colors duration-200"
                              type="button"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* NEWSLETTER TAB */}
          {activeTab === "newsletter" && (
            <motion.div
              key="newsletter-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-ivory-dark/10 border border-wood-light/20 rounded-md p-8 warm-card"
              id="pane-newsletter"
            >
              <span className="label mb-2">STORIES FROM THE RIDGE</span>
              <h1 className="heading-sm mb-6 text-forest">Newsletter & Alerts</h1>

              <form onSubmit={handleNewsletterUpdate} className="border-t border-wood-light/10 pt-6 flex flex-col gap-6" id="form-newsletter">
                <p className="text-xs text-charcoal/70 leading-relaxed font-body">
                  We write rarely, and only when the seasons change, crops are harvested, or a mountain craftsman completes a rare collection. Customize how you join us in these narratives.
                </p>

                <div className="bg-ivory-dark/15 border border-wood-light/15 rounded-sm p-6 flex flex-col gap-5">
                  <div className="flex items-start gap-4">
                    <input
                      id="news-subscriber"
                      type="checkbox"
                      checked={subscribed}
                      onChange={(e) => setSubscribed(e.target.checked)}
                      className="w-4 h-4 mt-1 border border-wood-light/40 accent-forest cursor-pointer"
                    />
                    <div>
                      <label htmlFor="news-subscriber" className="text-xs font-semibold text-forest cursor-pointer block select-none">
                        Palum Dhara Gazette Subscription
                      </label>
                      <p className="text-xs text-charcoal/50 leading-relaxed mt-0.5 font-body">
                        Receive seasonal dispatches, crop availability notices, recipes, and maker stories straight to your inbox.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-wood-light/10 pt-4 flex items-start gap-4">
                    <input
                      id="news-consent"
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={(e) => setMarketingConsent(e.target.checked)}
                      className="w-4 h-4 mt-1 border border-wood-light/40 accent-forest cursor-pointer"
                    />
                    <div>
                      <label htmlFor="news-consent" className="text-xs font-semibold text-forest cursor-pointer block select-none">
                        General Marketing & Promotions Consent
                      </label>
                      <p className="text-xs text-charcoal/50 leading-relaxed mt-0.5 font-body">
                        Allow us to notify you about member-only pricing, subscriber reservation periods, and specialty harvest slots.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-wood-light/10">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="btn-primary py-2.5 px-8 text-xs flex items-center gap-2"
                    id="btn-newsletter-submit"
                  >
                    {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Preferences
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <motion.div
              key="security-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-ivory-dark/10 border border-wood-light/20 rounded-md p-8 warm-card"
              id="pane-security"
            >
              <span className="label mb-2">ACCESS PROTECTIONS</span>
              <h1 className="heading-sm mb-6 text-forest">Security</h1>

              <div className="border-t border-wood-light/10 pt-6 flex flex-col gap-6">
                <div className="bg-ivory-dark/15 border border-wood-light/15 p-6 rounded-sm">
                  <h3 className="text-xs tracking-wider uppercase font-semibold text-forest mb-2">Verified Login Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="text-xs font-body">
                      <span className="text-charcoal/40 block font-mono text-[10px] uppercase">Identity Provider</span>
                      <span className="text-charcoal font-semibold mt-0.5 block">Email & Password Security</span>
                    </div>
                    <div className="text-xs font-body">
                      <span className="text-charcoal/40 block font-mono text-[10px] uppercase">Account Type</span>
                      <span className="text-charcoal font-semibold mt-0.5 block">Standard Customer Access</span>
                    </div>
                  </div>
                </div>

                <div className="bg-ivory-dark/15 border border-wood-light/15 p-6 rounded-sm">
                  <h3 className="text-xs tracking-wider uppercase font-semibold text-forest mb-3">Change Login Password</h3>
                  <p className="text-xs text-charcoal/60 leading-relaxed font-body mb-5">
                    Update your account access credentials. Your password must be at least 8 characters.
                  </p>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      if (newPassword.length < 8) {
                        setMessage({ type: "error", text: "New password must be at least 8 characters." })
                        return
                      }
                      setMessage(null)
                      setIsPending(true)
                      try {
                        const { error } = await authClient.changePassword({
                          newPassword: newPassword,
                          currentPassword: currentPassword,
                          revokeOtherSessions: true,
                        })
                        setIsPending(false)
                        if (error) {
                          setMessage({ type: "error", text: error.message || "Failed to update password. Please verify your current password." })
                        } else {
                          setMessage({ type: "success", text: "Your login password has been updated successfully." })
                          setCurrentPassword("")
                          setNewPassword("")
                        }
                      } catch {
                        setIsPending(false)
                        setMessage({ type: "error", text: "Unable to process password change at this time." })
                      }
                    }}
                    className="flex flex-col gap-4 max-w-sm"
                  >
                    <div className="flex flex-col gap-1">
                      <label htmlFor="sec-current-password" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                        Current Password
                      </label>
                      <input
                        id="sec-current-password"
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none transition-colors duration-200 font-body"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="sec-new-password" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                        New Password
                      </label>
                      <input
                        id="sec-new-password"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none transition-colors duration-200 font-body"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="btn-primary py-2.5 px-6 text-xs w-fit mt-2"
                      id="btn-update-password"
                    >
                      {isPending ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <motion.div
              key="settings-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-ivory-dark/10 border border-wood-light/20 rounded-md p-8 warm-card"
              id="pane-settings"
            >
              <span className="label mb-2">INFORMATION MAINTENANCE</span>
              <h1 className="heading-sm mb-6 text-forest">Account Settings</h1>

              <form onSubmit={handleUpdateProfile} className="border-t border-wood-light/10 pt-6 flex flex-col gap-5" id="form-settings">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="settings-fullName" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                    Full Legal Name
                  </label>
                  <input
                    id="settings-fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none transition-colors duration-200 font-body"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="settings-phone" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                    Mobile Number
                  </label>
                  <input
                    id="settings-phone"
                    type="text"
                    placeholder="+91 XXXXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-transparent/5 rounded-sm text-xs text-charcoal outline-none transition-colors duration-200 font-body"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-wood-light/10">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="btn-primary py-2.5 px-8 text-xs flex items-center gap-2"
                    id="btn-settings-submit"
                  >
                    {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* PANTRY TAB */}
          {activeTab === "pantry" && (
            <PantryTab 
              addresses={addresses} 
              onShowMessage={(msg) => setMessage(msg)} 
            />
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <motion.div
              key="orders-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-ivory-dark/10 border border-wood-light/20 rounded-md p-8 warm-card"
              id="pane-orders"
            >
              {selectedOrderId === null ? (
                /* ORDERS LIST */
                <div>
                  <span className="label mb-2">PURCHASE JOURNAL</span>
                  <h1 className="heading-sm mb-6 text-forest">Order History</h1>

                  <div className="border-t border-wood-light/10 pt-6">
                    {orders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center" id="orders-empty-state">
                        <ShoppingBag className="w-8 h-8 text-stone/40 mb-3 stroke-1" />
                        <h4 className="text-sm font-semibold text-forest mb-1">No Orders Logged</h4>
                        <p className="text-xs text-charcoal/50 max-w-xs leading-relaxed font-body mb-6">
                          You haven't placed any orders yet. Visit the shop to browse our select mountain harvests.
                        </p>
                        <Link href="/shop" className="btn-primary px-6 py-2.5 text-[10px] tracking-wider uppercase font-semibold">
                          Browse Shop
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4" id="orders-list-container">
                        {orders.map((order) => {
                          const statusColors: Record<string, string> = {
                            processing: "bg-amber-500/10 text-amber-600 border-amber-500/20",
                            packed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                            shipped: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
                            delivered: "bg-forest/10 text-forest-light border-forest/20",
                            cancelled: "bg-terracotta/10 text-terracotta border-terracotta/20",
                          };
                          
                          return (
                            <div 
                              key={order.id} 
                              className="border border-wood-light/20 bg-ivory-dark/5 p-5 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:border-wood/40 hover:bg-ivory-dark/10"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono font-semibold text-forest">{order.orderNumber}</span>
                                  <span className={`text-[9px] tracking-wider font-semibold uppercase px-2 py-0.5 border rounded-sm ${statusColors[order.status] || "bg-stone/10 text-stone-700"}`}>
                                    {order.status}
                                  </span>
                                </div>
                                <div className="text-[11px] text-charcoal/60 font-body flex flex-wrap items-center gap-y-1 gap-x-4">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                  </span>
                                  <span>{order.items.length} {order.items.length === 1 ? "Item" : "Items"}</span>
                                  <span className="font-semibold text-charcoal">₹{order.grandTotal}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => setSelectedOrderId(order.id)}
                                className="px-5 py-2 border border-wood-light/40 hover:border-forest text-[11px] font-body font-semibold tracking-wider uppercase rounded-sm text-charcoal hover:bg-forest hover:text-ivory transition-all duration-200 self-start md:self-auto flex items-center gap-1.5"
                              >
                                View Receipt
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ORDER DETAIL / INVOICE VIEW */
                (() => {
                  const order = orders.find(o => o.id === selectedOrderId);
                  if (!order) {
                    setSelectedOrderId(null);
                    return null;
                  }

                  const statusSteps = ["processing", "packed", "shipped", "delivered"];
                  if (order.status === "cancelled") {
                    statusSteps.push("cancelled");
                  }
                  
                  const activeStepIndex = statusSteps.indexOf(order.status);
                  
                  const shipping = order.shippingAddress as any;

                  // Handle Instant Reorder
                  const handleInstantReorder = () => {
                    const addItem = useCartStore.getState().addItem;
                    order.items.forEach((item) => {
                      addItem({
                        id: item.productId || item.id,
                        slug: item.productId || item.id, // fallback to id as standard mapping
                        name: item.productName,
                        price: item.price,
                        image: item.image,
                        weight: item.weight,
                        quantity: item.quantity,
                      });
                    });
                    setMessage({ type: "success", text: "All items from this order have been successfully added to your cart." });
                    router.push("/cart");
                  };

                  return (
                    <div className="space-y-8 animate-fade-in" id="order-detail-view">
                      {/* Back Button */}
                      <button
                        onClick={() => setSelectedOrderId(null)}
                        className="text-stone hover:text-forest text-xs tracking-wider uppercase font-semibold inline-flex items-center gap-1.5 transition-colors duration-200"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Orders
                      </button>

                      {/* Header summary */}
                      <div className="border-b border-wood-light/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-charcoal/40">Official Ledger Entry</span>
                          <h2 className="text-base font-semibold text-forest font-mono mt-0.5 flex items-center gap-2">
                            {order.orderNumber}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(order.orderNumber);
                                alert("Order ID copied to clipboard!");
                              }}
                              className="text-stone hover:text-forest p-1 rounded hover:bg-ivory-dark/10"
                              title="Copy Order ID"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </h2>
                        </div>
                        <div className="text-right sm:text-left self-start sm:self-auto">
                          <span className="text-[10px] font-mono uppercase text-charcoal/40 block">Placed On</span>
                          <span className="text-xs font-semibold text-charcoal font-body">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>

                      {/* VISUAL TIMELINE STEPPER */}
                      <div className="bg-ivory-dark/5 border border-wood-light/10 rounded-sm p-6">
                        <h3 className="text-[10px] font-mono uppercase tracking-wider text-charcoal/50 mb-6">
                          Dispatch Timeline
                        </h3>
                        
                        <div className="relative pl-6 border-l border-wood-light/15 space-y-6">
                          {statusSteps.map((step, idx) => {
                            const isCompleted = idx <= activeStepIndex;
                            const isCurrent = idx === activeStepIndex;
                            const historyItem = order.history.find(h => h.status === step);

                            return (
                              <div key={step} className="relative">
                                {/* Dot Indicator */}
                                <div className={`absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all duration-300 ${
                                  isCompleted 
                                    ? "bg-forest border-forest text-ivory" 
                                    : "bg-white border-wood-light/30 text-charcoal/20"
                                }`}>
                                  {isCompleted ? <Check className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                                </div>

                                <div className="min-w-0">
                                  <h4 className={`text-xs font-semibold uppercase tracking-wider ${isCompleted ? "text-forest" : "text-charcoal/40"}`}>
                                    {step}
                                  </h4>
                                  
                                  {isCompleted && historyItem ? (
                                    <div className="mt-1">
                                      <p className="text-[11px] text-charcoal/70 leading-relaxed font-body">
                                        {historyItem.notes || `Order status updated to ${step}.`}
                                      </p>
                                      <span className="text-[9px] font-mono text-charcoal/40 mt-1 block">
                                        {new Date(historyItem.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                      </span>
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-charcoal/30 font-body mt-0.5">
                                      Awaiting verification step.
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* DETAILS GRID */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Address & Notes (Left 7 cols) */}
                        <div className="md:col-span-7 space-y-6">
                          {/* Deliver coordinates */}
                          <div className="bg-ivory-dark/5 border border-wood-light/10 p-5 rounded-sm">
                            <h4 className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40 mb-3 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-wood" />
                              Dispatch Address
                            </h4>
                            <div className="text-xs text-charcoal/80 space-y-1 font-body">
                              <p className="font-semibold text-forest">{order.customerName}</p>
                              <p>{shipping.addressLine1}</p>
                              {shipping.addressLine2 && <p>{shipping.addressLine2}</p>}
                              <p>{shipping.city}, {shipping.state} — {shipping.postalCode}</p>
                              <p className="text-[11px] text-charcoal/50 font-mono mt-1">India</p>
                            </div>
                          </div>

                          {/* Items Purchased List */}
                          <div className="border border-wood-light/10 rounded-sm overflow-hidden">
                            <div className="bg-ivory-dark/5 border-b border-wood-light/10 p-4">
                              <h4 className="text-[10px] font-mono uppercase tracking-wider text-forest font-semibold">
                                Items Purchased
                              </h4>
                            </div>
                            <ul className="divide-y divide-forest/5 bg-white">
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

                          {/* Order Notes */}
                          {order.notes && (
                            <div className="bg-amber-500/[0.02] border border-amber-500/15 p-4 rounded-sm">
                              <h4 className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-semibold mb-1">
                                Dispatch instructions (Custom note)
                              </h4>
                              <p className="text-xs text-charcoal/70 leading-relaxed font-body italic">
                                "{order.notes}"
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Invoice & Calculations (Right 5 cols) */}
                        <div className="md:col-span-5 space-y-6">
                          <div className="p-5 border border-wood-light/15 bg-white rounded-sm space-y-3 shadow-sm relative overflow-hidden" id="dashboard-invoice-receipt">
                            <h4 className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40 mb-3 border-b border-forest/5 pb-2">
                              Settlement Receipt
                            </h4>

                            <div className="flex justify-between items-center text-xs">
                              <span className="text-charcoal/60">Subtotal</span>
                              <span className="font-mono text-charcoal">₹{order.subtotal}</span>
                            </div>

                            {order.discount > 0 && (
                              <div className="flex justify-between items-center text-xs text-forest font-semibold">
                                <span className="flex items-center gap-1">
                                  <Tag className="w-3.5 h-3.5" />
                                  Promo Code ({order.couponCode})
                                </span>
                                <span className="font-mono">-₹{order.discount}</span>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-xs">
                              <span className="flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 opacity-50" />
                                Delivery Fee
                              </span>
                              <span className="font-mono text-charcoal">
                                {order.shippingFee === 0 ? "Free" : `₹${order.shippingFee}`}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-charcoal/40 border-b border-forest/5 pb-2.5">
                              <span>Estimated GST (5%)</span>
                              <span className="font-mono">₹{order.tax}</span>
                            </div>

                            <div className="flex justify-between items-center pt-1">
                              <span className="text-xs font-semibold text-forest uppercase">Estimated Total</span>
                              <span className="font-heading text-lg text-forest font-semibold">₹{order.grandTotal}</span>
                            </div>

                            {/* Settlement status Stamp */}
                            <div className="border border-forest/15 bg-forest/[0.02] p-2 rounded-sm mt-4 text-[10px] text-forest flex items-center justify-between font-body">
                              <span className="flex items-center gap-1 font-semibold uppercase">
                                <Check className="w-3.5 h-3.5" />
                                Method
                              </span>
                              <span className="font-semibold uppercase tracking-wider font-mono">
                                Cash on Delivery ({order.status === "delivered" ? "SETTLED" : "UNPAID"})
                              </span>
                            </div>

                            {/* Print receipt CTA */}
                            <button
                              onClick={() => window.print()}
                              className="w-full text-center py-2 mt-4 text-[10px] font-semibold text-stone hover:text-forest border border-dashed border-wood-light/30 hover:border-forest/50 font-body uppercase tracking-wider transition-all duration-200"
                            >
                              Print Invoice Receipt
                            </button>
                          </div>

                          {/* REORDER / REPURCHASE BUTTON */}
                          <button
                            onClick={handleInstantReorder}
                            className="btn-primary w-full py-3.5 text-[11px] uppercase tracking-widest font-heading font-medium flex items-center justify-center gap-2 shadow"
                            id="btn-reorder-receipt"
                          >
                            <Plus className="w-4 h-4" />
                            Reorder All Items
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
