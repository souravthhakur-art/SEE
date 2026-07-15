"use client"

import { useState, useEffect } from "react"
import { 
  getAnalyticsDataAction, 
  getExportDataAction 
} from "../operations-actions"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Boxes, 
  Repeat, 
  FileSpreadsheet, 
  Loader2, 
  RefreshCw, 
  Download, 
  AlertTriangle, 
  CheckCircle,
  PiggyBank
} from "lucide-react"

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const loadData = async () => {
    setLoading(true)
    const res = await getAnalyticsDataAction()
    if (res.success && res.data) {
      setData(res.data)
    } else {
      setMessage({ type: "error", text: res.error || "Failed to load analytics" })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleExport = async (type: "revenue" | "orders" | "customers" | "inventory" | "pantry") => {
    setExporting(type)
    setMessage(null)
    const res = await getExportDataAction(type)
    setExporting(null)

    if (res.success && res.data) {
      // Create CSV content and download
      const headers = Object.keys(res.data[0] || {})
      if (headers.length === 0) {
        setMessage({ type: "error", text: "Report has no data rows to download." })
        return
      }

      const csvRows = [
        headers.join(","), // header row
        ...res.data.map((row: any) => 
          headers.map((fieldName) => {
            const val = row[fieldName]
            const escaped = ("" + (val ?? "")).replace(/"/g, '""')
            return `"${escaped}"`
          }).join(",")
        )
      ]

      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n")
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `palum_dhara_${type}_report_${new Date().getFullYear()}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setMessage({ type: "success", text: `${type.toUpperCase()} spreadsheet exported successfully!` })
    } else {
      setMessage({ type: "error", text: res.error || "Failed to generate export report" })
    }
  }

  return (
    <div className="space-y-6" id="admin-analytics-page">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-wood-light/10">
        <div>
          <h1 className="heading-sm text-charcoal font-semibold flex items-center gap-2">
            <BarChart3 className="text-forest" size={24} />
            Operations Analytics & Insights
          </h1>
          <p className="text-xs text-charcoal/50 font-body mt-0.5">
            Monitor shop performance metrics, customer lifetime values, product performance, and download CSV reports.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={loadData}
            className="flex items-center gap-1.5 rounded-sm border border-charcoal/10 px-3 py-1.5 text-xs text-charcoal font-body bg-white hover:bg-ivory/20 transition-all"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync Metrics
          </button>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 rounded-sm border p-3 text-xs font-body ${
          message.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-rose-50 text-rose-800 border-rose-200"
        }`}>
          {message.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-charcoal/10 rounded-sm">
          <Loader2 className="animate-spin text-forest mb-2" size={32} />
          <p className="text-xs text-charcoal/50 font-body">Generating operations summaries...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Main KPI blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Revenue */}
            <div className="bg-white border border-charcoal/10 p-5 rounded-sm space-y-1 shadow-sm">
              <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-wider">Gross Total Sales</p>
              <p className="text-2xl font-bold font-heading text-forest">₹{data?.revenue || 0}</p>
              <p className="text-[10px] text-charcoal/40 font-body">From completed deliveries</p>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white border border-charcoal/10 p-5 rounded-sm space-y-1 shadow-sm">
              <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-wider">Monthly Sales (Last 30d)</p>
              <p className="text-2xl font-bold font-heading text-charcoal">₹{data?.monthlyRevenue || 0}</p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <TrendingUp size={12} /> Live sales window
              </p>
            </div>

            {/* MRR */}
            <div className="bg-white border border-charcoal/10 p-5 rounded-sm space-y-1 shadow-sm">
              <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-wider">Estimated Monthly Pantry MRR</p>
              <p className="text-2xl font-bold font-heading text-charcoal">₹{data?.recurringRevenue || 0}</p>
              <p className="text-[10px] text-charcoal/40 font-body">From active subscriptions</p>
            </div>

            {/* Total Orders */}
            <div className="bg-white border border-charcoal/10 p-5 rounded-sm space-y-1 shadow-sm">
              <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-wider">Processed Orders</p>
              <p className="text-2xl font-bold font-heading text-charcoal">{data?.ordersCount || 0}</p>
              <p className="text-[10px] text-charcoal/40 font-body">Completed and open tickets</p>
            </div>

          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* AOV */}
            <div className="bg-ivory/15 border border-charcoal/10 p-4 rounded-sm space-y-1 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-charcoal/50 font-bold uppercase tracking-wider">Average Order Value</p>
                <p className="text-xl font-bold font-heading text-charcoal mt-1">₹{data?.aov || 0}</p>
              </div>
              <PiggyBank size={24} className="text-charcoal/30" />
            </div>

            {/* LTV */}
            <div className="bg-ivory/15 border border-charcoal/10 p-4 rounded-sm space-y-1 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-charcoal/50 font-bold uppercase tracking-wider">Customer Lifetime Value</p>
                <p className="text-xl font-bold font-heading text-charcoal mt-1">₹{data?.ltv || 0}</p>
              </div>
              <Users size={24} className="text-charcoal/30" />
            </div>

            {/* Inventory Valuation */}
            <div className="bg-ivory/15 border border-charcoal/10 p-4 rounded-sm space-y-1 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-charcoal/50 font-bold uppercase tracking-wider">Stock Inventory Valuation</p>
                <p className="text-xl font-bold font-heading text-charcoal mt-1">₹{data?.inventoryValue || 0}</p>
              </div>
              <Boxes size={24} className="text-charcoal/30" />
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* BEST SELLERS LIST */}
            <div className="lg:col-span-2 bg-white border border-charcoal/10 rounded-sm p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold font-heading text-charcoal uppercase tracking-wider">Best Performing Products</h3>
              
              {(!data?.bestSellers || data.bestSellers.length === 0) ? (
                <p className="text-xs text-charcoal/40 font-body py-4">No order items recorded to analyze yet.</p>
              ) : (
                <div className="overflow-x-auto border border-charcoal/10 rounded-sm text-xs font-body">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-ivory/15 border-b border-charcoal/10 text-[10px] font-heading text-charcoal/50 uppercase tracking-wider">
                        <th className="p-3">Product details</th>
                        <th className="p-3 text-center">Items Sold</th>
                        <th className="p-3 text-right">Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal/10">
                      {data.bestSellers.map((prod: any, idx: number) => (
                        <tr key={idx} className="hover:bg-ivory/10 transition-colors">
                          <td className="p-3">
                            <span className="font-semibold text-charcoal">{prod.name}</span>
                            <p className="text-[10px] text-charcoal/45 font-mono mt-0.5">SKU: {prod.sku}</p>
                          </td>
                          <td className="p-3 text-center font-bold text-charcoal">{prod.count} sales</td>
                          <td className="p-3 text-right font-bold text-forest">₹{prod.revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* MODULE 9: REPORTING & SPREADSHEET EXPORTS */}
            <div className="bg-white border border-charcoal/10 rounded-sm p-5 space-y-4 shadow-sm h-fit">
              <h3 className="text-xs font-bold font-heading text-charcoal uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="text-forest" size={16} />
                Fulfillment Reports Engine
              </h3>
              <p className="text-xs text-charcoal/50 font-body">
                Compile real-time databases and export spreadsheets for accounting, inventory refills, and operations auditing.
              </p>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleExport("revenue")}
                  disabled={exporting !== null}
                  className="w-full rounded-sm border border-charcoal/10 bg-white hover:bg-ivory/25 p-2.5 text-xs text-charcoal font-semibold font-body flex justify-between items-center transition-all disabled:opacity-50"
                >
                  <span>📊 Revenue Spreadsheet</span>
                  {exporting === "revenue" ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("orders")}
                  disabled={exporting !== null}
                  className="w-full rounded-sm border border-charcoal/10 bg-white hover:bg-ivory/25 p-2.5 text-xs text-charcoal font-semibold font-body flex justify-between items-center transition-all disabled:opacity-50"
                >
                  <span>📋 Customer Orders Spreadsheet</span>
                  {exporting === "orders" ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("inventory")}
                  disabled={exporting !== null}
                  className="w-full rounded-sm border border-charcoal/10 bg-white hover:bg-ivory/25 p-2.5 text-xs text-charcoal font-semibold font-body flex justify-between items-center transition-all disabled:opacity-50"
                >
                  <span>📦 Stock Availability & Thresholds</span>
                  {exporting === "inventory" ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("customers")}
                  disabled={exporting !== null}
                  className="w-full rounded-sm border border-charcoal/10 bg-white hover:bg-ivory/25 p-2.5 text-xs text-charcoal font-semibold font-body flex justify-between items-center transition-all disabled:opacity-50"
                >
                  <span>👥 Enrolled Customers List</span>
                  {exporting === "customers" ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("pantry")}
                  disabled={exporting !== null}
                  className="w-full rounded-sm border border-charcoal/10 bg-white hover:bg-ivory/25 p-2.5 text-xs text-charcoal font-semibold font-body flex justify-between items-center transition-all disabled:opacity-50"
                >
                  <span>🔁 Recurring Pantry Memberships</span>
                  {exporting === "pantry" ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                </button>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  )
}
