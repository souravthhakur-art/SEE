"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"

export async function updateOrderStatus(orderId: string, status: string, notes?: string | null) {
  if (!orderId || !status) {
    return { success: false, error: "Missing required parameters." }
  }

  let dbStatus = status
  if (status === "ready_to_dispatch") {
    dbStatus = "packed"
  } else if (status === "dispatched") {
    dbStatus = "shipped"
  }

  const orderStatus = dbStatus as OrderStatus

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: orderStatus },
      })

      // 2. Add history timeline log
      await tx.orderHistory.create({
        data: {
          orderId,
          status: orderStatus,
          notes: notes || `Order status updated to ${status}.`,
          changedBy: "Admin Merchant",
        },
      })

      // 3. Add administrative notes log
      await tx.orderNotes.create({
        data: {
          orderId,
          note: `Status set to ${status.toUpperCase()} by Merchant. Note: "${notes || "No additional comments"}"`,
        },
      })
    })

    revalidatePath("/admin/orders")
    revalidatePath("/account")
    return { success: true }
  } catch (error) {
    console.error("Failed to update order status:", error)
    return { success: false, error: "Failed to update order status. Please try again." }
  }
}
