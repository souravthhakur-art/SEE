"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Search, 
  Filter, 
  Calendar, 
  Truck, 
  Tag, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User as UserIcon, 
  MapPin, 
  CreditCard, 
  Check, 
  Loader2, 
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Printer,
  ChevronDown
} from "lucide-react";
import { updateOrderStatus } from "@/app/admin/(dashboard)/orders/actions";

interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  quantity: number;
  price: number;
  weight: string;
  image: string;
}

interface OrderHistory {
  id: string;
  status: string;
  notes: string | null;
  createdAt: Date;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  grandTotal: number;
  couponCode: string | null;
  notes: string | null;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: any;
  billingAddress: any;
  items: OrderItem[];
  history: OrderHistory[];
}

interface AdminOrdersContentProps {
  orders: Order[];
  totalCount: number;
  currentPage: number;
}

export default function AdminOrdersContent({ orders, totalCount, currentPage }: AdminOrdersContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search and filter inputs
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");

  // Selected Order for Master-Detail View
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    orders[0]?.id || null
  );

  // Status Change State
  const [newStatus, setNewStatus] = useState("");
  const [timelineNotes, setTimelineNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync state when list updates or selected order changes
  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  useEffect(() => {
    if (activeOrder) {
      setNewStatus(activeOrder.status);
      setTimelineNotes("");
      setUpdateMessage(null);
    }
  }, [selectedOrderId, activeOrder]);

  // Handle Input Changes & Sync with URL search params
  const triggerSearch = (searchVal: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchVal) {
      params.set("search", searchVal);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleStatusFilterChange = (statusVal: string) => {
    setStatusFilter(statusVal);
    const params = new URLSearchParams(searchParams.toString());
    if (statusVal && statusVal !== "all") {
      params.set("status", statusVal);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNum.toString());
    router.push(`?${params.toString()}`);
  };

  // Status Update Trigger
  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    setIsUpdatingStatus(true);
    setUpdateMessage(null);

    const res = await updateOrderStatus(activeOrder.id, newStatus, timelineNotes);
    setIsUpdatingStatus(false);

    if (res.success) {
      setUpdateMessage({ type: "success", text: "Order status and timeline successfully updated!" });
      setTimelineNotes("");
      router.refresh();
    } else {
      setUpdateMessage({ type: "error", text: res.error || "Failed to update order status." });
    }
  };

  // Status Style Maps
  const statusClasses: Record<string, string> = {
    processing: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    packed: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    shipped: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
    delivered: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    cancelled: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  };

  const limit = 10;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="admin-orders-content">
      
      {/* LEFT COLUMN: MASTER LIST (6 cols) */}
      <div className="lg:col-span-5 space-y-4" id="admin-orders-list-panel">
        
        {/* Search & Filter Controls */}
        <div className="bg-white border border-wood-light/20 p-4 rounded-md shadow-sm space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-charcoal/40" />
            <input
              type="text"
              placeholder="Search by Order ID, Name, Email..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                triggerSearch(e.target.value);
              }}
              className="h-10 w-full border border-wood-light/30 focus:border-forest pl-9 pr-3 rounded-sm text-xs text-charcoal outline-none font-body bg-transparent/5"
            />
          </div>

          <div className="flex gap-2 items-center">
            <Filter className="w-3.5 h-3.5 text-charcoal/50" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-charcoal/50 mr-1">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="h-8 border border-wood-light/20 focus:border-forest rounded-sm text-xs text-charcoal outline-none bg-white px-2 cursor-pointer font-body flex-1"
            >
              <option value="all">All Statuses</option>
              <option value="processing">Processing</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Master Orders List */}
        <div className="space-y-3" id="admin-orders-scroll-container">
          {orders.length === 0 ? (
            <div className="bg-white border border-wood-light/20 py-12 px-6 text-center rounded-md">
              <Clock className="w-8 h-8 text-stone/40 mx-auto mb-3 stroke-1" />
              <h4 className="text-sm font-semibold text-charcoal mb-1">No Orders Found</h4>
              <p className="text-xs text-charcoal/50 max-w-xs mx-auto leading-relaxed font-body">
                We couldn't find any orders matching the selected parameters or filters.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const isSelected = selectedOrderId === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`border p-4 rounded-sm cursor-pointer transition-all duration-200 relative bg-white ${
                    isSelected
                      ? "border-forest bg-forest/[0.01] shadow-sm"
                      : "border-wood-light/20 hover:border-forest/40"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-xs font-mono font-semibold text-forest">
                      {order.orderNumber}
                    </span>
                    <span className={`text-[9px] tracking-wider font-semibold uppercase px-2 py-0.5 border rounded-sm ${statusClasses[order.status] || "bg-stone/10 text-stone-700"}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-end text-xs font-body">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-charcoal">{order.customerName}</p>
                      <p className="text-[10px] text-charcoal/50">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className="font-mono font-semibold text-forest">
                      ₹{order.grandTotal}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white border border-wood-light/20 p-4 rounded-md shadow-sm">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 border border-wood-light/30 hover:border-forest text-xs font-body uppercase font-semibold rounded-sm flex items-center gap-1 disabled:opacity-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <span className="text-[10px] font-mono tracking-wider text-charcoal/50">
              Page {currentPage} of {totalPages} ({totalCount} total)
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 border border-wood-light/30 hover:border-forest text-xs font-body uppercase font-semibold rounded-sm flex items-center gap-1 disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: DETAILED INVOICE & STATUS CONTROL (7 cols) */}
      <div className="lg:col-span-7" id="admin-orders-detail-panel">
        {activeOrder ? (
          <div className="bg-white border border-wood-light/20 p-6 md:p-8 rounded-md shadow-sm space-y-8 warm-card">
            
            {/* Header info */}
            <div className="border-b border-wood-light/10 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-charcoal/40">Fulfillment Console</span>
                <h2 className="text-base font-semibold text-forest font-mono mt-0.5">
                  {activeOrder.orderNumber}
                </h2>
                <span className="text-xs text-charcoal/50 font-body block mt-0.5">
                  Placed {new Date(activeOrder.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-wood-light/30 hover:border-forest text-[11px] font-body tracking-wider uppercase font-semibold flex items-center gap-1.5 rounded-sm self-start sm:self-auto hover:bg-forest hover:text-ivory transition-all duration-200"
                title="Print Packing Invoice"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Invoice
              </button>
            </div>

            {/* STATUS UPDATE WIDGET */}
            <div className="bg-forest/[0.02] border border-forest/15 rounded-sm p-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase text-forest tracking-wider flex items-center gap-2 font-heading">
                <Truck className="w-4 h-4" />
                Fulfillment & Logistics Controller
              </h3>

              <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                      Current Dispatch Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-white rounded-sm text-xs text-charcoal outline-none cursor-pointer font-body"
                    >
                      <option value="processing">Processing</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                      Settlement Settlement
                    </label>
                    <div className="h-10 border border-wood-light/10 bg-white/50 px-3 flex items-center rounded-sm text-xs text-charcoal font-semibold uppercase tracking-wider font-mono">
                      Cash on Delivery (COD)
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="timelineNotes" className="text-[10px] tracking-wider uppercase text-charcoal/50 font-body">
                    Customer-Visible Timeline Notes
                  </label>
                  <input
                    id="timelineNotes"
                    type="text"
                    placeholder="e.g. Dispatched via Delhivery (AWD: DLV-918239). Estimating 3 days."
                    value={timelineNotes}
                    onChange={(e) => setTimelineNotes(e.target.value)}
                    className="h-10 border border-wood-light/30 focus:border-forest px-3 bg-white rounded-sm text-xs text-charcoal outline-none font-body"
                  />
                  <p className="text-[9px] text-charcoal/40 mt-1">This text appears instantly on the customer's personal timeline logs.</p>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-forest/10 pt-4 mt-2">
                  {updateMessage && (
                    <div className={`text-xs font-semibold leading-relaxed font-body flex items-center gap-1.5 ${
                      updateMessage.type === "success" ? "text-forest-light" : "text-terracotta"
                    }`}>
                      {updateMessage.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span>{updateMessage.text}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isUpdatingStatus || newStatus === activeOrder.status && !timelineNotes}
                    className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2 self-end ml-auto"
                  >
                    {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Commit Status Update
                  </button>
                </div>
              </form>
            </div>

            {/* CUSTOMER BRIEF */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-wood-light/10 pt-6">
              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40 mb-3 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" />
                  Customer Profile
                </h4>
                <div className="text-xs text-charcoal font-body leading-relaxed space-y-0.5">
                  <p className="font-semibold text-forest">{activeOrder.customerName}</p>
                  <p className="text-charcoal/50 truncate font-mono">{activeOrder.customerEmail}</p>
                  {activeOrder.customerPhone && (
                    <p className="text-charcoal/60 font-mono mt-1">Phone: {activeOrder.customerPhone}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Shipping Address
                </h4>
                <div className="text-xs text-charcoal font-body leading-relaxed">
                  <p>{activeOrder.shippingAddress.addressLine1}</p>
                  {activeOrder.shippingAddress.addressLine2 && <p>{activeOrder.shippingAddress.addressLine2}</p>}
                  <p>{activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} — {activeOrder.shippingAddress.postalCode}</p>
                </div>
              </div>
            </div>

            {/* ORDER ITEMS */}
            <div className="border-t border-wood-light/10 pt-6">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40 mb-3">
                Items Packed ({activeOrder.items.reduce((sum, i) => sum + i.quantity, 0)} total)
              </h4>
              <ul className="divide-y divide-forest/5 border border-forest/10 rounded-sm overflow-hidden bg-white">
                {activeOrder.items.map((item) => (
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
                        <h4 className="text-xs font-semibold text-forest leading-tight truncate max-w-[150px] sm:max-w-[250px]">
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

            {/* FINANCIAL SUMMARY */}
            <div className="border-t border-wood-light/10 pt-6">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-charcoal/40 mb-3">
                Financial Audit Breakdown
              </h4>
              <div className="p-5 border border-wood-light/15 bg-white rounded-sm space-y-3 shadow-inner">
                <div className="flex justify-between items-center text-xs font-body">
                  <span className="text-charcoal/60">Subtotal</span>
                  <span className="font-mono text-charcoal">₹{activeOrder.subtotal}</span>
                </div>

                {activeOrder.discount > 0 && (
                  <div className="flex justify-between items-center text-xs text-forest font-semibold font-body">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Promo Discount ({activeOrder.couponCode})
                    </span>
                    <span className="font-mono">-₹{activeOrder.discount}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs font-body">
                  <span>Delivery Fee</span>
                  <span className="font-mono">
                    {activeOrder.shippingFee === 0 ? (
                      <span className="text-forest font-semibold uppercase text-[10px]">Free</span>
                    ) : (
                      `₹${activeOrder.shippingFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-charcoal/40 pb-2 border-b border-forest/5 font-body">
                  <span>Included Tax (5% GST)</span>
                  <span className="font-mono">₹{activeOrder.tax}</span>
                </div>

                <div className="flex justify-between items-center pt-2 font-body">
                  <span className="text-xs font-semibold text-forest uppercase">Grand Total Ledger Amount</span>
                  <span className="font-heading text-lg text-forest font-semibold font-mono">₹{activeOrder.grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Timeline Notes */}
            {activeOrder.notes && (
              <div className="bg-amber-500/[0.02] border border-amber-500/15 p-4 rounded-sm">
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-semibold mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Customer Order Note
                </h4>
                <p className="text-xs text-charcoal/70 leading-relaxed font-body italic">
                  "{activeOrder.notes}"
                </p>
              </div>
            )}

          </div>
        ) : (
          <div className="bg-white border border-wood-light/20 py-24 text-center rounded-md">
            <Clock className="w-10 h-10 text-stone/20 mx-auto mb-4 stroke-1" />
            <h3 className="heading-xs text-charcoal font-medium mb-1">Select an Order</h3>
            <p className="text-xs text-charcoal/50 max-w-xs mx-auto leading-relaxed font-body">
              Choose an order from the master list on the left to inspect detailed receipts, dispatch logs, and to update delivery status.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
