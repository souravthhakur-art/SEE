"use client"

import { useState, useEffect } from "react"
import { 
  getShippingRulesAction, 
  createOrUpdateShippingRuleAction, 
  deleteShippingRuleAction 
} from "../operations-actions"
import { 
  Truck, 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Edit, 
  MapPin, 
  RefreshCw 
} from "lucide-react"

// Available Indian states for zone selection
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"
]

export default function AdminShippingPage() {
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Form State
  const [showForm, setShowForm] = useState(false)
  const [editingRule, setEditingRule] = useState<any | null>(null)
  
  const [ruleName, setRuleName] = useState("")
  const [ruleType, setRuleType] = useState("flat") // "flat", "free", "zone", "weight"
  const [minOrderValue, setMinOrderValue] = useState(0)
  const [fee, setFee] = useState(0)
  const [zoneName, setZoneName] = useState("")
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [weightLimit, setWeightLimit] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setErrorMsg(null)
    const res = await getShippingRulesAction()
    if (res.success && res.data) {
      setRules(res.data)
    } else {
      setErrorMsg(res.error || "Failed to load shipping rules")
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const resetForm = () => {
    setRuleName("")
    setRuleType("flat")
    setMinOrderValue(0)
    setFee(0)
    setZoneName("")
    setSelectedStates([])
    setWeightLimit(0)
    setIsActive(true)
    setEditingRule(null)
    setShowForm(false)
  }

  const handleEditClick = (rule: any) => {
    setEditingRule(rule)
    setRuleName(rule.name)
    setRuleType(rule.type)
    setMinOrderValue(rule.minOrderValue)
    setFee(rule.fee)
    setZoneName(rule.zoneName || "")
    setSelectedStates(rule.states || [])
    setWeightLimit(rule.weightLimit || 0)
    setIsActive(rule.active)
    setShowForm(true)
  }

  const handleStateToggle = (state: string) => {
    setSelectedStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state) 
        : [...prev, state]
    )
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ruleName) return

    setSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const res = await createOrUpdateShippingRuleAction({
      id: editingRule?.id,
      name: ruleName,
      type: ruleType,
      minOrderValue,
      fee,
      zoneName: ruleType === "zone" ? zoneName : undefined,
      states: ruleType === "zone" ? selectedStates : [],
      weightLimit: ruleType === "weight" ? weightLimit : undefined,
      active: isActive
    })

    setSubmitting(false)

    if (res.success) {
      setSuccessMsg(`Shipping rule "${ruleName}" saved successfully!`)
      resetForm()
      loadData()
    } else {
      setErrorMsg(res.error || "Failed to save shipping rule")
    }
  }

  const handleDeleteClick = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the shipping rule "${name}"?`)) return

    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const res = await deleteShippingRuleAction(id)
    if (res.success) {
      setSuccessMsg(`Shipping rule deleted successfully.`)
      loadData()
    } else {
      setErrorMsg(res.error || "Failed to delete shipping rule")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6" id="admin-shipping-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-wood-light/10">
        <div>
          <h1 className="heading-sm text-charcoal font-semibold flex items-center gap-2">
            <Truck className="text-forest" size={24} />
            Shipping Rules Engine
          </h1>
          <p className="text-xs text-charcoal/50 font-body mt-0.5">
            Configure shipping fees, setup threshold-based free deliveries, map regional shipping zones, and toggle rule activations.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-sm bg-forest px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-forest/90 transition-all font-body flex items-center gap-1"
          >
            <Plus size={14} />
            Create Shipping Rule
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-sm p-3 text-xs font-body">
          <AlertTriangle size={16} />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm p-3 text-xs font-body">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      {/* CREATE / EDIT FORM */}
      {showForm && (
        <form onSubmit={handleFormSubmit} className="bg-white border border-charcoal/10 rounded-sm p-6 space-y-5 shadow-sm max-w-2xl">
          <h3 className="text-sm font-bold font-heading text-charcoal border-b border-charcoal/10 pb-2">
            {editingRule ? `Edit Shipping Rule: ${editingRule.name}` : "Create New Shipping Rule"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal font-body">Rule Name</label>
              <input
                type="text"
                placeholder="e.g. Standard Local Flat Rate, Free Shipping Over 1500"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                required
                className="bg-white rounded-sm border border-charcoal/15 p-2 text-xs font-body focus:outline-none focus:border-forest"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal font-body">Rule Type</label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value)}
                className="bg-white rounded-sm border border-charcoal/15 p-2 text-xs font-body focus:outline-none focus:border-forest"
              >
                <option value="flat">📦 Flat Rate Shipping</option>
                <option value="free">🎁 Free Shipping (Threshold)</option>
                <option value="zone">🗺️ Zone / State Based Shipping</option>
                <option value="weight">⚖️ Weight Based Shipping</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-ivory/10 p-4 rounded-sm border border-charcoal/5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal font-body">Shipping Fee (INR)</label>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(Math.max(0, parseInt(e.target.value, 10) || 0))}
                disabled={ruleType === "free"}
                className="bg-white rounded-sm border border-charcoal/15 p-2 text-xs font-body focus:outline-none focus:border-forest disabled:bg-ivory/30"
              />
            </div>

            {ruleType === "free" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal font-body">Minimum Order Value (INR)</label>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="bg-white rounded-sm border border-charcoal/15 p-2 text-xs font-body focus:outline-none focus:border-forest"
                />
              </div>
            )}

            {ruleType === "weight" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-charcoal font-body">Weight Limit Threshold (Grams)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000 for 5kg"
                  value={weightLimit}
                  onChange={(e) => setWeightLimit(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="bg-white rounded-sm border border-charcoal/15 p-2 text-xs font-body focus:outline-none focus:border-forest"
                />
              </div>
            )}

            {ruleType === "zone" && (
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-xs font-semibold text-charcoal font-body">Zone Name</label>
                <input
                  type="text"
                  placeholder="e.g. North India, South India Zone"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="bg-white rounded-sm border border-charcoal/15 p-2 text-xs font-body focus:outline-none focus:border-forest"
                />
              </div>
            )}
          </div>

          {/* STATE MULTI-SELECT FOR ZONE */}
          {ruleType === "zone" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-charcoal font-body">Select Applicable States</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 border border-charcoal/10 rounded-sm p-4 bg-white max-h-[160px] overflow-y-auto">
                {INDIAN_STATES.map((state) => (
                  <label key={state} className="flex items-center gap-1.5 text-xs font-body text-charcoal/80 cursor-pointer hover:text-forest">
                    <input
                      type="checkbox"
                      checked={selectedStates.includes(state)}
                      onChange={() => handleStateToggle(state)}
                      className="rounded-sm border-charcoal/20 text-forest"
                    />
                    <span>{state}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-charcoal/10">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-charcoal font-body cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded-sm text-forest"
              />
              <span>Activate this rule immediately</span>
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 rounded-sm border border-charcoal/10 bg-white py-2 text-xs font-body hover:bg-ivory/20 text-charcoal"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-sm bg-forest py-2 text-xs font-semibold text-white hover:bg-forest/90 transition-all font-body flex items-center justify-center gap-1"
            >
              {submitting && <Loader2 size={12} className="animate-spin" />}
              Save Shipping Rule
            </button>
          </div>
        </form>
      )}

      {/* RULES LIST TABLE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-charcoal/10 rounded-sm">
          <Loader2 className="animate-spin text-forest mb-2" size={32} />
          <p className="text-xs text-charcoal/50 font-body">Syncing active shipping parameters...</p>
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-16 bg-white border border-charcoal/10 rounded-sm shadow-sm">
          <Truck className="mx-auto text-charcoal/20 mb-3" size={48} />
          <h3 className="text-sm font-semibold text-charcoal font-heading">No Shipping Rules Configured</h3>
          <p className="text-xs text-charcoal/50 font-body mt-1">Setup your first shipping cost rule to start calculating checkouts.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-charcoal/10 rounded-sm bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ivory/10 border-b border-charcoal/10 text-[11px] font-heading text-charcoal/60 uppercase tracking-wider">
                <th className="p-4">Rule Name</th>
                <th className="p-4">Rule Type</th>
                <th className="p-4 text-center">Shipping fee</th>
                <th className="p-4">Triggers / Parameters</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10 text-xs font-body">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-ivory/10 transition-colors">
                  <td className="p-4 font-semibold text-charcoal">{rule.name}</td>
                  <td className="p-4 text-charcoal/80 uppercase font-bold tracking-wider text-[10px]">
                    {rule.type === "flat" && "📦 Flat Rate"}
                    {rule.type === "free" && "🎁 Free Shipping"}
                    {rule.type === "zone" && "🗺️ Regional Zone"}
                    {rule.type === "weight" && "⚖️ Weight Limit"}
                  </td>
                  <td className="p-4 text-center font-bold text-forest">
                    {rule.type === "free" ? "₹0 (FREE)" : `₹${rule.fee}`}
                  </td>
                  <td className="p-4 max-w-xs">
                    {rule.type === "free" && (
                      <span className="text-charcoal/60">Minimum purchase: <strong>₹{rule.minOrderValue}</strong></span>
                    )}
                    {rule.type === "weight" && (
                      <span className="text-charcoal/60">Limit: <strong>{rule.weightLimit} grams</strong></span>
                    )}
                    {rule.type === "zone" && (
                      <div className="space-y-1">
                        <p className="font-semibold text-gold-light">{rule.zoneName || "Zone States"}</p>
                        <p className="text-[11px] text-charcoal/50 truncate">{rule.states.join(", ")}</p>
                      </div>
                    )}
                    {rule.type === "flat" && (
                      <span className="text-charcoal/40">Applies unconditionally.</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {rule.active ? (
                      <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] uppercase font-bold">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-charcoal/5 text-charcoal/45 border border-charcoal/10 px-2.5 py-0.5 text-[10px] uppercase font-bold">
                        Paused
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleEditClick(rule)}
                      className="p-1 rounded-sm border border-charcoal/10 hover:bg-ivory/20 text-charcoal/60 hover:text-charcoal transition-all"
                      title="Edit rule"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(rule.id, rule.name)}
                      className="p-1 rounded-sm border border-rose-100 hover:bg-rose-50 text-rose-600 transition-all"
                      title="Delete rule"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
