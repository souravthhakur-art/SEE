"use server"

import { revalidatePath } from "next/cache"
import { getCurrentSession } from "@/lib/session"
import { ADMIN_ROLE } from "@/lib/auth-roles"
import * as ops from "@/lib/admin/operations"
import { prisma } from "@/lib/prisma"

// Auth guard helper for server actions
async function requireAdmin() {
  const session = await getCurrentSession()
  if (!session || session.user.role !== ADMIN_ROLE) {
    throw new Error("Unauthorized: Admin privileges required")
  }
  return session
}

export async function getInventoryDataAction() {
  await requireAdmin()
  try {
    const data = await ops.getInventoryData()
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch inventory data" }
  }
}

export async function adjustStockAction(productId: string, quantity: number, type: string, notes: string) {
  const session = await requireAdmin()
  try {
    const data = await ops.adjustStock(
      productId,
      quantity,
      type,
      notes,
      session.user.id,
      session.user.name || "Admin"
    )
    revalidatePath("/admin/inventory")
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to adjust stock" }
  }
}

export async function bulkAdjustStockAction(updates: Array<{ productId: string; quantity: number; notes: string }>) {
  const session = await requireAdmin()
  try {
    const data = await ops.bulkAdjustStock(
      updates,
      session.user.id,
      session.user.name || "Admin"
    )
    revalidatePath("/admin/inventory")
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to bulk adjust stock" }
  }
}

export async function getWarehouseDataAction() {
  await requireAdmin()
  try {
    const data = await ops.getWarehouseData()
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch warehouse data" }
  }
}

export async function generateDailyDispatchReportAction() {
  await requireAdmin()
  try {
    const data = await ops.generateDailyDispatchReport()
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to generate report" }
  }
}

export async function getPantryOpsDataAction() {
  await requireAdmin()
  try {
    const data = await ops.getPantryOpsData()
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch pantry operations data" }
  }
}

export async function getShippingRulesAction() {
  await requireAdmin()
  try {
    const data = await ops.getShippingRules()
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch shipping rules" }
  }
}

export async function createOrUpdateShippingRuleAction(data: {
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
  await requireAdmin()
  try {
    const rule = await ops.createOrUpdateShippingRule(data)
    revalidatePath("/admin/shipping")
    return { success: true, data: rule }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save shipping rule" }
  }
}

export async function deleteShippingRuleAction(id: string) {
  await requireAdmin()
  try {
    await ops.deleteShippingRule(id)
    revalidatePath("/admin/shipping")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete shipping rule" }
  }
}

export async function getInvoicesAction() {
  await requireAdmin()
  try {
    const data = await ops.getInvoices()
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch invoices" }
  }
}

export async function generateInvoiceForOrderAction(orderId: string, type: "order" | "pantry" = "order") {
  await requireAdmin()
  try {
    const invoice = await ops.generateInvoiceForOrder(orderId, type)
    revalidatePath("/admin/invoices")
    return { success: true, data: invoice }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to generate invoice" }
  }
}

export async function getAnalyticsDataAction() {
  await requireAdmin()
  try {
    const data = await ops.getAnalyticsData()
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch analytics data" }
  }
}

export async function getExportDataAction(type: "revenue" | "orders" | "customers" | "inventory" | "pantry") {
  await requireAdmin()
  try {
    const data = await ops.getExportData(type)
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to export data" }
  }
}

export async function getAuditLogsAction() {
  await requireAdmin()
  try {
    const logs = ops.getAuditLogs()
    return { success: true, data: logs }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch audit logs" }
  }
}

export async function getNotificationLogsAction() {
  await requireAdmin()
  try {
    const logs = ops.getNotificationLogs()
    return { success: true, data: logs }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch notification logs" }
  }
}
