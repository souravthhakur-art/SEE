"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  adminUpdatePantryStatus, 
  adminTriggerPantryDispatch 
} from "@/app/admin/(dashboard)/subscriptions/admin-actions"
import { subscriptionBoxes } from "@/lib/data"
import { 
  Users, 
  Calendar, 
  Clock, 
  Search, 
  Check, 
  Play, 
  Pause, 
  X, 
  Package, 
  FileText, 
  AlertCircle, 
  ExternalLink,
  PlusCircle,
  Truck,
  RotateCw
} from "lucide-react"

interface AdminPantryContentProps {
  pantries: any[]
}

export default function AdminPantryContent({ pantries: initialPantries }: AdminPantryContentProps) {
  const [pantries, setPantries] = useState(initialPantries)
  const [activeTab, setActiveTab] = useState<"members" | "dispatches" | "history">("members")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tierFilter, setTierFilter] = useState("all")
  
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)
  const [expandedPantryId, setExpandedPantryId] = useState<string | null>(null)

  // Status badge style helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="bg-forest/10 text-forest text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase font-semibold">Active</span>
      case "paused":
        return <span className="bg-wood/10 text-wood text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase font-semibold">Paused</span>
      case "cancelled":
        return <span className="bg-terracotta/10 text-terracotta text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase font-semibold">Cancelled</span>
      default:
        return <span className="bg-charcoal/10 text-charcoal text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase font-semibold">{status}</span>
    }
  }

  // Filtered members list
  const filteredPantries = pantries.filter(p => {
    const matchesSearch = 
      p.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    const matchesTier = tierFilter === "all" || p.tier === tierFilter

    return matchesSearch && matchesStatus && matchesTier
  })

  // Grouped statistics
  const totalCount = pantries.length
  const activeCount = pantries.filter(p => p.status === "active").length
  const pausedCount = pantries.filter(p => p.status === "paused").length
  
  // Calculate projected monthly revenue
  const monthlyRevenue = pantries
    .filter(p => p.status === "active")
    .reduce((acc, p) => {
      const plan = subscriptionBoxes.find(b => b.id === p.tier)
      return acc + (plan ? plan.price : 899)
    }, 0)

  // Admin status update handler
  const handleUpdateStatus = (pantryId: string, status: "active" | "paused" | "cancelled") => {
    if (!confirm(`Are you sure you want to change this pantry status to ${status}?`)) return
    setActionError(null)

    startTransition(async () => {
      const res = await adminUpdatePantryStatus(pantryId, status)
      if (res.success) {
        setPantries(prev => prev.map(p => p.id === pantryId ? { ...p, status } : p))
      } else {
        setActionError(res.error || "An error occurred.")
      }
    })
  }

  // Manual dispatch trigger handler
  const handleTriggerDispatch = (pantryId: string, scheduleId: string) => {
    if (!confirm("Generate monthly commerce dispatch order for this customer now? This creates a real Processing Order.")) return
    setActionError(null)

    startTransition(async () => {
      const res = await adminTriggerPantryDispatch(pantryId, scheduleId)
      if (res.success) {
        alert("Pantry dispatch triggered successfully! Dispatch order generated.")
        // Refresh entire page state to get newly populated delivery records
        window.location.reload()
      } else {
        setActionError(res.error || "An error occurred.")
      }
    })
  }

  // Collect all upcoming schedules
  const upcomingSchedules = pantries.flatMap(p => 
    (p.schedules || []).map((s: any) => ({
      ...s,
      pantry: p,
      user: p.user
    }))
  ).filter((s: any) => s.status === "pending" && s.pantry.status === "active")
   .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())

  // Collect all historical deliveries
  const historicalDeliveries = pantries.flatMap(p => 
    (p.deliveries || []).map((d: any) => ({
      ...d,
      pantry: p,
      user: p.user
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="space-y-8" id="admin-pantry-dashboard">
      
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-wood-light/10 pb-6">
        <div>
          <h1 className="heading-lg text-charcoal">Pantry Memberships</h1>
          <p className="text-xs text-wood font-mono tracking-widest uppercase mt-1">Sprint 2.6 Pantry Subsystem Administrator Desk</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white border border-forest/10 p-5 rounded-md shadow-sm warm-card flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-charcoal/50 uppercase tracking-widest">Total Enrolled</span>
            <p className="text-3xl font-semibold font-mono text-forest mt-1">{totalCount}</p>
          </div>
          <p className="text-[10px] text-charcoal/40 mt-3 font-body">All-time customer pantry lifecycles</p>
        </div>

        <div className="bg-white border border-forest/10 p-5 rounded-md shadow-sm warm-card flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-charcoal/50 uppercase tracking-widest">Active Table</span>
            <p className="text-3xl font-semibold font-mono text-forest mt-1">{activeCount}</p>
          </div>
          <p className="text-[10px] text-forest mt-3 font-body font-semibold">● {activeCount} receiving monthly dispatches</p>
        </div>

        <div className="bg-white border border-forest/10 p-5 rounded-md shadow-sm warm-card flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-charcoal/50 uppercase tracking-widest">Awaiting Dispatch</span>
            <p className="text-3xl font-semibold font-mono text-wood mt-1">{upcomingSchedules.length}</p>
          </div>
          <p className="text-[10px] text-charcoal/40 mt-3 font-body">Logistics schedules pending generation</p>
        </div>

        <div className="bg-white border border-forest/10 p-5 rounded-md shadow-sm warm-card flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-charcoal/50 uppercase tracking-widest">Monthly Value</span>
            <p className="text-3xl font-semibold font-mono text-forest mt-1">₹{monthlyRevenue.toLocaleString()}</p>
          </div>
          <p className="text-[10px] text-charcoal/40 mt-3 font-body">Projected recurring settlement per cycle</p>
        </div>

      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-wood-light/20 gap-8">
        <button
          onClick={() => { setActiveTab("members"); setActionError(null); }}
          className={`pb-4 text-xs font-mono uppercase tracking-widest transition-colors relative ${
            activeTab === "members" ? "text-forest font-bold" : "text-charcoal/40 hover:text-charcoal"
          }`}
        >
          01. Enrolled Members ({filteredPantries.length})
          {activeTab === "members" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest" />}
        </button>

        <button
          onClick={() => { setActiveTab("dispatches"); setActionError(null); }}
          className={`pb-4 text-xs font-mono uppercase tracking-widest transition-colors relative ${
            activeTab === "dispatches" ? "text-forest font-bold" : "text-charcoal/40 hover:text-charcoal"
          }`}
        >
          02. Upcoming Schedules ({upcomingSchedules.length})
          {activeTab === "dispatches" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest" />}
        </button>

        <button
          onClick={() => { setActiveTab("history"); setActionError(null); }}
          className={`pb-4 text-xs font-mono uppercase tracking-widest transition-colors relative ${
            activeTab === "history" ? "text-forest font-bold" : "text-charcoal/40 hover:text-charcoal"
          }`}
        >
          03. Dispatch History ({historicalDeliveries.length})
          {activeTab === "history" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest" />}
        </button>
      </div>

      {/* Error alert banner */}
      {actionError && (
        <div className="bg-terracotta/5 border border-terracotta/20 text-terracotta p-4 rounded-sm text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* TAB 1: Enrolled Members */}
      {activeTab === "members" && (
        <div className="space-y-6 animate-fade-in" id="members-list-tab">
          
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 border border-forest/5 rounded-md shadow-sm warm-card">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-charcoal/30" />
              <input 
                type="text" 
                placeholder="Search community name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 border border-wood-light/30 focus:border-forest bg-transparent/5 rounded-sm text-xs outline-none font-body transition-colors"
              />
            </div>

            {/* Status Select Filter */}
            <div className="w-full md:w-44 flex flex-col gap-1">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 border border-wood-light/30 focus:border-forest bg-white rounded-sm text-xs outline-none font-mono"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Tier Select Filter */}
            <div className="w-full md:w-44 flex flex-col gap-1">
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="h-10 px-3 border border-wood-light/30 focus:border-forest bg-white rounded-sm text-xs outline-none font-mono"
              >
                <option value="all">All Pantry Tiers</option>
                <option value="essential">Essential Pantry</option>
                <option value="family">Family Pantry</option>
                <option value="seasonal">Seasonal Pantry</option>
                <option value="signature">Signature Pantry</option>
              </select>
            </div>

          </div>

          {/* Members Table */}
          <div className="bg-white border border-forest/10 rounded-md overflow-hidden shadow-sm warm-card">
            {filteredPantries.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-10 h-10 text-charcoal/20 mx-auto mb-3" strokeWidth={1.25} />
                <p className="text-xs text-charcoal/50 italic font-body">No matching pantry memberships found on record.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-forest/5 border-b border-forest/10 text-[10px] font-mono uppercase tracking-widest text-forest">
                      <th className="py-3 px-4">Member / Contact</th>
                      <th className="py-3 px-4">Tier / Plan</th>
                      <th className="py-3 px-4">Cadence</th>
                      <th className="py-3 px-4">Dispatch Window</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wood-light/10 text-xs font-body text-charcoal">
                    {filteredPantries.map(p => {
                      const plan = subscriptionBoxes.find(b => b.id === p.tier)
                      const isExpanded = expandedPantryId === p.id
                      
                      return (
                        <tr key={p.id} className="hover:bg-ivory-dark/5 transition-colors group">
                          <td className="py-4 px-4">
                            <div className="font-semibold">{p.user?.fullName || "Community Member"}</div>
                            <div className="text-[10px] text-charcoal/40 font-mono mt-0.5">{p.user?.email}</div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-forest">
                            {plan?.name || p.name}
                          </td>
                          <td className="py-4 px-4 font-mono capitalize">
                            {p.frequency?.replace("_", " ")}
                          </td>
                          <td className="py-4 px-4 font-mono">
                            {p.deliveryWindow === "early_month" ? "First Week (1st-5th)" : "Third Week (15th-20th)"}
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(p.status)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              
                              {/* Toggle expansion */}
                              <button
                                onClick={() => setExpandedPantryId(isExpanded ? null : p.id)}
                                className="text-[10px] font-mono tracking-wider uppercase border border-wood-light/30 hover:border-forest hover:text-forest px-2.5 py-1.5 rounded-sm transition-all"
                              >
                                {isExpanded ? "Hide Staples" : "View Curated Staples"}
                              </button>

                              {/* Action controls based on state */}
                              {p.status === "active" ? (
                                <button
                                  disabled={isPending}
                                  onClick={() => handleUpdateStatus(p.id, "paused")}
                                  className="text-[10px] font-mono tracking-wider uppercase bg-wood hover:bg-wood-dark text-white px-2.5 py-1.5 rounded-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                                >
                                  <Pause className="w-3 h-3" />
                                  Pause
                                </button>
                              ) : p.status === "paused" ? (
                                <button
                                  disabled={isPending}
                                  onClick={() => handleUpdateStatus(p.id, "active")}
                                  className="text-[10px] font-mono tracking-wider uppercase bg-forest hover:bg-forest-dark text-white px-2.5 py-1.5 rounded-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                                >
                                  <Play className="w-3 h-3" />
                                  Resume
                                </button>
                              ) : null}

                              {p.status !== "cancelled" && (
                                <button
                                  disabled={isPending}
                                  onClick={() => handleUpdateStatus(p.id, "cancelled")}
                                  className="text-[10px] font-mono tracking-wider uppercase bg-terracotta hover:bg-terracotta/90 text-white px-2.5 py-1.5 rounded-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                                >
                                  <X className="w-3 h-3" />
                                  Cancel
                                </button>
                              )}

                            </div>

                            {/* Collapsible Staples Display inside table cell */}
                            {isExpanded && (
                              <div className="text-left mt-4 p-4 bg-ivory border border-wood-light/20 rounded-sm text-xs font-body text-charcoal/80 space-y-3 animate-fade-in block w-[500px] max-w-full ml-auto">
                                <h4 className="text-[10px] font-mono uppercase text-forest font-bold tracking-wider">Curated staples basket items</h4>
                                
                                <div className="space-y-2 divide-y divide-wood-light/10">
                                  {(!p.items || p.items.length === 0) ? (
                                    <p className="text-[11px] text-charcoal/50 italic pt-2">No custom goods populated yet. Using tier defaults.</p>
                                  ) : (
                                    p.items.map((item: any) => (
                                      <div key={item.id} className="flex justify-between pt-2 first:pt-0">
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 relative bg-ivory-dark/40 overflow-hidden rounded-sm shrink-0">
                                            <Image 
                                              src={item.product?.media?.[0]?.media?.url || "/images/placeholder.jpg"} 
                                              alt={item.product?.name || "Product"} 
                                              fill 
                                              className="object-cover"
                                              sizes="32px"
                                            />
                                          </div>
                                          <span className="font-semibold">{item.product?.name || "Staple Item"}</span>
                                        </div>
                                        <span className="font-mono text-charcoal/50 shrink-0 align-middle self-center font-bold">Qty: {item.quantity}</span>
                                      </div>
                                    ))
                                  )}
                                </div>

                                <div className="pt-2 border-t border-wood-light/10 text-[10px] text-charcoal/50 font-mono space-y-1">
                                  <p>Pantry Enrolled ID: {p.id}</p>
                                  <p>Deliveries Completed: {p.deliveries?.length || 0}</p>
                                  {p.shippingAddress && (
                                    <p>Address: {p.shippingAddress.addressLine1}, {p.shippingAddress.city}, {p.shippingAddress.postalCode}</p>
                                  )}
                                </div>
                              </div>
                            )}

                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: Upcoming Schedules */}
      {activeTab === "dispatches" && (
        <div className="space-y-6 animate-fade-in" id="dispatches-tab">
          
          <div>
            <h2 className="heading-xs text-forest font-heading mb-1">Upcoming Pantry Dispatches</h2>
            <p className="text-xs text-charcoal/60 leading-relaxed font-body">
              These are system schedules queued for generation. Click &quot;Trigger Dispatch&quot; to generate an official commerce order for the pack house.
            </p>
          </div>

          <div className="bg-white border border-forest/10 rounded-md overflow-hidden shadow-sm warm-card">
            {upcomingSchedules.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-10 h-10 text-charcoal/20 mx-auto mb-3" strokeWidth={1.25} />
                <p className="text-xs text-charcoal/50 italic font-body">No pending pantry dispatches found for active members.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-forest/5 border-b border-forest/10 text-[10px] font-mono uppercase tracking-widest text-forest">
                      <th className="py-3 px-4">Target Month/Date</th>
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">Selected Tier</th>
                      <th className="py-3 px-4">Logistics rhythm</th>
                      <th className="py-3 px-4">Schedule Status</th>
                      <th className="py-3 px-4 text-right">Dispatch Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wood-light/10 text-xs font-body text-charcoal">
                    {upcomingSchedules.map((sched: any) => {
                      const plan = subscriptionBoxes.find(b => b.id === sched.pantry.tier)
                      return (
                        <tr key={sched.id} className="hover:bg-ivory-dark/5 transition-colors">
                          <td className="py-4 px-4 font-semibold font-mono text-forest">
                            {new Date(sched.scheduledDate).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold">{sched.user?.fullName || "Community Member"}</div>
                            <div className="text-[10px] text-charcoal/40 font-mono mt-0.5">{sched.user?.email}</div>
                          </td>
                          <td className="py-4 px-4 font-semibold">
                            {plan?.name || sched.pantry.name}
                          </td>
                          <td className="py-4 px-4 font-mono capitalize">
                            {sched.pantry.frequency?.replace("_", " ")} — {sched.pantry.deliveryWindow === "early_month" ? "1st Week" : "3rd Week"}
                          </td>
                          <td className="py-4 px-4">
                            <span className="bg-wood/10 text-wood text-[9px] font-mono px-2 py-0.5 rounded-sm uppercase font-semibold">Awaiting Trigger</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              disabled={isPending}
                              onClick={() => handleTriggerDispatch(sched.pantryId, sched.id)}
                              className="text-[10px] font-mono tracking-wider uppercase bg-forest hover:bg-forest-dark text-white px-3 py-2 rounded-sm transition-all inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Trigger Dispatch
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: Historical Deliveries */}
      {activeTab === "history" && (
        <div className="space-y-6 animate-fade-in" id="history-tab">
          
          <div>
            <h2 className="heading-xs text-forest font-heading mb-1">Pantry Dispatch History</h2>
            <p className="text-xs text-charcoal/60 leading-relaxed font-body">
              A comprehensive history log of all generated monthly pantry delivery packages. Each delivery is linked directly to a commerce order.
            </p>
          </div>

          <div className="bg-white border border-forest/10 rounded-md overflow-hidden shadow-sm warm-card">
            {historicalDeliveries.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-10 h-10 text-charcoal/20 mx-auto mb-3" strokeWidth={1.25} />
                <p className="text-xs text-charcoal/50 italic font-body">No historical pantry dispatch records found on file.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-forest/5 border-b border-forest/10 text-[10px] font-mono uppercase tracking-widest text-forest">
                      <th className="py-3 px-4">Dispatched Date</th>
                      <th className="py-3 px-4">Linked Order Number</th>
                      <th className="py-3 px-4">Pantry Member</th>
                      <th className="py-3 px-4">Pantry Tier</th>
                      <th className="py-3 px-4">Dispatch Window</th>
                      <th className="py-3 px-4">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wood-light/10 text-xs font-body text-charcoal">
                    {historicalDeliveries.map((del: any) => {
                      const plan = subscriptionBoxes.find(b => b.id === del.pantry.tier)
                      return (
                        <tr key={del.id} className="hover:bg-ivory-dark/5 transition-colors">
                          <td className="py-4 px-4 font-mono">
                            {new Date(del.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td className="py-4 px-4 font-mono text-forest font-semibold">
                            {del.order ? (
                              <Link 
                                href={`/admin/orders`}
                                className="hover:underline flex items-center gap-1 group"
                              >
                                {del.order.orderNumber}
                                <ExternalLink className="w-3 h-3 text-charcoal/30 group-hover:text-forest transition-colors" />
                              </Link>
                            ) : "—"}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold">{del.user?.fullName || "Community Member"}</div>
                            <div className="text-[10px] text-charcoal/40 font-mono mt-0.5">{del.user?.email}</div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-forest">
                            {plan?.name || del.pantry.name}
                          </td>
                          <td className="py-4 px-4 font-mono">
                            {del.dispatchWindow === "early_month" ? "First Week" : "Third Week"}
                          </td>
                          <td className="py-4 px-4">
                            <span className="bg-forest/10 text-forest text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase font-semibold">
                              {del.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  )
}
