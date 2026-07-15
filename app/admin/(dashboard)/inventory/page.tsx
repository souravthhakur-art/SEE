"use client"

import { useState, useEffect } from "react"
import { 
  getInventoryDataAction, 
  adjustStockAction, 
  bulkAdjustStockAction 
} from "../operations-actions"
import { 
  Boxes, 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  RefreshCw, 
  AlertTriangle, 
  History, 
  Loader2, 
  CheckCircle,
  Save
} from "lucide-react"

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<"all" | "low" | "out">("all")
  
  // Single adjustment state
  const [adjustingProduct, setAdjustingProduct] = useState<any | null>(null)
  const [adjustQty, setAdjustQty] = useState(0)
  const [adjustType, setAdjustType] = useState("restock")
  const [adjustNotes, setAdjustNotes] = useState("")
  const [submittingSingle, setSubmittingSingle] = useState(false)

  // Bulk adjustment state
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkChanges, setBulkChanges] = useState<Record<string, { quantity: number; notes: string }>>({})
  const [submittingBulk, setSubmittingBulk] = useState(false)

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const loadData = async () => {
    setLoading(true)
    const res = await getInventoryDataAction()
    if (res.success && res.data) {
      setInventory(res.data)
    } else {
      setMessage({ type: "error", text: res.error || "Failed to load inventory data" })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adjustingProduct || adjustQty === 0) return

    setSubmittingSingle(true)
    setMessage(null)

    const res = await adjustStockAction(
      adjustingProduct.id,
      adjustQty,
      adjustType,
      adjustNotes || `Adjusted stock by ${adjustQty}`
    )

    setSubmittingSingle(false)

    if (res.success) {
      setMessage({ type: "success", text: "Stock adjusted successfully!" })
      setAdjustingProduct(null)
      setAdjustQty(0)
      setAdjustNotes("")
      loadData()
    } else {
      setMessage({ type: "error", text: res.error || "Failed to adjust stock" })
    }
  }

  const handleBulkChange = (productId: string, val: number) => {
    setBulkChanges(prev => ({
      ...prev,
      [productId]: {
        quantity: val,
        notes: prev[productId]?.notes || "Bulk update"
      }
    }))
  }

  const handleBulkNotesChange = (productId: string, val: string) => {
    setBulkChanges(prev => ({
      ...prev,
      [productId]: {
        quantity: prev[productId]?.quantity || 0,
        notes: val
      }
    }))
  }

  const handleBulkSubmit = async () => {
    const updates = Object.entries(bulkChanges)
      .map(([productId, change]) => ({
        productId,
        quantity: change.quantity,
        notes: change.notes
      }))
      .filter(u => u.quantity !== 0)

    if (updates.length === 0) {
      setBulkMode(false)
      return
    }

    setSubmittingBulk(true)
    setMessage(null)

    const res = await bulkAdjustStockAction(updates)
    setSubmittingBulk(false)

    if (res.success) {
      setMessage({ type: "success", text: "Bulk stock updates applied successfully!" })
      setBulkChanges({})
      setBulkMode(false)
      loadData()
    } else {
      setMessage({ type: "error", text: res.error || "Failed to apply bulk updates" })
    }
  }

  // Filters
  const filteredProducts = inventory.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      item.sku.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (filterType === "low") return item.isLow
    if (filterType === "out") return item.isOut
    return true
  })

  return (
    <div className="space-y-6" id="admin-inventory-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-wood-light/10">
        <div>
          <h1 className="heading-sm text-charcoal font-semibold flex items-center gap-2">
            <Boxes className="text-forest" size={24} />
            Inventory Hub
          </h1>
          <p className="text-xs text-charcoal/50 font-body mt-0.5">
            Monitor real-time availability, track reserved orders, and execute stock refills.
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
            Reload
          </button>
          {!bulkMode ? (
            <button
              type="button"
              onClick={() => setBulkMode(true)}
              className="rounded-sm bg-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest/90 transition-all font-body"
            >
              Bulk Stock Update
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setBulkChanges({})
                  setBulkMode(false)
                }}
                className="rounded-sm border border-charcoal/10 bg-white px-3 py-1.5 text-xs font-body hover:bg-ivory/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkSubmit}
                className="flex items-center gap-1 rounded-sm bg-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest/90 font-body"
                disabled={submittingBulk}
              >
                {submittingBulk ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Bulk Changes
              </button>
            </div>
          )}
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

      {/* Filter and Search controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3 rounded-sm border border-charcoal/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-charcoal/40" size={16} />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white rounded-sm border border-charcoal/15 pl-9 pr-3 py-2 text-xs font-body focus:outline-none focus:border-forest"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter size={14} className="text-charcoal/40 shrink-0" />
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`rounded-full px-3 py-1 text-xs font-body shrink-0 transition-all ${
              filterType === "all" ? "bg-forest text-white" : "bg-ivory/30 text-charcoal/60 hover:bg-ivory/60"
            }`}
          >
            All Products ({inventory.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("low")}
            className={`rounded-full px-3 py-1 text-xs font-body shrink-0 transition-all flex items-center gap-1 ${
              filterType === "low" ? "bg-amber-500 text-white" : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
            }`}
          >
            Low Stock Alerts ({inventory.filter(i => i.isLow).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("out")}
            className={`rounded-full px-3 py-1 text-xs font-body shrink-0 transition-all flex items-center gap-1 ${
              filterType === "out" ? "bg-rose-500 text-white" : "bg-rose-500/10 text-rose-700 hover:bg-rose-500/20"
            }`}
          >
            Out of Stock ({inventory.filter(i => i.isOut).length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-charcoal/10 rounded-sm">
          <Loader2 className="animate-spin text-forest mb-2" size={32} />
          <p className="text-xs text-charcoal/50 font-body">Loading real-time inventories...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-charcoal/10 rounded-sm">
          <Boxes className="mx-auto text-charcoal/20 mb-3" size={48} />
          <h3 className="text-sm font-semibold text-charcoal font-heading">No Products Found</h3>
          <p className="text-xs text-charcoal/50 font-body mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-charcoal/10 rounded-sm bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ivory/10 border-b border-charcoal/10 text-[11px] font-heading text-charcoal/60 uppercase tracking-wider">
                <th className="p-4">Product details</th>
                <th className="p-4">SKU</th>
                <th className="p-4 text-center">Current stock</th>
                <th className="p-4 text-center">Reserved stock</th>
                <th className="p-4 text-center">Available stock</th>
                <th className="p-4 text-center">Low Threshold</th>
                <th className="p-4 text-center">Status</th>
                {!bulkMode && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10">
              {filteredProducts.map((item) => {
                const bulkValue = bulkChanges[item.id]?.quantity || 0
                const bulkNotes = bulkChanges[item.id]?.notes || ""

                return (
                  <tr key={item.id} className="hover:bg-ivory/10 text-xs font-body transition-colors">
                    <td className="p-4 font-semibold text-charcoal max-w-[240px] truncate">{item.name}</td>
                    <td className="p-4 font-mono text-charcoal/80">{item.sku}</td>
                    
                    {/* Current Stock cell */}
                    <td className="p-4 text-center">
                      {!bulkMode ? (
                        <span className="font-semibold">{item.currentStock}</span>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 max-w-[120px] mx-auto">
                          <input
                            type="number"
                            value={item.currentStock + bulkValue}
                            disabled
                            className="w-12 bg-ivory/10 border border-charcoal/10 rounded-sm p-1 text-center font-semibold text-charcoal"
                          />
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleBulkChange(item.id, bulkValue + 1)}
                              className="p-0.5 border border-charcoal/10 bg-white hover:bg-ivory/20 rounded-sm text-charcoal"
                            >
                              <Plus size={10} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBulkChange(item.id, bulkValue - 1)}
                              className="p-0.5 border border-charcoal/10 bg-white hover:bg-ivory/20 rounded-sm text-charcoal"
                            >
                              <Minus size={10} />
                            </button>
                          </div>
                          {bulkValue !== 0 && (
                            <span className={`text-[10px] font-semibold ${bulkValue > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              ({bulkValue > 0 ? `+${bulkValue}` : bulkValue})
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Reserved Stock cell */}
                    <td className="p-4 text-center text-charcoal/60 font-medium">
                      {item.reservedStock > 0 ? (
                        <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 font-semibold">
                          {item.reservedStock}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Available Stock cell */}
                    <td className="p-4 text-center">
                      <span className={`font-semibold rounded-sm px-1.5 py-0.5 ${
                        item.isOut 
                          ? "bg-rose-50 text-rose-700 border border-rose-200" 
                          : item.isLow 
                            ? "bg-amber-50 text-amber-700 border border-amber-200" 
                            : "text-forest"
                      }`}>
                        {item.availableStock}
                      </span>
                    </td>

                    <td className="p-4 text-center text-charcoal/50">{item.lowStockThreshold}</td>

                    {/* Status cell */}
                    <td className="p-4 text-center">
                      {item.isOut ? (
                        <span className="rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/25 px-2.5 py-0.5 text-[10px] uppercase font-bold">
                          Out of Stock
                        </span>
                      ) : item.isLow ? (
                        <span className="rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/25 px-2.5 py-0.5 text-[10px] uppercase font-bold">
                          Low Stock
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 px-2.5 py-0.5 text-[10px] uppercase font-bold">
                          Healthy
                        </span>
                      )}
                    </td>

                    {/* Action cell */}
                    {!bulkMode ? (
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => setAdjustingProduct(item)}
                          className="rounded-sm border border-forest/20 text-forest hover:bg-forest/10 px-2.5 py-1 text-xs font-semibold font-body transition-all"
                        >
                          Adjust
                        </button>
                      </td>
                    ) : (
                      <td className="p-4 text-center">
                        <input
                          type="text"
                          placeholder="Adjustment comment..."
                          value={bulkNotes}
                          onChange={(e) => handleBulkNotesChange(item.id, e.target.value)}
                          className="bg-white border border-charcoal/15 rounded-sm p-1 text-[11px] w-32 font-body"
                        />
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Stock Modal / Overlay */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4">
          <form 
            onSubmit={handleAdjustSubmit}
            className="w-full max-w-md bg-white rounded-sm border border-charcoal/10 p-6 space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-charcoal/10">
              <h3 className="heading-xs text-charcoal font-semibold">Stock Adjustment</h3>
              <button 
                type="button" 
                onClick={() => setAdjustingProduct(null)}
                className="text-charcoal/50 hover:text-charcoal text-lg"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-charcoal/50 font-body">Product</p>
              <p className="text-sm font-semibold text-charcoal font-heading">{adjustingProduct.name}</p>
              <p className="text-[11px] font-mono text-charcoal/40">{adjustingProduct.sku}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-ivory/20 p-2.5 rounded-sm text-center">
                <p className="text-[10px] text-charcoal/50 uppercase font-bold">Current stock</p>
                <p className="text-lg font-bold mt-1 text-charcoal">{adjustingProduct.currentStock}</p>
              </div>
              <div className="bg-ivory/20 p-2.5 rounded-sm text-center">
                <p className="text-[10px] text-charcoal/50 uppercase font-bold">Reserved stock</p>
                <p className="text-lg font-bold mt-1 text-charcoal">{adjustingProduct.reservedStock}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal font-body">Adjustment quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustQty(q => q - 1)}
                    className="p-2 border border-charcoal/10 rounded-sm hover:bg-ivory/20 text-charcoal"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(parseInt(e.target.value, 10) || 0)}
                    className="flex-1 bg-white border border-charcoal/15 rounded-sm p-2 text-center text-sm font-semibold text-charcoal focus:outline-none focus:border-forest"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustQty(q => q + 1)}
                    className="p-2 border border-charcoal/10 rounded-sm hover:bg-ivory/20 text-charcoal"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="text-[10px] text-charcoal/40 mt-1">
                  Use negative quantities to decrease stock (e.g. damages, shrinkage), and positive to increase (restock).
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal font-body">Reason Category</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="bg-white rounded-sm border border-charcoal/15 p-2 text-xs font-body focus:outline-none focus:border-forest"
                >
                  <option value="restock">📦 Restock / Fresh Refill</option>
                  <option value="audit_adjustment">🔍 Audit Correction</option>
                  <option value="damage">🩹 Damage / Shrinkage</option>
                  <option value="returned">🔄 Customer Return</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal font-body">Adjustment notes</label>
                <textarea
                  placeholder="Enter details about this adjustment..."
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="bg-white rounded-sm border border-charcoal/15 p-2 text-xs font-body focus:outline-none focus:border-forest h-16"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustingProduct(null)}
                className="flex-1 rounded-sm border border-charcoal/10 bg-white py-2 text-xs font-body hover:bg-ivory/20 text-charcoal"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingSingle || adjustQty === 0}
                className="flex-1 rounded-sm bg-forest py-2 text-xs font-semibold text-white hover:bg-forest/90 transition-all font-body flex items-center justify-center gap-1"
              >
                {submittingSingle && <Loader2 size={12} className="animate-spin" />}
                Confirm Adjustment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
