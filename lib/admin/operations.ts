import { prisma } from "@/lib/prisma"
import { OrderStatus, ProductStatus } from "@prisma/client"

// ==========================================
// MODULE 10 — AUDIT LOGS
// ==========================================
export interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  notes: string
  userId: string
  userName: string
  oldValue: any
  newValue: any
  createdAt: Date
}

const auditLogs: AuditLog[] = []

export async function logAudit(
  action: string,
  entityType: string,
  entityId: string,
  notes: string,
  userId?: string,
  userName?: string,
  oldValue?: any,
  newValue?: any
) {
  try {
    const log: AuditLog = {
      id: `audit-${Math.random().toString(36).substr(2, 9)}`,
      action,
      entityType,
      entityId,
      notes,
      userId: userId || "system",
      userName: userName || "System Engine",
      oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
      newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
      createdAt: new Date(),
    }
    auditLogs.unshift(log)
    return log
  } catch (err) {
    console.error("Audit log failed:", err)
  }
}

export function getAuditLogs() {
  return auditLogs
}

// ==========================================
// MODULE 7 — EMAILS & NOTIFICATIONS LOG
// ==========================================
export interface AppNotification {
  id: string
  recipient: string
  type: string
  subject: string
  body: string
  isSystemAlert: boolean
  createdAt: Date
}

// Simulated notification store / logs
const notificationLogs: AppNotification[] = []

export async function sendAppNotification(
  recipient: string,
  type: string,
  subject: string,
  body: string,
  isSystemAlert: boolean = false
) {
  const notification: AppNotification = {
    id: `notif-${Math.random().toString(36).substr(2, 9)}`,
    recipient,
    type,
    subject,
    body,
    isSystemAlert,
    createdAt: new Date(),
  }
  notificationLogs.unshift(notification)
  console.log(`[NOTIFICATION SENT] To: ${recipient} | Subject: ${subject}`)
  
  // Also log under audit log for system visibility
  await logAudit(
    isSystemAlert ? "system_alert" : "customer_notification",
    "notification",
    notification.id,
    `Notification sent to ${recipient}: ${subject}`
  )

  return notification
}

export function getNotificationLogs() {
  return notificationLogs
}

// ==========================================
// MODULE 1 — INVENTORY MANAGEMENT
// ==========================================
export async function getInventoryData() {
  // Fetch products with their active order item reservations
  const products = await prisma.product.findMany({
    include: {
      stockAdjustments: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      orderItems: {
        include: {
          order: true,
        },
      },
    },
    orderBy: { displayOrder: "asc" },
  })

  // Calculate reserved stock
  // Reserved stock are items in orders that are processing, confirmed, picking, packing, ready to dispatch
  const reservedStatuses: string[] = ["processing", "pending", "confirmed", "picking", "packing", "ready_to_dispatch"]

  const inventory = products.map((product) => {
    let reserved = 0
    product.orderItems.forEach((item) => {
      if (item.order && reservedStatuses.includes(item.order.status)) {
        reserved += item.quantity
      }
    })

    const available = Math.max(0, product.stock - reserved)
    const isLow = available <= product.lowStockThreshold
    const isOut = available === 0

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      currentStock: product.stock,
      reservedStock: reserved,
      availableStock: available,
      lowStockThreshold: product.lowStockThreshold,
      isLow,
      isOut,
      sellingPrice: product.sellingPrice,
      mrp: product.mrp,
      status: product.status,
      adjustments: product.stockAdjustments,
    }
  })

  return inventory
}

export async function adjustStock(
  productId: string,
  quantity: number, // positive to add, negative to deduct
  type: string, // "restock", "audit_adjustment", "damage", "returned"
  notes: string,
  adminId: string,
  adminName: string
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) throw new Error("Product not found")

  const oldStock = product.stock
  const newStock = Math.max(0, oldStock + quantity)

  const updatedProduct = await prisma.$transaction(async (tx) => {
    // 1. Update product stock
    const p = await tx.product.update({
      where: { id: productId },
      data: { stock: newStock },
    })

    // 2. Create StockAdjustment
    await tx.stockAdjustment.create({
      data: {
        productId,
        quantity,
        type,
        notes,
        adjustedBy: adminName,
      },
    })

    return p
  })

  // Log in AuditLog
  await logAudit(
    "inventory_change",
    "product",
    productId,
    `Stock adjusted by ${quantity} (${type}). Notes: ${notes}`,
    adminId,
    adminName,
    { stock: oldStock },
    { stock: newStock }
  )

  // Low stock alerts trigger
  const reservedStatuses = ["processing", "pending", "confirmed", "picking", "packing", "ready_to_dispatch"]
  const reservations = await prisma.orderItem.aggregate({
    where: {
      productId,
      order: {
        status: { in: reservedStatuses as OrderStatus[] },
      },
    },
    _sum: {
      quantity: true,
    },
  })
  const reserved = reservations._sum.quantity || 0
  const available = Math.max(0, newStock - reserved)

  if (available <= product.lowStockThreshold) {
    await sendAppNotification(
      "admin@palumdhara.com",
      "low_stock",
      `Low Stock Alert: ${product.name}`,
      `Product ${product.name} (SKU: ${product.sku}) is running low. Available stock: ${available} (Threshold: ${product.lowStockThreshold}).`,
      true
    )
  }

  return updatedProduct
}

export async function bulkAdjustStock(
  updates: Array<{ productId: string; quantity: number; notes: string }>,
  adminId: string,
  adminName: string
) {
  const results = []
  for (const update of updates) {
    if (update.quantity === 0) continue
    const res = await adjustStock(
      update.productId,
      update.quantity,
      "restock",
      update.notes || "Bulk Stock Update",
      adminId,
      adminName
    )
    results.push(res)
  }
  return results
}

// ==========================================
// MODULE 3 — WAREHOUSE TOOLS
// ==========================================
export async function getWarehouseData() {
  // Orders with statuses confirmed, picking, packing, ready to dispatch, dispatched
  const activeOrders = await prisma.order.findMany({
    where: {
      status: {
        in: ["confirmed", "picking", "packing", "ready_to_dispatch", "dispatched"] as OrderStatus[],
      },
    },
    include: {
      items: true,
    },
    orderBy: { createdAt: "asc" },
  })

  // Pick List: Consolidated products needed to fulfill "confirmed" or "picking" orders
  const pickListMap: Record<string, { name: string; sku: string; quantity: number; image: string; weight: string }> = {}
  activeOrders
    .filter((o) => ["confirmed", "picking"].includes(o.status))
    .forEach((order) => {
      order.items.forEach((item) => {
        if (!item.productId) return
        if (pickListMap[item.productId]) {
          pickListMap[item.productId].quantity += item.quantity
        } else {
          pickListMap[item.productId] = {
            name: item.productName,
            sku: item.productSku,
            quantity: item.quantity,
            image: item.image,
            weight: item.weight,
          }
        }
      })
    })

  const pickList = Object.values(pickListMap)

  // Packing List: Detailed packing specs per order for "packing" orders
  const packingList = activeOrders.filter((o) => o.status === "packing")

  // Dispatch Queue: Orders in "ready_to_dispatch"
  const dispatchQueue = activeOrders.filter((o) => o.status === "ready_to_dispatch")

  // Shipping Manifest: Dispatched orders
  const shippingManifest = activeOrders.filter((o) => o.status === "dispatched")

  // Product Summary
  const inventory = await getInventoryData()

  return {
    pickList,
    packingList,
    dispatchQueue,
    shippingManifest,
    inventorySummary: inventory,
  }
}

export async function generateDailyDispatchReport() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dispatchedToday = await prisma.order.findMany({
    where: {
      status: "dispatched",
      updatedAt: { gte: today },
    },
    include: {
      items: true,
    },
  })

  const deliveredToday = await prisma.order.findMany({
    where: {
      status: "delivered",
      updatedAt: { gte: today },
    },
    include: {
      items: true,
    },
  })

  const totalDispatchedValue = dispatchedToday.reduce((sum, o) => sum + o.grandTotal, 0)
  const totalDeliveredValue = deliveredToday.reduce((sum, o) => sum + o.grandTotal, 0)

  return {
    date: today,
    dispatchedCount: dispatchedToday.length,
    dispatchedValue: totalDispatchedValue,
    deliveredCount: deliveredToday.length,
    deliveredValue: totalDeliveredValue,
    dispatchedOrders: dispatchedToday,
    deliveredOrders: deliveredToday,
  }
}

// ==========================================
// MODULE 4 — PANTRY OPERATIONS
// ==========================================
export async function getPantryOpsData() {
  // Fetch active pantries and memberships
  const activePantries = await prisma.pantry.findMany({
    where: { status: "active" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: true,
      shippingAddress: true,
    },
  })

  // 5th Dispatch (early_month) and 20th Dispatch (late_month) dispatches
  const earlyMonthDispatches = activePantries.filter((p) => p.deliveryWindow === "early_month")
  const lateMonthDispatches = activePantries.filter((p) => p.deliveryWindow === "late_month")

  // Consolidated Product requirements for upcoming early month dispatches
  const earlyProductMap: Record<string, { name: string; sku: string; quantity: number }> = {}
  earlyMonthDispatches.forEach((pantry) => {
    pantry.items.forEach((item) => {
      if (earlyProductMap[item.productId]) {
        earlyProductMap[item.productId].quantity += item.quantity
      } else {
        earlyProductMap[item.productId] = {
          name: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
        }
      }
    })
  })

  // Consolidated Product requirements for upcoming late month dispatches
  const lateProductMap: Record<string, { name: string; sku: string; quantity: number }> = {}
  lateMonthDispatches.forEach((pantry) => {
    pantry.items.forEach((item) => {
      if (lateProductMap[item.productId]) {
        lateProductMap[item.productId].quantity += item.quantity
      } else {
        lateProductMap[item.productId] = {
          name: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
        }
      }
    })
  })

  return {
    membershipCount: activePantries.length,
    earlyCount: earlyMonthDispatches.length,
    lateCount: lateMonthDispatches.length,
    earlyDispatchProducts: Object.values(earlyProductMap),
    lateDispatchProducts: Object.values(lateProductMap),
    earlyPantries: earlyMonthDispatches,
    latePantries: lateMonthDispatches,
  }
}

// ==========================================
// MODULE 5 — SHIPPING ENGINE
// ==========================================
export async function getShippingRules() {
  return await prisma.shippingRule.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function createOrUpdateShippingRule(data: {
  id?: string
  name: string
  type: string
  minOrderValue: number
  fee: number
  zoneName?: string
  states: string[]
  weightLimit?: number
  active: boolean
}) {
  const payload = {
    name: data.name,
    type: data.type,
    minOrderValue: data.minOrderValue,
    fee: data.fee,
    zoneName: data.zoneName || null,
    states: data.states,
    weightLimit: data.weightLimit || null,
    active: data.active,
  }

  let rule
  if (data.id) {
    rule = await prisma.shippingRule.update({
      where: { id: data.id },
      data: payload,
    })
    await logAudit("shipping_rule_update", "shipping_rule", rule.id, `Shipping rule ${rule.name} updated.`)
  } else {
    rule = await prisma.shippingRule.create({
      data: payload,
    })
    await logAudit("shipping_rule_create", "shipping_rule", rule.id, `Shipping rule ${rule.name} created.`)
  }

  return rule
}

export async function deleteShippingRule(id: string) {
  const rule = await prisma.shippingRule.delete({
    where: { id },
  })
  await logAudit("shipping_rule_delete", "shipping_rule", id, `Shipping rule ${rule.name} deleted.`)
  return rule
}

export async function calculateShipping(cartSubtotal: number, shippingState: string, totalWeightGrams: number = 0) {
  const activeRules = await prisma.shippingRule.findMany({
    where: { active: true },
  })

  // 1. Check free shipping rule
  const freeRule = activeRules.find((r) => r.type === "free" && cartSubtotal >= r.minOrderValue)
  if (freeRule) {
    return {
      fee: 0,
      ruleName: freeRule.name,
      estimatedDeliveryDays: "3-5 Business Days",
    }
  }

  // 2. Check zone based rules
  const zoneRule = activeRules.find((r) => r.type === "zone" && r.states.includes(shippingState))
  if (zoneRule) {
    return {
      fee: zoneRule.fee,
      ruleName: zoneRule.name,
      estimatedDeliveryDays: "4-6 Business Days",
    }
  }

  // 3. Check weight based rules
  const weightRule = activeRules.find(
    (r) => r.type === "weight" && r.weightLimit && totalWeightGrams > r.weightLimit
  )
  if (weightRule) {
    return {
      fee: weightRule.fee,
      ruleName: weightRule.name,
      estimatedDeliveryDays: "5-7 Business Days",
    }
  }

  // 4. Default flat shipping rule
  const flatRule = activeRules.find((r) => r.type === "flat")
  const fee = flatRule ? flatRule.fee : 100 // default 100 INR if no rule configured

  return {
    fee,
    ruleName: flatRule ? flatRule.name : "Standard Flat Rate",
    estimatedDeliveryDays: "3-5 Business Days",
  }
}

// ==========================================
// MODULE 6 — GST & INVOICES
// ==========================================
export async function getInvoices() {
  return await prisma.invoice.findMany({
    include: {
      order: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function generateInvoiceForOrder(orderId: string, type: "order" | "pantry" = "order") {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) throw new Error("Order not found")

  // Check if invoice already exists
  const existing = await prisma.invoice.findUnique({
    where: { orderId },
  })
  if (existing) return existing

  // Generate unique invoice number
  const prefix = type === "pantry" ? "PD-PANTRY" : "PD-COMM"
  const dateStr = new Date().getFullYear()
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  const invoiceNumber = `${prefix}-${dateStr}-${randomNum}`

  // Calculate GST breakdowns
  // We look up state to see if it is Uttarakhand (Intrastate -> CGST + SGST) or interstate (IGST)
  // Let's assume shipper origin state is "Uttarakhand"
  let shippingAddress: any = {}
  try {
    shippingAddress = typeof order.shippingAddress === "string" 
      ? JSON.parse(order.shippingAddress) 
      : order.shippingAddress
  } catch (e) {
    shippingAddress = order.shippingAddress || {}
  }
  const isIntrastate = (shippingAddress.state || "").toLowerCase().includes("uttarakhand")

  let totalTax = 0
  const breakdown: Record<string, number> = {
    CGST_2_5: 0,
    SGST_2_5: 0,
    CGST_6: 0,
    SGST_6: 0,
    CGST_9: 0,
    SGST_9: 0,
    IGST_5: 0,
    IGST_12: 0,
    IGST_18: 0,
  }

  // Fetch product items to calculate taxes accurately
  for (const item of order.items) {
    let gstRate = 5 // default 5% GST if not found
    let inclusive = true

    if (item.productId) {
      const prod = await prisma.product.findUnique({
        where: { id: item.productId },
      })
      if (prod) {
        gstRate = Number(prod.gstRate) || 5
        inclusive = prod.taxInclusive
      }
    }

    const itemTotal = item.price * item.quantity
    let itemTax = 0

    if (inclusive) {
      itemTax = Math.round(itemTotal * (gstRate / (100 + gstRate)))
    } else {
      itemTax = Math.round(itemTotal * (gstRate / 100))
    }

    totalTax += itemTax

    if (isIntrastate) {
      const halfTax = Math.round(itemTax / 2)
      const halfRate = gstRate / 2
      const keySuffix = halfRate.toString().replace(".", "_")
      breakdown[`CGST_${keySuffix}`] = (breakdown[`CGST_${keySuffix}`] || 0) + halfTax
      breakdown[`SGST_${keySuffix}`] = (breakdown[`SGST_${keySuffix}`] || 0) + (itemTax - halfTax)
    } else {
      const keySuffix = gstRate.toString().replace(".", "_")
      breakdown[`IGST_${keySuffix}`] = (breakdown[`IGST_${keySuffix}`] || 0) + itemTax
    }
  }

  // Save Invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      orderId,
      type,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      discount: order.discount,
      tax: totalTax,
      taxBreakdown: breakdown,
      grandTotal: order.grandTotal,
    },
  })

  await logAudit("invoice_generate", "invoice", invoice.id, `GST Invoice ${invoiceNumber} generated for Order ${order.orderNumber}.`)

  return invoice
}

// ==========================================
// MODULE 8 — ADMIN ANALYTICS
// ==========================================
export async function getAnalyticsData() {
  const orders = await prisma.order.findMany({
    include: { items: true },
  })

  const pantries = await prisma.pantry.findMany({
    where: { status: "active" },
  })

  const products = await prisma.product.findMany()

  // High-performance metrics
  const totalOrders = orders.length
  const completedOrders = orders.filter((o) => o.status === "delivered")
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.grandTotal, 0)
  
  // Monthly Revenue (last 30 days completed)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const monthlyRevenue = orders
    .filter((o) => o.status === "delivered" && o.createdAt >= thirtyDaysAgo)
    .reduce((sum, o) => sum + o.grandTotal, 0)

  // Recurring Revenue
  // Each active pantry earns standard subscription amounts.
  // Average pantry cart value is calculated or assumed to be ~1800 INR per active pantry dispatch
  const recurringRevenue = pantries.length * 1800

  // Pantry growth (active pantries)
  const pantryGrowth = pantries.length

  // Average Order Value
  const aov = totalOrders > 0 ? Math.round(orders.reduce((sum, o) => sum + o.grandTotal, 0) / totalOrders) : 0

  // Lifetime Value (Average spend per customer)
  const uniqueCustomers = new Set(orders.map((o) => o.customerEmail)).size
  const ltv = uniqueCustomers > 0 ? Math.round(totalRevenue / uniqueCustomers) : 0

  // Best Sellers
  const productSales: Record<string, { name: string; sku: string; count: number; revenue: number }> = {}
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!item.productId) return
      if (productSales[item.productId]) {
        productSales[item.productId].count += item.quantity
        productSales[item.productId].revenue += item.price * item.quantity
      } else {
        productSales[item.productId] = {
          name: item.productName,
          sku: item.productSku,
          count: item.quantity,
          revenue: item.price * item.quantity,
        }
      }
    })
  })

  const bestSellers = Object.values(productSales)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Inventory Value
  const inventoryValue = products.reduce((sum, p) => sum + p.stock * p.sellingPrice, 0)

  // Low Stock products count
  const lowStockProductsCount = products.filter((p) => p.stock <= p.lowStockThreshold).length

  return {
    revenue: totalRevenue,
    monthlyRevenue,
    recurringRevenue,
    ordersCount: totalOrders,
    pantryGrowth,
    aov,
    ltv,
    bestSellers,
    customerGrowth: uniqueCustomers,
    inventoryValue,
    lowStockProductsCount,
    upcomingDispatchCount: pantries.length,
  }
}

// ==========================================
// MODULE 9 — REPORTING / EXPORTS
// ==========================================
export async function getExportData(type: "revenue" | "orders" | "customers" | "inventory" | "pantry") {
  if (type === "orders") {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    })
    return orders.map((o) => ({
      "Order Number": o.orderNumber,
      "Customer Name": o.customerName,
      "Customer Email": o.customerEmail,
      "Customer Phone": o.customerPhone || "N/A",
      "Status": o.status,
      "Subtotal": o.subtotal,
      "Shipping Fee": o.shippingFee,
      "Discount": o.discount,
      "Tax": o.tax,
      "Grand Total": o.grandTotal,
      "Coupon Code": o.couponCode || "N/A",
      "Created At": o.createdAt.toLocaleString(),
    }))
  }

  if (type === "inventory") {
    const inventory = await getInventoryData()
    return inventory.map((i) => ({
      "Product Name": i.name,
      "SKU": i.sku,
      "Current Stock": i.currentStock,
      "Reserved Stock": i.reservedStock,
      "Available Stock": i.availableStock,
      "Threshold": i.lowStockThreshold,
      "Low Stock Alert": i.isLow ? "YES" : "NO",
      "Selling Price": i.sellingPrice,
      "MRP": i.mrp,
      "Status": i.status,
    }))
  }

  if (type === "customers") {
    const customers = await prisma.user.findMany({
      include: {
        orders: true,
        pantries: true,
      },
    })
    return customers.map((c) => {
      const customerSpend = c.orders.filter(o => o.status === "delivered").reduce((sum, o) => sum + o.grandTotal, 0)
      return {
        "Full Name": c.fullName,
        "Email": c.email,
        "Phone": c.phone || "N/A",
        "Role": c.role,
        "Total Orders": c.orders.length,
        "Active Pantries": c.pantries.filter(p => p.status === "active").length,
        "Total Spend (INR)": customerSpend,
        "Joined Date": c.createdAt.toLocaleString(),
      }
    })
  }

  if (type === "pantry") {
    const pantries = await prisma.pantry.findMany({
      include: {
        user: true,
        items: {
          include: { product: true }
        }
      }
    })
    return pantries.map((p) => ({
      "Pantry Name": p.name,
      "Customer Email": p.user.email,
      "Status": p.status,
      "Dispatch Window": p.deliveryWindow === "early_month" ? "5th (Early Month)" : "20th (Late Month)",
      "Frequency": p.frequency,
      "Membership Tier": p.tier,
      "Savings %": p.savingPercent,
      "Unique Products": p.items.length,
      "Total Quantity": p.items.reduce((sum, item) => sum + item.quantity, 0),
      "Created At": p.createdAt.toLocaleString(),
    }))
  }

  // Default / Revenue Report
  const completedOrders = await prisma.order.findMany({
    where: { status: "delivered" },
    orderBy: { createdAt: "desc" },
  })
  return completedOrders.map((o) => ({
    "Date": o.createdAt.toLocaleDateString(),
    "Order ID": o.orderNumber,
    "Invoice ID": o.id,
    "Gross Subtotal": o.subtotal,
    "Discount": o.discount,
    "GST Amount": o.tax,
    "Shipping Revenue": o.shippingFee,
    "Net Total Paid": o.grandTotal,
  }))
}
