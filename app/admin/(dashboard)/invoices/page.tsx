"use client"

import { useState, useEffect } from "react"
import { 
  getInvoicesAction, 
  generateInvoiceForOrderAction 
} from "../operations-actions"
import { 
  FileText, 
  Search, 
  Plus, 
  Printer, 
  Download, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Eye
} from "lucide-react"

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)
  
  // Invoice generation state
  const [showGenerateForm, setShowGenerateForm] = useState(false)
  const [orderIdToGenerate, setOrderIdToGenerate] = useState("")
  const [invoiceType, setInvoiceType] = useState<"order" | "pantry">("order")
  const [submittingGenerate, setSubmittingGenerate] = useState(false)

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const loadData = async () => {
    setLoading(true)
    const res = await getInvoicesAction()
    if (res.success && res.data) {
      setInvoices(res.data)
    } else {
      setMessage({ type: "error", text: res.error || "Failed to load invoices" })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderIdToGenerate) return

    setSubmittingGenerate(true)
    setMessage(null)

    const res = await generateInvoiceForOrderAction(orderIdToGenerate, invoiceType)
    setSubmittingGenerate(false)

    if (res.success) {
      setMessage({ type: "success", text: `Invoice generated successfully!` })
      setOrderIdToGenerate("")
      setShowGenerateForm(false)
      loadData()
    } else {
      setMessage({ type: "error", text: res.error || "Failed to generate invoice. Make sure order exists and doesn't have an invoice." })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Filter invoices based on search
  const filteredInvoices = invoices.filter((inv) => 
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    (inv.order?.orderNumber && inv.order.orderNumber.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6" id="admin-invoices-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-wood-light/10 print:hidden">
        <div>
          <h1 className="heading-sm text-charcoal font-semibold flex items-center gap-2">
            <FileText className="text-forest" size={24} />
            GST Tax Invoices
          </h1>
          <p className="text-xs text-charcoal/50 font-body mt-0.5">
            View, search, generate, and print legally-compliant GST sales invoices for completed commerce orders.
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
          <button
            type="button"
            onClick={() => setShowGenerateForm(true)}
            className="rounded-sm bg-forest px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-forest/90 transition-all font-body flex items-center gap-1"
          >
            <Plus size={14} />
            Generate New Invoice
          </button>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 rounded-sm border p-3 text-xs font-body print:hidden ${
          message.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-rose-50 text-rose-800 border-rose-200"
        }`}>
          {message.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {message.text}
        </div>
      )}

      {/* SEARCH AND CONTROL BOX */}
      <div className="relative print:hidden">
        <Search className="absolute left-3 top-2.5 text-charcoal/40" size={16} />
        <input
          type="text"
          placeholder="Search by invoice number or order number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white rounded-sm border border-charcoal/15 pl-9 pr-3 py-2 text-xs font-body focus:outline-none focus:border-forest"
        />
      </div>

      {/* GENERATE FORM OVERLAY */}
      {showGenerateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4 print:hidden">
          <form 
            onSubmit={handleGenerateInvoice}
            className="w-full max-w-md bg-white rounded-sm border border-charcoal/10 p-6 space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-charcoal/10">
              <h3 className="text-sm font-bold font-heading text-charcoal">Generate GST Tax Invoice</h3>
              <button 
                type="button" 
                onClick={() => setShowGenerateForm(false)}
                className="text-charcoal/50 hover:text-charcoal text-lg"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal font-body">Source Order Database ID</label>
              <input
                type="text"
                placeholder="Enter order ID (e.g. clabc123...)"
                value={orderIdToGenerate}
                onChange={(e) => setOrderIdToGenerate(e.target.value)}
                required
                className="bg-white rounded-sm border border-charcoal/15 p-2 text-xs font-body focus:outline-none focus:border-forest"
              />
              <p className="text-[10px] text-charcoal/40">You can copy the database order ID from the Orders tab.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-charcoal font-body">Invoice Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs font-body text-charcoal/80 cursor-pointer">
                  <input
                    type="radio"
                    name="invoiceType"
                    checked={invoiceType === "order"}
                    onChange={() => setInvoiceType("order")}
                    className="text-forest"
                  />
                  <span>Standard Commerce Order</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-body text-charcoal/80 cursor-pointer">
                  <input
                    type="radio"
                    name="invoiceType"
                    checked={invoiceType === "pantry"}
                    onChange={() => setInvoiceType("pantry")}
                    className="text-forest"
                  />
                  <span>Pantry Box Dispatch</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGenerateForm(false)}
                className="flex-1 rounded-sm border border-charcoal/10 bg-white py-2 text-xs font-body hover:bg-ivory/20 text-charcoal"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingGenerate || !orderIdToGenerate}
                className="flex-1 rounded-sm bg-forest py-2 text-xs font-semibold text-white hover:bg-forest/90 font-body flex items-center justify-center gap-1"
              >
                {submittingGenerate && <Loader2 size={12} className="animate-spin" />}
                Generate Invoice
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INVOICES TABLE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-charcoal/10 rounded-sm print:hidden">
          <Loader2 className="animate-spin text-forest mb-2" size={32} />
          <p className="text-xs text-charcoal/50 font-body">Compiling tax records...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-16 bg-white border border-charcoal/10 rounded-sm print:hidden">
          <FileText className="mx-auto text-charcoal/20 mb-3" size={48} />
          <h3 className="text-sm font-semibold text-charcoal font-heading">No Invoices Found</h3>
          <p className="text-xs text-charcoal/50 font-body mt-1">Generate your first invoice from an existing order.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-charcoal/10 rounded-sm bg-white print:hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ivory/10 border-b border-charcoal/10 text-[11px] font-heading text-charcoal/60 uppercase tracking-wider">
                <th className="p-4">Invoice details</th>
                <th className="p-4">Linked Order</th>
                <th className="p-4">Tax Subtotal</th>
                <th className="p-4">GST amount</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4 text-right">View / Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10 text-xs font-body">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-ivory/10 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-charcoal">{inv.invoiceNumber}</p>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold uppercase rounded-sm px-1 tracking-wider">{inv.type}</span>
                  </td>
                  <td className="p-4 font-semibold text-charcoal/70">
                    {inv.order ? inv.order.orderNumber : "Manual Ref"}
                  </td>
                  <td className="p-4">₹{inv.subtotal}</td>
                  <td className="p-4 text-amber-700 font-semibold">₹{inv.tax}</td>
                  <td className="p-4 font-bold text-forest">₹{inv.grandTotal}</td>
                  <td className="p-4 text-charcoal/50">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(inv)}
                      className="rounded-sm border border-forest text-forest hover:bg-forest/5 px-2.5 py-1 text-xs font-semibold font-body transition-all flex items-center gap-1 ml-auto"
                    >
                      <Eye size={12} />
                      Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAX-COMPLIANT PRINTABLE INVOICE MODAL VIEW */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/40 p-4 flex items-center justify-center print:static print:bg-white print:p-0">
          <div className="bg-white rounded-sm border border-charcoal/15 w-full max-w-2xl p-8 space-y-6 shadow-xl print:shadow-none print:border-none print:static">
            
            {/* Header controls (hidden on print) */}
            <div className="flex justify-between items-center pb-4 border-b border-charcoal/10 print:hidden">
              <h3 className="text-sm font-bold font-heading text-charcoal">Tax Invoice Preview</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-forest text-white px-3 py-1.5 rounded-sm text-xs font-semibold font-body hover:bg-forest/90 flex items-center gap-1"
                >
                  <Printer size={12} />
                  Print Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="border border-charcoal/15 text-charcoal px-3 py-1.5 rounded-sm text-xs font-body hover:bg-ivory/20"
                >
                  Close
                </button>
              </div>
            </div>

            {/* TAX INVOICE SHEET */}
            <div className="space-y-6 print:space-y-6">
              
              {/* Brand and Invoice Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-heading text-xl font-bold text-forest leading-none">Palum Dhara Commerce</h2>
                  <p className="text-[10px] text-charcoal/50 font-body mt-1">Chakrata Hills, Uttarakhand, India</p>
                  <p className="text-[10px] text-charcoal/50 font-body">GSTIN: 05AABCP1234F1Z0</p>
                </div>
                <div className="text-right">
                  <h1 className="text-sm font-bold font-heading uppercase text-charcoal tracking-wide">TAX INVOICE</h1>
                  <p className="text-xs font-bold text-charcoal font-body mt-1">No: {selectedInvoice.invoiceNumber}</p>
                  <p className="text-[10px] text-charcoal/50 font-body mt-0.5">Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Shipper & Recipient details */}
              <div className="grid grid-cols-2 gap-4 bg-ivory/15 p-4 rounded-sm border border-charcoal/5 text-xs font-body">
                <div>
                  <p className="font-bold text-charcoal uppercase tracking-wider text-[9px] text-charcoal/40">From: Seller</p>
                  <p className="font-semibold text-charcoal mt-1">Palum Dhara Operations</p>
                  <p className="text-charcoal/60 mt-0.5">B-10, Hillcrest Orchards, Chakrata</p>
                  <p className="text-charcoal/60">Dehradun, Uttarakhand - 248123</p>
                </div>
                <div>
                  <p className="font-bold text-charcoal uppercase tracking-wider text-[9px] text-charcoal/40">To: Consignee / Bill To</p>
                  <p className="font-semibold text-charcoal mt-1">{selectedInvoice.order?.customerName || "Customer Name"}</p>
                  <p className="text-charcoal/60 mt-0.5">Email: {selectedInvoice.order?.customerEmail}</p>
                  <p className="text-charcoal/60">Phone: {selectedInvoice.order?.customerPhone || "N/A"}</p>
                </div>
              </div>

              {/* Invoice Totals */}
              <div className="space-y-3">
                <p className="text-[11px] font-heading text-charcoal/50 uppercase tracking-wider">Financial Breakdown</p>
                <div className="divide-y divide-charcoal/10 border border-charcoal/10 rounded-sm text-xs font-body">
                  <div className="p-3 flex justify-between">
                    <span className="text-charcoal/60">Taxable Goods Subtotal</span>
                    <span className="font-semibold text-charcoal">₹{selectedInvoice.subtotal}</span>
                  </div>
                  <div className="p-3 flex justify-between">
                    <span className="text-charcoal/60">Shipping & Delivery Fees</span>
                    <span className="font-semibold text-charcoal">₹{selectedInvoice.shippingFee}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="p-3 flex justify-between text-rose-700">
                      <span>Applied Discounts</span>
                      <span className="font-semibold">-₹{selectedInvoice.discount}</span>
                    </div>
                  )}
                  <div className="p-3 flex justify-between">
                    <span className="text-charcoal/60">Goods & Service Tax (GST)</span>
                    <span className="font-semibold text-amber-700">₹{selectedInvoice.tax}</span>
                  </div>
                  <div className="p-3 flex justify-between bg-forest/5 text-sm">
                    <span className="font-bold text-forest">Grand Total (Inclusive of Taxes)</span>
                    <span className="font-bold text-forest">₹{selectedInvoice.grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* GST Breakdown sub-table */}
              <div className="space-y-2">
                <p className="text-[10px] font-heading text-charcoal/50 uppercase tracking-wider">Detailed GST Tax Breakdown</p>
                <div className="grid grid-cols-3 gap-2 text-[10px] font-body text-charcoal/70 bg-ivory/10 p-3 rounded-sm border border-charcoal/5">
                  {Object.entries(selectedInvoice.taxBreakdown || {}).map(([taxKey, taxVal]: any) => {
                    if (!taxVal) return null
                    const cleanKey = taxKey.replace(/_/g, " ").replace("CGST", "CGST @").replace("SGST", "SGST @").replace("IGST", "IGST @") + "%"
                    return (
                      <div key={taxKey} className="flex justify-between border-b border-charcoal/5 pb-1">
                        <span>{cleanKey}:</span>
                        <strong className="text-charcoal">₹{taxVal}</strong>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Footer Declaration */}
              <div className="text-[10px] text-charcoal/40 font-body text-center pt-6 border-t border-charcoal/10">
                <p>This is a computer-generated tax invoice issued by Palum Dhara Commerce. No physical signature is required.</p>
                <p className="mt-0.5">Thank you for supporting organic farmers of Uttarakhand!</p>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  )
}
