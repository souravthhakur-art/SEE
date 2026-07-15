"use client"

import { useState, useEffect } from "react"
import { 
  getWarehouseDataAction, 
  generateDailyDispatchReportAction,
  getExportDataAction
} from "../operations-actions"
import { updateOrderStatus } from "../orders/actions"
import { 
  Warehouse, 
  ClipboardList, 
  Package, 
  Truck, 
  FileSpreadsheet, 
  Printer, 
  Loader2, 
  CheckCircle, 
  TrendingUp, 
  MapPin,
  RefreshCw,
  AlertCircle
} from "lucide-react"

export default function AdminWarehousePage() {
  const [activeTab, setActiveTab] = useState<"pick" | "pack" | "dispatch" | "manifest" | "report">("pick")
  const [data, setData] = useState<any>(null)
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const loadData = async () => {
    setLoading(true)
    setMessage(null)
    const res = await getWarehouseDataAction()
    const reportRes = await generateDailyDispatchReportAction()

    if (res.success && res.data) {
      setData(res.data)
    } else {
      setMessage({ type: "error", text: res.error || "Failed to load warehouse data" })
    }

    if (reportRes.success && reportRes.data) {
      setReport(reportRes.data)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusTransition = async (orderId: string, nextStatus: string) => {
    setProcessingId(orderId)
    setMessage(null)
    const res = await updateOrderStatus(orderId, nextStatus, `Warehouse transition: moved to ${nextStatus.toUpperCase()}`)
    setProcessingId(null)

    if (res.success) {
      setMessage({ type: "success", text: `Order status advanced to ${nextStatus.replace(/_/g, " ")}!` })
      loadData()
    } else {
      setMessage({ type: "error", text: res.error || "Failed to transition order status." })
    }
  }

  const printDocument = () => {
    window.print()
  }

  return (
    <div className="space-y-6" id="admin-warehouse-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-wood-light/10 print:hidden">
        <div>
          <h1 className="heading-sm text-charcoal font-semibold flex items-center gap-2">
            <Warehouse className="text-forest" size={24} />
            Warehouse Management
          </h1>
          <p className="text-xs text-charcoal/50 font-body mt-0.5">
            Access picking summaries, packing specs, dispatching queues, and ship manifests.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => loadData()}
            className="flex items-center gap-1.5 rounded-sm border border-charcoal/10 px-3 py-1.5 text-xs text-charcoal font-body bg-white hover:bg-ivory/20 transition-all"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            onClick={printDocument}
            className="flex items-center gap-1.5 rounded-sm bg-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest/90 transition-all font-body"
          >
            <Printer size={14} />
            Print View
          </button>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 rounded-sm border p-3 text-xs font-body print:hidden ${
          message.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-rose-50 text-rose-800 border-rose-200"
        }`}>
          {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-charcoal/10 overflow-x-auto print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("pick")}
          className={`px-5 py-3 text-xs font-heading font-medium tracking-wider uppercase border-b-2 transition-all ${
            activeTab === "pick" 
              ? "border-forest text-forest font-semibold" 
              : "border-transparent text-charcoal/50 hover:text-charcoal"
          }`}
        >
          📦 Pick List ({data?.pickList?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pack")}
          className={`px-5 py-3 text-xs font-heading font-medium tracking-wider uppercase border-b-2 transition-all ${
            activeTab === "pack" 
              ? "border-forest text-forest font-semibold" 
              : "border-transparent text-charcoal/50 hover:text-charcoal"
          }`}
        >
          📋 Packing Slips ({data?.packingList?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("dispatch")}
          className={`px-5 py-3 text-xs font-heading font-medium tracking-wider uppercase border-b-2 transition-all ${
            activeTab === "dispatch" 
              ? "border-forest text-forest font-semibold" 
              : "border-transparent text-charcoal/50 hover:text-charcoal"
          }`}
        >
          ⚡ Dispatch Queue ({data?.dispatchQueue?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("manifest")}
          className={`px-5 py-3 text-xs font-heading font-medium tracking-wider uppercase border-b-2 transition-all ${
            activeTab === "manifest" 
              ? "border-forest text-forest font-semibold" 
              : "border-transparent text-charcoal/50 hover:text-charcoal"
          }`}
        >
          🚛 Ship Manifest ({data?.shippingManifest?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("report")}
          className={`px-5 py-3 text-xs font-heading font-medium tracking-wider uppercase border-b-2 transition-all ${
            activeTab === "report" 
              ? "border-forest text-forest font-semibold" 
              : "border-transparent text-charcoal/50 hover:text-charcoal"
          }`}
        >
          📊 Daily Dispatch Report
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-charcoal/10 rounded-sm">
          <Loader2 className="animate-spin text-forest mb-2" size={32} />
          <p className="text-xs text-charcoal/50 font-body">Syncing warehouse inventories...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: PICK LIST */}
          {activeTab === "pick" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white border border-charcoal/10 rounded-sm p-4">
                <div>
                  <h3 className="text-sm font-semibold text-charcoal font-heading">Consolidated Daily Picking List</h3>
                  <p className="text-xs text-charcoal/50 font-body mt-0.5">
                    Aggregated product quantities required to pack all current confirmed and picking orders.
                  </p>
                </div>
              </div>

              {(!data?.pickList || data.pickList.length === 0) ? (
                <div className="text-center py-16 bg-white border border-charcoal/10 rounded-sm">
                  <ClipboardList className="mx-auto text-charcoal/20 mb-3" size={48} />
                  <h3 className="text-sm font-semibold text-charcoal font-heading">Pick List is Empty</h3>
                  <p className="text-xs text-charcoal/50 font-body mt-1">There are no confirmed or picking orders waiting to be picked.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-charcoal/10 rounded-sm bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-ivory/10 border-b border-charcoal/10 text-[11px] font-heading text-charcoal/60 uppercase tracking-wider">
                        <th className="p-4">Item details</th>
                        <th className="p-4">SKU</th>
                        <th className="p-4">Pack Weight</th>
                        <th className="p-4 text-center">Required quantity</th>
                        <th className="p-4 text-center">Shelf Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal/10">
                      {data.pickList.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-ivory/10 text-xs font-body transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-sm border border-charcoal/10" />
                            )}
                            <span className="font-semibold text-charcoal">{item.name}</span>
                          </td>
                          <td className="p-4 font-mono text-charcoal/70">{item.sku}</td>
                          <td className="p-4 text-charcoal/60">{item.weight}</td>
                          <td className="p-4 text-center">
                            <span className="bg-forest/10 text-forest font-bold rounded-sm px-3 py-1 text-sm">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono text-gold-light font-semibold">Row A - Shelf {idx % 3 + 1}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PACKING LIST */}
          {activeTab === "pack" && (
            <div className="space-y-4">
              <div className="bg-white border border-charcoal/10 rounded-sm p-4">
                <h3 className="text-sm font-semibold text-charcoal font-heading">Packing Slips & Box Configurations</h3>
                <p className="text-xs text-charcoal/50 font-body mt-0.5">
                  Pack orders, configure box dimensions, and print slips to include inside packages.
                </p>
              </div>

              {(!data?.packingList || data.packingList.length === 0) ? (
                <div className="text-center py-16 bg-white border border-charcoal/10 rounded-sm">
                  <Package className="mx-auto text-charcoal/20 mb-3" size={48} />
                  <h3 className="text-sm font-semibold text-charcoal font-heading">No Orders in Packing</h3>
                  <p className="text-xs text-charcoal/50 font-body mt-1">Change order status to 'Packing' from the Orders dashboard to see them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.packingList.map((order: any) => {
                    let address: any = {}
                    try {
                      address = typeof order.shippingAddress === "string" ? JSON.parse(order.shippingAddress) : order.shippingAddress
                    } catch (e) {
                      address = order.shippingAddress || {}
                    }

                    return (
                      <div key={order.id} className="bg-white border border-charcoal/10 rounded-sm p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start pb-2 border-b border-charcoal/10">
                          <div>
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Packing</span>
                            <h4 className="text-sm font-bold text-charcoal font-heading mt-1">{order.orderNumber}</h4>
                            <p className="text-[10px] text-charcoal/40 font-body mt-0.5">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStatusTransition(order.id, "ready_to_dispatch")}
                            disabled={processingId === order.id}
                            className="bg-forest text-white px-3 py-1.5 rounded-sm text-xs font-semibold font-body hover:bg-forest/90 flex items-center gap-1"
                          >
                            {processingId === order.id ? <Loader2 size={12} className="animate-spin" /> : "Mark Ready"}
                          </button>
                        </div>

                        <div className="text-xs font-body space-y-1 bg-ivory/10 p-3 rounded-sm border border-charcoal/5">
                          <p className="font-semibold text-charcoal">Shipping To:</p>
                          <p className="text-charcoal/80 font-medium">{order.customerName}</p>
                          <p className="text-charcoal/60">{address.addressLine1}, {address.addressLine2 ? `${address.addressLine2}, ` : ""}{address.city}, {address.state} - {address.postalCode}</p>
                          <p className="text-charcoal/60">Phone: {order.customerPhone || "N/A"}</p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[11px] font-heading text-charcoal/50 uppercase tracking-wider">Package Contents</p>
                          <div className="divide-y divide-charcoal/10 border border-charcoal/10 rounded-sm">
                            {order.items.map((item: any) => (
                              <div key={item.id} className="p-3 flex justify-between items-center text-xs font-body">
                                <div>
                                  <p className="font-semibold text-charcoal">{item.productName}</p>
                                  <p className="text-[10px] text-charcoal/40 font-mono">SKU: {item.productSku} | Wt: {item.weight}</p>
                                </div>
                                <span className="bg-ivory/40 border border-charcoal/10 text-charcoal font-bold px-2.5 py-1 rounded-sm text-xs">
                                  Qty: {item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-[10px] bg-amber-50 text-amber-800 p-2 border border-amber-200 rounded-sm font-body">
                          <strong>Note:</strong> Custom wrap in Palum Dhara traditional paper. Ensure best-before seal is visible.
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DISPATCH QUEUE */}
          {activeTab === "dispatch" && (
            <div className="space-y-4">
              <div className="bg-white border border-charcoal/10 rounded-sm p-4">
                <h3 className="text-sm font-semibold text-charcoal font-heading">Ready to Dispatch Queue</h3>
                <p className="text-xs text-charcoal/50 font-body mt-0.5">
                  Confirm shipping coordinates, generate shipping slips, and trigger courier pickups.
                </p>
              </div>

              {(!data?.dispatchQueue || data.dispatchQueue.length === 0) ? (
                <div className="text-center py-16 bg-white border border-charcoal/10 rounded-sm">
                  <Truck className="mx-auto text-charcoal/20 mb-3" size={48} />
                  <h3 className="text-sm font-semibold text-charcoal font-heading">Dispatch Queue is Empty</h3>
                  <p className="text-xs text-charcoal/50 font-body mt-1">There are no orders ready for dispatch.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-charcoal/10 rounded-sm bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-ivory/10 border-b border-charcoal/10 text-[11px] font-heading text-charcoal/60 uppercase tracking-wider">
                        <th className="p-4">Order details</th>
                        <th className="p-4">Recipient</th>
                        <th className="p-4">State / Location</th>
                        <th className="p-4 text-center">Total Weight</th>
                        <th className="p-4 text-right">Fulfill / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal/10">
                      {data.dispatchQueue.map((order: any) => {
                        let address: any = {}
                        try {
                          address = typeof order.shippingAddress === "string" ? JSON.parse(order.shippingAddress) : order.shippingAddress
                        } catch (e) {
                          address = order.shippingAddress || {}
                        }

                        return (
                          <tr key={order.id} className="hover:bg-ivory/10 text-xs font-body transition-colors">
                            <td className="p-4 font-semibold text-charcoal">
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">Ready</span>
                              <p className="mt-1 font-bold">{order.orderNumber}</p>
                              <p className="text-[10px] text-charcoal/40 font-mono">ID: {order.id.substr(0,8)}...</p>
                            </td>
                            <td className="p-4">
                              <p className="font-semibold text-charcoal">{order.customerName}</p>
                              <p className="text-charcoal/50 text-[11px]">{order.customerEmail}</p>
                            </td>
                            <td className="p-4 flex items-center gap-1 text-charcoal/70">
                              <MapPin size={14} className="text-charcoal/40 shrink-0" />
                              <span>{address.city}, {address.state}</span>
                            </td>
                            <td className="p-4 text-center text-charcoal/60 font-medium">~1.5 kg</td>
                            <td className="p-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleStatusTransition(order.id, "dispatched")}
                                disabled={processingId === order.id}
                                className="bg-forest text-white px-3.5 py-1.5 rounded-sm text-xs font-semibold font-body hover:bg-forest/90 transition-all flex items-center gap-1 ml-auto"
                              >
                                {processingId === order.id ? <Loader2 size={12} className="animate-spin" /> : <Truck size={14} />}
                                Ship Package
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
          )}

          {/* TAB 4: SHIPPING MANIFEST */}
          {activeTab === "manifest" && (
            <div className="space-y-4">
              <div className="bg-white border border-charcoal/10 rounded-sm p-4">
                <h3 className="text-sm font-semibold text-charcoal font-heading">Active Shipping Manifest</h3>
                <p className="text-xs text-charcoal/50 font-body mt-0.5">
                  Consolidated shipping records for dispatched packages currently transit with logistics partners.
                </p>
              </div>

              {(!data?.shippingManifest || data.shippingManifest.length === 0) ? (
                <div className="text-center py-16 bg-white border border-charcoal/10 rounded-sm">
                  <Truck className="mx-auto text-charcoal/20 mb-3" size={48} />
                  <h3 className="text-sm font-semibold text-charcoal font-heading">No Shipped Packages</h3>
                  <p className="text-xs text-charcoal/50 font-body mt-1">Dispatched orders will show here in transit.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-charcoal/10 rounded-sm bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-ivory/10 border-b border-charcoal/10 text-[11px] font-heading text-charcoal/60 uppercase tracking-wider">
                        <th className="p-4">Dispatched Order</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Tracking Number</th>
                        <th className="p-4">Logistics Partner</th>
                        <th className="p-4 text-right">Mark Delivered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal/10">
                      {data.shippingManifest.map((order: any) => (
                        <tr key={order.id} className="hover:bg-ivory/10 text-xs font-body transition-colors">
                          <td className="p-4 font-bold text-charcoal">{order.orderNumber}</td>
                          <td className="p-4 text-charcoal/80">{order.customerName}</td>
                          <td className="p-4 font-mono font-bold text-gold-light">PD-{Math.floor(100000 + Math.random() * 900000)}IN</td>
                          <td className="p-4 font-semibold text-charcoal/70">Delhivery Express</td>
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleStatusTransition(order.id, "delivered")}
                              disabled={processingId === order.id}
                              className="rounded-sm border border-forest text-forest hover:bg-forest/5 px-3 py-1 font-semibold font-body text-xs ml-auto flex items-center gap-1"
                            >
                              {processingId === order.id ? <Loader2 size={12} className="animate-spin" /> : "Mark Delivered"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DAILY DISPATCH REPORT */}
          {activeTab === "report" && (
            <div className="space-y-6">
              <div className="bg-white border border-charcoal/10 rounded-sm p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-charcoal font-heading">Daily Dispatch Performance Log</h3>
                  <p className="text-xs text-charcoal/50 font-body mt-0.5">
                    Real-time operational summary of packages dispatched and delivered today.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="bg-ivory/20 p-4 rounded-sm border border-charcoal/5 space-y-1">
                    <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-wider">Packages Dispatched Today</p>
                    <p className="text-2xl font-bold font-heading text-charcoal">{report?.dispatchedCount || 0}</p>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5"><TrendingUp size={12} /> Live Count</p>
                  </div>
                  <div className="bg-ivory/20 p-4 rounded-sm border border-charcoal/5 space-y-1">
                    <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-wider">Dispatched Revenue Value</p>
                    <p className="text-2xl font-bold font-heading text-forest">₹{report?.dispatchedValue || 0}</p>
                    <p className="text-[10px] text-charcoal/40 font-body">INR Total</p>
                  </div>
                  <div className="bg-ivory/20 p-4 rounded-sm border border-charcoal/5 space-y-1">
                    <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-wider">Packages Delivered Today</p>
                    <p className="text-2xl font-bold font-heading text-charcoal">{report?.deliveredCount || 0}</p>
                    <p className="text-[10px] text-charcoal/40 font-body">Live Delivered</p>
                  </div>
                  <div className="bg-ivory/20 p-4 rounded-sm border border-charcoal/5 space-y-1">
                    <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-wider">Delivered Value</p>
                    <p className="text-2xl font-bold font-heading text-charcoal">₹{report?.deliveredValue || 0}</p>
                    <p className="text-[10px] text-charcoal/40 font-body">INR Total</p>
                  </div>
                </div>
              </div>

              {/* Dispatched Orders list */}
              <div className="bg-white border border-charcoal/10 rounded-sm p-5 space-y-3">
                <h4 className="text-xs font-semibold text-charcoal font-heading uppercase tracking-wider">Packages Shipped Today</h4>
                {(!report?.dispatchedOrders || report.dispatchedOrders.length === 0) ? (
                  <p className="text-xs text-charcoal/40 font-body py-2">No dispatches logged today yet.</p>
                ) : (
                  <div className="divide-y divide-charcoal/10 border border-charcoal/10 rounded-sm text-xs font-body">
                    {report.dispatchedOrders.map((o: any) => (
                      <div key={o.id} className="p-3 flex justify-between items-center hover:bg-ivory/5">
                        <div>
                          <p className="font-bold text-charcoal">{o.orderNumber}</p>
                          <p className="text-[10px] text-charcoal/40 mt-0.5">{o.customerName} | {o.customerEmail}</p>
                        </div>
                        <span className="font-semibold text-charcoal">₹{o.grandTotal}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
