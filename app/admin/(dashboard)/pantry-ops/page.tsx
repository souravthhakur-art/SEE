"use client"

import { useState, useEffect } from "react"
import { getPantryOpsDataAction } from "../operations-actions"
import { 
  Calendar, 
  Repeat, 
  Users, 
  Boxes, 
  RefreshCw, 
  Loader2, 
  CheckCircle,
  PackageCheck
} from "lucide-react"

export default function AdminPantryOpsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"early" | "late">("early")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setErrorMsg(null)
    const res = await getPantryOpsDataAction()
    if (res.success && res.data) {
      setData(res.data)
    } else {
      setErrorMsg(res.error || "Failed to load pantry operations data")
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-6" id="admin-pantry-ops-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-wood-light/10">
        <div>
          <h1 className="heading-sm text-charcoal font-semibold flex items-center gap-2">
            <Repeat className="text-forest" size={24} />
            Pantry Subscription Operations
          </h1>
          <p className="text-xs text-charcoal/50 font-body mt-0.5">
            Organize upcoming monthly pantry boxes, aggregate product requirements, and track custom subscriber schedules.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => loadData()}
            className="flex items-center gap-1.5 rounded-sm border border-charcoal/10 px-3 py-1.5 text-xs text-charcoal font-body bg-white hover:bg-ivory/20 transition-all"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync Operations
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 text-rose-800 border border-rose-200 rounded-sm p-3 text-xs font-body">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Subscription KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-charcoal/10 p-4 rounded-sm space-y-1 shadow-sm">
          <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider">Active Pantry Subscriptions</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold font-heading text-charcoal">{data?.membershipCount || 0}</p>
            <span className="text-xs text-forest font-semibold">Live Subscriptions</span>
          </div>
          <p className="text-[10px] text-charcoal/40 font-body">Generating recurring orders monthly</p>
        </div>
        <div className="bg-white border border-charcoal/10 p-4 rounded-sm space-y-1 shadow-sm">
          <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider">Window 1: 5th of Month</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold font-heading text-charcoal">{data?.earlyCount || 0}</p>
            <span className="text-xs text-amber-600 font-semibold">Early Month</span>
          </div>
          <p className="text-[10px] text-charcoal/40 font-body">Scheduled for early dispatch cycle</p>
        </div>
        <div className="bg-white border border-charcoal/10 p-4 rounded-sm space-y-1 shadow-sm">
          <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider">Window 2: 20th of Month</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold font-heading text-charcoal">{data?.lateCount || 0}</p>
            <span className="text-xs text-amber-600 font-semibold">Late Month</span>
          </div>
          <p className="text-[10px] text-charcoal/40 font-body">Scheduled for late dispatch cycle</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-charcoal/10 rounded-sm">
          <Loader2 className="animate-spin text-forest mb-2" size={32} />
          <p className="text-xs text-charcoal/50 font-body">Fetching subscription schedules...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLUMNS: Dispatch Scheduling & Aggregations */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cycle Selector & Aggregated Inventory Needs */}
            <div className="bg-white border border-charcoal/10 rounded-sm p-5 space-y-5 shadow-sm">
              <div className="flex justify-between items-center pb-2 border-b border-charcoal/10">
                <div>
                  <h3 className="text-sm font-semibold text-charcoal font-heading">Dispatch Cycle Inventory Planning</h3>
                  <p className="text-xs text-charcoal/50 font-body mt-0.5">
                    Consolidated product totals needed to fulfill all boxes in this cycle. Use this to prepare stocks in advance.
                  </p>
                </div>
              </div>

              <div className="flex border-b border-charcoal/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("early")}
                  className={`flex-1 py-2 text-xs font-heading font-semibold uppercase tracking-wider border-b-2 text-center transition-all ${
                    activeTab === "early" ? "border-forest text-forest" : "border-transparent text-charcoal/50 hover:text-charcoal"
                  }`}
                >
                  📅 5th of Month Dispatch ({data?.earlyCount || 0} boxes)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("late")}
                  className={`flex-1 py-2 text-xs font-heading font-semibold uppercase tracking-wider border-b-2 text-center transition-all ${
                    activeTab === "late" ? "border-forest text-forest" : "border-transparent text-charcoal/50 hover:text-charcoal"
                  }`}
                >
                  📅 20th of Month Dispatch ({data?.lateCount || 0} boxes)
                </button>
              </div>

              {/* Aggregated Requirements Table */}
              {activeTab === "early" ? (
                <div className="space-y-4">
                  {(!data?.earlyDispatchProducts || data.earlyDispatchProducts.length === 0) ? (
                    <p className="text-xs text-charcoal/40 font-body py-4 text-center">No products aggregated for 5th Dispatch.</p>
                  ) : (
                    <div className="overflow-x-auto border border-charcoal/10 rounded-sm">
                      <table className="w-full text-left border-collapse text-xs font-body">
                        <thead>
                          <tr className="bg-ivory/10 border-b border-charcoal/10 text-[10px] font-heading text-charcoal/50 uppercase tracking-wider">
                            <th className="p-3">Product Name</th>
                            <th className="p-3">SKU</th>
                            <th className="p-3 text-center">Required Qty</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal/10">
                          {data.earlyDispatchProducts.map((p: any, idx: number) => (
                            <tr key={idx} className="hover:bg-ivory/10 transition-colors">
                              <td className="p-3 font-semibold text-charcoal">{p.name}</td>
                              <td className="p-3 font-mono text-charcoal/70">{p.sku}</td>
                              <td className="p-3 text-center">
                                <span className="bg-forest/10 text-forest font-bold rounded-sm px-2.5 py-0.5 text-xs">
                                  {p.quantity}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {(!data?.lateDispatchProducts || data.lateDispatchProducts.length === 0) ? (
                    <p className="text-xs text-charcoal/40 font-body py-4 text-center">No products aggregated for 20th Dispatch.</p>
                  ) : (
                    <div className="overflow-x-auto border border-charcoal/10 rounded-sm">
                      <table className="w-full text-left border-collapse text-xs font-body">
                        <thead>
                          <tr className="bg-ivory/10 border-b border-charcoal/10 text-[10px] font-heading text-charcoal/50 uppercase tracking-wider">
                            <th className="p-3">Product Name</th>
                            <th className="p-3">SKU</th>
                            <th className="p-3 text-center">Required Qty</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal/10">
                          {data.lateDispatchProducts.map((p: any, idx: number) => (
                            <tr key={idx} className="hover:bg-ivory/10 transition-colors">
                              <td className="p-3 font-semibold text-charcoal">{p.name}</td>
                              <td className="p-3 font-mono text-charcoal/70">{p.sku}</td>
                              <td className="p-3 text-center">
                                <span className="bg-forest/10 text-forest font-bold rounded-sm px-2.5 py-0.5 text-xs">
                                  {p.quantity}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT 1 COLUMN: Active Pantry Subscribers List */}
          <div className="bg-white border border-charcoal/10 rounded-sm p-5 space-y-4 shadow-sm h-fit">
            <h3 className="text-sm font-semibold text-charcoal font-heading">Pantry Subscribers</h3>
            <p className="text-xs text-charcoal/50 font-body">
              Active accounts currently enrolled in Palum Dhara Custom Pantry Memberships.
            </p>

            <div className="divide-y divide-charcoal/10 border border-charcoal/10 rounded-sm max-h-[460px] overflow-y-auto">
              {activeTab === "early" ? (
                (!data?.earlyPantries || data.earlyPantries.length === 0) ? (
                  <p className="text-xs text-charcoal/40 font-body p-4 text-center">No subscribers in 5th Dispatch cycle.</p>
                ) : (
                  data.earlyPantries.map((p: any) => (
                    <div key={p.id} className="p-3 space-y-1 text-xs font-body hover:bg-ivory/5 transition-all">
                      <div className="flex justify-between">
                        <span className="font-semibold text-charcoal">{p.name}</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold uppercase rounded-sm px-1">{p.tier}</span>
                      </div>
                      <p className="text-[10px] text-charcoal/40 font-mono">User: {p.user.fullName || p.user.email}</p>
                      <p className="text-[10px] text-gold-light font-semibold">Frequency: {p.frequency}</p>
                    </div>
                  ))
                )
              ) : (
                (!data?.latePantries || data.latePantries.length === 0) ? (
                  <p className="text-xs text-charcoal/40 font-body p-4 text-center">No subscribers in 20th Dispatch cycle.</p>
                ) : (
                  data.latePantries.map((p: any) => (
                    <div key={p.id} className="p-3 space-y-1 text-xs font-body hover:bg-ivory/5 transition-all">
                      <div className="flex justify-between">
                        <span className="font-semibold text-charcoal">{p.name}</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold uppercase rounded-sm px-1">{p.tier}</span>
                      </div>
                      <p className="text-[10px] text-charcoal/40 font-mono">User: {p.user.fullName || p.user.email}</p>
                      <p className="text-[10px] text-gold-light font-semibold">Frequency: {p.frequency}</p>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
