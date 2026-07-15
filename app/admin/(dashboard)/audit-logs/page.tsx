"use client"

import { useState, useEffect } from "react"
import { getAuditLogsAction, getNotificationLogsAction } from "../operations-actions"
import { 
  History, 
  Search, 
  Filter, 
  User, 
  Clock, 
  ArrowRight, 
  Loader2, 
  RefreshCw, 
  MailOpen,
  Info
} from "lucide-react"

export default function AdminAuditLogsPage() {
  const [activeTab, setActiveTab] = useState<"audits" | "notifications">("audits")
  const [logs, setLogs] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedLog, setSelectedLog] = useState<any | null>(null)
  const [actionFilter, setActionFilter] = useState("all")

  const loadData = async () => {
    setLoading(true)
    const auditsRes = await getAuditLogsAction()
    const notifsRes = await getNotificationLogsAction()

    if (auditsRes.success && auditsRes.data) {
      setLogs(auditsRes.data)
    }
    if (notifsRes.success && notifsRes.data) {
      setNotifications(notifsRes.data)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filters
  const filteredAudits = logs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.userName && log.userName.toLowerCase().includes(search.toLowerCase())) ||
      (log.notes && log.notes.toLowerCase().includes(search.toLowerCase()))

    if (!matchesSearch) return false
    if (actionFilter !== "all" && log.action !== actionFilter) return false
    return true
  })

  return (
    <div className="space-y-6" id="admin-audit-logs-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-wood-light/10">
        <div>
          <h1 className="heading-sm text-charcoal font-semibold flex items-center gap-2">
            <History className="text-forest" size={24} />
            Operations Audit & Notifications
          </h1>
          <p className="text-xs text-charcoal/50 font-body mt-0.5">
            Trace back all security changes, inventory adjustments, order updates, and inspect recently dispatched mailers.
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
            Refresh Logs
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-charcoal/10 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("audits")}
          className={`px-5 py-3 text-xs font-heading font-medium tracking-wider uppercase border-b-2 transition-all ${
            activeTab === "audits" 
              ? "border-forest text-forest font-semibold" 
              : "border-transparent text-charcoal/50 hover:text-charcoal"
          }`}
        >
          📜 Operation Audit Logs ({logs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`px-5 py-3 text-xs font-heading font-medium tracking-wider uppercase border-b-2 transition-all ${
            activeTab === "notifications" 
              ? "border-forest text-forest font-semibold" 
              : "border-transparent text-charcoal/50 hover:text-charcoal"
          }`}
        >
          ✉️ Dispatched Mail Log ({notifications.length})
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-charcoal/10 rounded-sm">
          <Loader2 className="animate-spin text-forest mb-2" size={32} />
          <p className="text-xs text-charcoal/50 font-body">Reading operations history...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: AUDIT LOGS */}
          {activeTab === "audits" && (
            <div className="space-y-4">
              
              {/* Search & Filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center bg-white p-3 rounded-sm border border-charcoal/10">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-charcoal/40" size={16} />
                  <input
                    type="text"
                    placeholder="Search logs by keyword, actor, or details..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white rounded-sm border border-charcoal/15 pl-9 pr-3 py-2 text-xs font-body focus:outline-none focus:border-forest"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-charcoal/40" />
                  <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="bg-white rounded-sm border border-charcoal/15 p-2 text-xs font-body focus:outline-none"
                  >
                    <option value="all">All Action Types</option>
                    <option value="inventory_change">📦 Inventory Changes</option>
                    <option value="order_change">📋 Order Changes</option>
                    <option value="shipping_rule_create">🚛 Shipping Config</option>
                    <option value="invoice_generate">🧾 Invoice Logs</option>
                    <option value="pantry_change">🔁 Pantry Membership Changes</option>
                  </select>
                </div>
              </div>

              {filteredAudits.length === 0 ? (
                <div className="text-center py-16 bg-white border border-charcoal/10 rounded-sm">
                  <History className="mx-auto text-charcoal/20 mb-3" size={48} />
                  <h3 className="text-sm font-semibold text-charcoal font-heading">No Audit Logs Loaded</h3>
                  <p className="text-xs text-charcoal/50 font-body mt-1">Make adjustments or update orders to see live logs.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Logs List Table */}
                  <div className="lg:col-span-2 overflow-x-auto border border-charcoal/10 rounded-sm bg-white shadow-sm max-h-[500px]">
                    <table className="w-full text-left border-collapse text-xs font-body">
                      <thead>
                        <tr className="bg-ivory/10 border-b border-charcoal/10 text-[10px] font-heading text-charcoal/50 uppercase tracking-wider sticky top-0 bg-white z-10">
                          <th className="p-3">Logged action</th>
                          <th className="p-3">Actor / Admin</th>
                          <th className="p-3">Details</th>
                          <th className="p-3 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-charcoal/10">
                        {filteredAudits.map((log) => (
                          <tr 
                            key={log.id} 
                            onClick={() => setSelectedLog(log)}
                            className={`hover:bg-ivory/10 cursor-pointer transition-colors ${
                              selectedLog?.id === log.id ? "bg-forest/5 font-semibold" : ""
                            }`}
                          >
                            <td className="p-3">
                              <span className={`text-[10px] uppercase font-bold rounded-sm px-1.5 py-0.5 border ${
                                log.action.includes("inventory") 
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : log.action.includes("invoice")
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-blue-50 text-blue-800 border-blue-200"
                              }`}>
                                {log.action.replace(/_/g, " ")}
                              </span>
                              <p className="text-[10px] text-charcoal/40 font-mono mt-1">ID: {log.entityType} ({log.entityId.substr(0,6)})</p>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <User size={12} className="text-charcoal/40" />
                                <span>{log.userName || "System"}</span>
                              </div>
                            </td>
                            <td className="p-3 text-charcoal/70 max-w-[200px] truncate">{log.notes}</td>
                            <td className="p-3 text-right text-[10px] text-charcoal/40">
                              {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Log Detail Pane */}
                  <div className="bg-white border border-charcoal/10 rounded-sm p-5 space-y-4 shadow-sm h-fit">
                    <h3 className="text-xs font-bold font-heading text-charcoal uppercase tracking-wider">Log State Inspection</h3>
                    {selectedLog ? (
                      <div className="space-y-4 text-xs font-body">
                        <div className="space-y-1">
                          <p className="text-[10px] text-charcoal/40 font-bold uppercase">Log ID</p>
                          <p className="font-mono text-charcoal/70 font-semibold">{selectedLog.id}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-charcoal/40 font-bold uppercase">Action Message</p>
                          <p className="font-medium text-charcoal bg-ivory/15 p-2 rounded-sm border border-charcoal/5 leading-relaxed">{selectedLog.notes}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-charcoal/50">
                          <div>
                            <p className="font-bold uppercase">Entity Type</p>
                            <p className="text-charcoal font-semibold mt-0.5">{selectedLog.entityType}</p>
                          </div>
                          <div>
                            <p className="font-bold uppercase">Entity ID</p>
                            <p className="font-mono text-charcoal font-semibold mt-0.5 truncate">{selectedLog.entityId}</p>
                          </div>
                        </div>

                        {/* State Transitions details */}
                        {(selectedLog.oldValue || selectedLog.newValue) && (
                          <div className="space-y-2 pt-2 border-t border-charcoal/10">
                            <p className="text-[10px] text-charcoal/40 font-bold uppercase">Value Transition</p>
                            <div className="grid grid-cols-2 gap-3 p-2 bg-ivory/20 rounded-sm border border-charcoal/5">
                              <div>
                                <p className="text-[9px] text-charcoal/40 uppercase">Old Value</p>
                                <pre className="font-mono text-[10px] text-rose-700 font-bold mt-1 max-w-full overflow-x-auto">
                                  {JSON.stringify(selectedLog.oldValue, null, 2)}
                                </pre>
                              </div>
                              <div className="border-l border-charcoal/10 pl-3">
                                <p className="text-[9px] text-charcoal/40 uppercase">New Value</p>
                                <pre className="font-mono text-[10px] text-emerald-700 font-bold mt-1 max-w-full overflow-x-auto">
                                  {JSON.stringify(selectedLog.newValue, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-[10px] text-charcoal/45 pt-2 border-t border-charcoal/10">
                          <Clock size={12} />
                          <span>Logged: {new Date(selectedLog.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-charcoal/40">
                        <Info className="mx-auto mb-2 text-charcoal/20" size={24} />
                        <p className="text-xs">Click on any row in the log table to inspect detailed database transitions.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* TAB 2: MAIL LOGS */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div className="bg-white border border-charcoal/10 rounded-sm p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-charcoal font-heading">Sent Notifications & Mail Log</h3>
                <p className="text-xs text-charcoal/50 font-body mt-0.5">
                  Audit dispatched low-stock mailers, customer order emails, and automated subscription status reports.
                </p>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-16 bg-white border border-charcoal/10 rounded-sm">
                  <MailOpen className="mx-auto text-charcoal/20 mb-3" size={48} />
                  <h3 className="text-sm font-semibold text-charcoal font-heading">Notification Log is Empty</h3>
                  <p className="text-xs text-charcoal/50 font-body mt-1">Notifications dispatched during this browser session will show here.</p>
                </div>
              ) : (
                <div className="space-y-4 max-w-3xl">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="bg-white border border-charcoal/10 rounded-sm p-4 space-y-2 shadow-sm">
                      <div className="flex justify-between items-start pb-1.5 border-b border-charcoal/5">
                        <div>
                          <span className={`text-[9px] uppercase font-bold rounded-sm px-1.5 py-0.5 border ${
                            notif.isSystemAlert 
                              ? "bg-rose-50 text-rose-800 border-rose-200" 
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          }`}>
                            {notif.type}
                          </span>
                          <h4 className="text-xs font-bold text-charcoal font-heading mt-1">{notif.subject}</h4>
                        </div>
                        <span className="text-[10px] text-charcoal/40 font-body">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-xs text-charcoal/70 font-body leading-relaxed">
                        <p className="font-semibold text-charcoal/50 mb-1">To: {notif.recipient}</p>
                        <p className="bg-ivory/10 p-2.5 rounded-sm border border-charcoal/5 whitespace-pre-wrap">{notif.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
