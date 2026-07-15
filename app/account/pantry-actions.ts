"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/session"
import { products } from "@/lib/data"
import * as fs from "fs"
import * as path from "path"

const MOCK_DB_PATH = "/tmp/pantry_mock_db.json"

// Helper to get mock DB
function getMockDb() {
  try {
    if (fs.existsSync(MOCK_DB_PATH)) {
      const data = fs.readFileSync(MOCK_DB_PATH, "utf8")
      return JSON.parse(data)
    }
  } catch (err) {
    console.error("Failed to read mock DB:", err)
  }
  return { pantries: [] }
}

// Helper to save mock DB
function saveMockDb(data: any) {
  try {
    const dir = path.dirname(MOCK_DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), "utf8")
  } catch (err) {
    console.error("Failed to save mock DB:", err)
  }
}

// Check if Prisma database is accessible
async function isDbConnected(): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL) return false
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

// Get the customer's pantry data
export async function getPantryData() {
  const session = await getCurrentSession()
  if (!session) {
    return { success: false, error: "You must be signed in to view your pantry." }
  }

  const userId = session.user.id

  const dbConnected = await isDbConnected()
  if (dbConnected) {
    try {
      const pantry = await prisma.pantry.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          schedules: {
            orderBy: { scheduledDate: "asc" },
          },
          pauses: {
            orderBy: { createdAt: "desc" },
          },
          deliveries: {
            include: {
              order: true,
            },
            orderBy: { createdAt: "desc" },
          },
          history: {
            orderBy: { createdAt: "desc" },
          },
        },
      })

      if (pantry) {
        return { success: true, pantry }
      }
      return { success: true, pantry: null }
    } catch (err) {
      console.error("Database query failed, falling back to mock DB:", err)
    }
  }

  // Fallback Mock DB
  const db = getMockDb()
  let pantry = db.pantries.find((p: any) => p.userId === userId)

  if (pantry) {
    // Hydrate products
    pantry.items = pantry.items.map((item: any) => {
      const productObj = products.find((p) => p.id === item.productId)
      return {
        ...item,
        product: productObj || {
          id: item.productId,
          name: "Himalayan Standard Tea",
          price: 499,
          weight: "100g",
          image: "/images/tea-black.jpg",
        },
      }
    })
    return { success: true, pantry }
  }

  return { success: true, pantry: null }
}

// Create a new pantry subscription
export async function createPantry(payload: {
  name: string
  deliveryWindow: "early_month" | "late_month"
  frequency: "monthly" | "bi_monthly" | "tri_monthly"
  tier: "monthly" | "three_month" | "six_month"
  savingPercent: number
  shippingAddressId?: string | null
  items: { productId: string; quantity: number }[]
}) {
  const session = await getCurrentSession()
  if (!session) {
    return { success: false, error: "You must be signed in to perform this action." }
  }

  const userId = session.user.id
  const dbConnected = await isDbConnected()

  if (dbConnected) {
    try {
      const pantry = await prisma.$transaction(async (tx) => {
        const newPantry = await tx.pantry.create({
          data: {
            userId,
            name: payload.name,
            status: "active",
            deliveryWindow: payload.deliveryWindow,
            frequency: payload.frequency,
            tier: payload.tier,
            savingPercent: payload.savingPercent,
            shippingAddressId: payload.shippingAddressId || null,
          },
        })

        // Create initial items
        if (payload.items.length > 0) {
          await tx.pantryItem.createMany({
            data: payload.items.map((item) => ({
              pantryId: newPantry.id,
              productId: item.productId,
              quantity: item.quantity,
            })),
          })
        }

        // Generate initial delivery schedules (3 scheduled months)
        const schedulesData = []
        const now = new Date()
        const intervalMonths = payload.frequency === "monthly" ? 1 : payload.frequency === "bi_monthly" ? 2 : 3
        
        for (let i = 1; i <= 3; i++) {
          const scheduledDate = new Date(now.getFullYear(), now.getMonth() + i * intervalMonths, 10)
          schedulesData.push({
            pantryId: newPantry.id,
            scheduledDate,
            status: "pending",
          })
        }

        await tx.pantrySchedule.createMany({
          data: schedulesData,
        })

        // Create history log
        await tx.pantryHistory.create({
          data: {
            pantryId: newPantry.id,
            action: "created",
            notes: `Pantry subscription "${payload.name}" created with ${payload.items.length} items.`,
          },
        })

        return newPantry
      })

      revalidatePath("/account")
      return { success: true, pantryId: pantry.id }
    } catch (err) {
      console.error("Database pantry creation failed, falling back to mock DB:", err)
    }
  }

  // Fallback Mock DB
  const db = getMockDb()
  const newPantryId = "pantry_" + Math.random().toString(36).substr(2, 9)
  
  const schedules = []
  const now = new Date()
  const intervalMonths = payload.frequency === "monthly" ? 1 : payload.frequency === "bi_monthly" ? 2 : 3
  
  for (let i = 1; i <= 3; i++) {
    const scheduledDate = new Date(now.getFullYear(), now.getMonth() + i * intervalMonths, 10)
    schedules.push({
      id: "sched_" + Math.random().toString(36).substr(2, 9),
      pantryId: newPantryId,
      scheduledDate: scheduledDate.toISOString(),
      status: "pending",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })
  }

  const newPantry = {
    id: newPantryId,
    userId,
    name: payload.name,
    status: "active",
    deliveryWindow: payload.deliveryWindow,
    frequency: payload.frequency,
    tier: payload.tier,
    savingPercent: payload.savingPercent,
    shippingAddressId: payload.shippingAddressId || null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    items: payload.items.map((item) => ({
      id: "item_" + Math.random().toString(36).substr(2, 9),
      pantryId: newPantryId,
      productId: item.productId,
      quantity: item.quantity,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })),
    schedules,
    pauses: [],
    deliveries: [],
    history: [
      {
        id: "hist_" + Math.random().toString(36).substr(2, 9),
        pantryId: newPantryId,
        action: "created",
        notes: `Pantry subscription "${payload.name}" created with ${payload.items.length} items.`,
        changedBy: "customer",
        createdAt: now.toISOString(),
      }
    ],
  }

  db.pantries = db.pantries.filter((p: any) => p.userId !== userId) // Keep single pantry per user for demo simplicity
  db.pantries.push(newPantry)
  saveMockDb(db)

  revalidatePath("/account")
  return { success: true, pantryId: newPantryId }
}

// Pause pantry subscription
export async function pausePantry(pantryId: string, reason: string) {
  const session = await getCurrentSession()
  if (!session) return { success: false, error: "Not authorized" }

  const dbConnected = await isDbConnected()
  if (dbConnected) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.pantry.update({
          where: { id: pantryId },
          data: { status: "paused" },
        })

        await tx.pantryPause.create({
          data: {
            pantryId,
            reason,
          },
        })

        await tx.pantryHistory.create({
          data: {
            pantryId,
            action: "paused",
            notes: `Pantry subscription paused. Reason: ${reason}`,
          },
        })
      })

      revalidatePath("/account")
      return { success: true }
    } catch (err) {
      console.error("Database pause transaction failed, falling back to mock:", err)
    }
  }

  // Mock Fallback
  const db = getMockDb()
  const pantry = db.pantries.find((p: any) => p.id === pantryId)
  if (pantry) {
    pantry.status = "paused"
    pantry.pauses.unshift({
      id: "pause_" + Math.random().toString(36).substr(2, 9),
      pantryId,
      pausedAt: new Date().toISOString(),
      resumedAt: null,
      reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    pantry.history.unshift({
      id: "hist_" + Math.random().toString(36).substr(2, 9),
      pantryId,
      action: "paused",
      notes: `Pantry subscription paused. Reason: ${reason}`,
      changedBy: "customer",
      createdAt: new Date().toISOString(),
    })
    saveMockDb(db)
  }

  revalidatePath("/account")
  return { success: true }
}

// Resume pantry subscription
export async function resumePantry(pantryId: string) {
  const session = await getCurrentSession()
  if (!session) return { success: false, error: "Not authorized" }

  const dbConnected = await isDbConnected()
  if (dbConnected) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.pantry.update({
          where: { id: pantryId },
          data: { status: "active" },
        })

        const activePause = await tx.pantryPause.findFirst({
          where: { pantryId, resumedAt: null },
          orderBy: { createdAt: "desc" },
        })

        if (activePause) {
          await tx.pantryPause.update({
            where: { id: activePause.id },
            data: { resumedAt: new Date() },
          })
        }

        await tx.pantryHistory.create({
          data: {
            pantryId,
            action: "resumed",
            notes: "Pantry subscription resumed.",
          },
        })
      })

      revalidatePath("/account")
      return { success: true }
    } catch (err) {
      console.error("Database resume transaction failed, falling back to mock:", err)
    }
  }

  // Mock Fallback
  const db = getMockDb()
  const pantry = db.pantries.find((p: any) => p.id === pantryId)
  if (pantry) {
    pantry.status = "active"
    if (pantry.pauses.length > 0 && !pantry.pauses[0].resumedAt) {
      pantry.pauses[0].resumedAt = new Date().toISOString()
    }
    pantry.history.unshift({
      id: "hist_" + Math.random().toString(36).substr(2, 9),
      pantryId,
      action: "resumed",
      notes: "Pantry subscription resumed.",
      changedBy: "customer",
      createdAt: new Date().toISOString(),
    })
    saveMockDb(db)
  }

  revalidatePath("/account")
  return { success: true }
}

// Update pantry delivery and dispatch settings
export async function updatePantrySettings(
  pantryId: string,
  payload: {
    deliveryWindow?: "early_month" | "late_month"
    frequency?: "monthly" | "bi_monthly" | "tri_monthly"
    shippingAddressId?: string | null
  }
) {
  const session = await getCurrentSession()
  if (!session) return { success: false, error: "Not authorized" }

  const dbConnected = await isDbConnected()
  if (dbConnected) {
    try {
      await prisma.$transaction(async (tx) => {
        const original = await tx.pantry.findUnique({ where: { id: pantryId } })
        
        await tx.pantry.update({
          where: { id: pantryId },
          data: {
            ...(payload.deliveryWindow && { deliveryWindow: payload.deliveryWindow }),
            ...(payload.frequency && { frequency: payload.frequency }),
            ...(payload.shippingAddressId !== undefined && { shippingAddressId: payload.shippingAddressId }),
          },
        })

        // Generate updated delivery schedules if frequency changed
        if (payload.frequency && original && original.frequency !== payload.frequency) {
          // Remove pending future schedules
          await tx.pantrySchedule.deleteMany({
            where: { pantryId, status: "pending" },
          })

          const schedulesData = []
          const now = new Date()
          const intervalMonths = payload.frequency === "monthly" ? 1 : payload.frequency === "bi_monthly" ? 2 : 3
          
          for (let i = 1; i <= 3; i++) {
            const scheduledDate = new Date(now.getFullYear(), now.getMonth() + i * intervalMonths, 10)
            schedulesData.push({
              pantryId,
              scheduledDate,
              status: "pending",
            })
          }

          await tx.pantrySchedule.createMany({
            data: schedulesData,
          })
        }

        // History logs
        let noteParts = []
        if (payload.deliveryWindow) noteParts.push(`dispatch window changed to ${payload.deliveryWindow === "early_month" ? "Early Month (1st-5th)" : "Late Month (15th-20th)"}`)
        if (payload.frequency) noteParts.push(`frequency changed to ${payload.frequency}`)
        if (payload.shippingAddressId !== undefined) noteParts.push(`dispatch address updated`)

        await tx.pantryHistory.create({
          data: {
            pantryId,
            action: "frequency_changed",
            notes: `Pantry configurations updated: ${noteParts.join(", ")}.`,
          },
        })
      })

      revalidatePath("/account")
      return { success: true }
    } catch (err) {
      console.error("Database settings update failed, falling back to mock:", err)
    }
  }

  // Mock Fallback
  const db = getMockDb()
  const pantry = db.pantries.find((p: any) => p.id === pantryId)
  if (pantry) {
    let noteParts = []
    if (payload.deliveryWindow) {
      pantry.deliveryWindow = payload.deliveryWindow
      noteParts.push(`dispatch window changed to ${payload.deliveryWindow === "early_month" ? "Early Month (1st-5th)" : "Late Month (15th-20th)"}`)
    }
    if (payload.frequency) {
      const originalFreq = pantry.frequency
      pantry.frequency = payload.frequency
      noteParts.push(`frequency changed to ${payload.frequency}`)
      
      if (originalFreq !== payload.frequency) {
        // regenerate pending schedules
        const now = new Date()
        const intervalMonths = payload.frequency === "monthly" ? 1 : payload.frequency === "bi_monthly" ? 2 : 3
        pantry.schedules = []
        for (let i = 1; i <= 3; i++) {
          const scheduledDate = new Date(now.getFullYear(), now.getMonth() + i * intervalMonths, 10)
          pantry.schedules.push({
            id: "sched_" + Math.random().toString(36).substr(2, 9),
            pantryId,
            scheduledDate: scheduledDate.toISOString(),
            status: "pending",
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          })
        }
      }
    }
    if (payload.shippingAddressId !== undefined) {
      pantry.shippingAddressId = payload.shippingAddressId
      noteParts.push(`dispatch address updated`)
    }

    pantry.history.unshift({
      id: "hist_" + Math.random().toString(36).substr(2, 9),
      pantryId,
      action: "frequency_changed",
      notes: `Pantry configurations updated: ${noteParts.join(", ")}.`,
      changedBy: "customer",
      createdAt: new Date().toISOString(),
    })
    saveMockDb(db)
  }

  revalidatePath("/account")
  return { success: true }
}

// Add an item to the pantry
export async function addPantryItem(pantryId: string, productId: string, quantity: number = 1) {
  const session = await getCurrentSession()
  if (!session) return { success: false, error: "Not authorized" }

  const dbConnected = await isDbConnected()
  if (dbConnected) {
    try {
      await prisma.$transaction(async (tx) => {
        const existing = await tx.pantryItem.findUnique({
          where: {
            pantryId_productId: {
              pantryId,
              productId,
            },
          },
        })

        const productObj = await tx.product.findUnique({ where: { id: productId } })
        const productName = productObj?.name || "Item"

        if (existing) {
          await tx.pantryItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + quantity },
          })
        } else {
          await tx.pantryItem.create({
            data: {
              pantryId,
              productId,
              quantity,
            },
          })
        }

        await tx.pantryHistory.create({
          data: {
            pantryId,
            action: "item_added",
            notes: `Added ${quantity}x "${productName}" to subscription.`,
          },
        })
      })

      revalidatePath("/account")
      return { success: true }
    } catch (err) {
      console.error("Database add item failed, falling back to mock:", err)
    }
  }

  // Mock Fallback
  const db = getMockDb()
  const pantry = db.pantries.find((p: any) => p.id === pantryId)
  if (pantry) {
    const productObj = products.find((p) => p.id === productId)
    const productName = productObj?.name || "Item"

    const existing = pantry.items.find((item: any) => item.productId === productId)
    if (existing) {
      existing.quantity += quantity
    } else {
      pantry.items.push({
        id: "item_" + Math.random().toString(36).substr(2, 9),
        pantryId,
        productId,
        quantity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    pantry.history.unshift({
      id: "hist_" + Math.random().toString(36).substr(2, 9),
      pantryId,
      action: "item_added",
      notes: `Added ${quantity}x "${productName}" to subscription.`,
      changedBy: "customer",
      createdAt: new Date().toISOString(),
    })
    saveMockDb(db)
  }

  revalidatePath("/account")
  return { success: true }
}

// Update quantity or remove an item
export async function updatePantryItemQuantity(pantryId: string, itemId: string, quantity: number) {
  const session = await getCurrentSession()
  if (!session) return { success: false, error: "Not authorized" }

  const dbConnected = await isDbConnected()
  if (dbConnected) {
    try {
      await prisma.$transaction(async (tx) => {
        const item = await tx.pantryItem.findUnique({
          where: { id: itemId },
          include: { product: true },
        })

        if (!item) return

        const productName = item.product.name

        if (quantity <= 0) {
          await tx.pantryItem.delete({ where: { id: itemId } })
          await tx.pantryHistory.create({
            data: {
              pantryId,
              action: "item_removed",
              notes: `Removed "${productName}" from subscription.`,
            },
          })
        } else {
          await tx.pantryItem.update({
            where: { id: itemId },
            data: { quantity },
          })
          await tx.pantryHistory.create({
            data: {
              pantryId,
              action: "item_quantity_changed",
              notes: `Updated "${productName}" quantity to ${quantity}x.`,
            },
          })
        }
      })

      revalidatePath("/account")
      return { success: true }
    } catch (err) {
      console.error("Database update item quantity failed, falling back to mock:", err)
    }
  }

  // Mock Fallback
  const db = getMockDb()
  const pantry = db.pantries.find((p: any) => p.id === pantryId)
  if (pantry) {
    const itemIndex = pantry.items.findIndex((item: any) => item.id === itemId)
    if (itemIndex > -1) {
      const item = pantry.items[itemIndex]
      const productObj = products.find((p) => p.id === item.productId)
      const productName = productObj?.name || "Item"

      if (quantity <= 0) {
        pantry.items.splice(itemIndex, 1)
        pantry.history.unshift({
          id: "hist_" + Math.random().toString(36).substr(2, 9),
          pantryId,
          action: "item_removed",
          notes: `Removed "${productName}" from subscription.`,
          changedBy: "customer",
          createdAt: new Date().toISOString(),
        })
      } else {
        item.quantity = quantity
        pantry.history.unshift({
          id: "hist_" + Math.random().toString(36).substr(2, 9),
          pantryId,
          action: "item_quantity_changed",
          notes: `Updated "${productName}" quantity to ${quantity}x.`,
          changedBy: "customer",
          createdAt: new Date().toISOString(),
        })
      }
      saveMockDb(db)
    }
  }

  revalidatePath("/account")
  return { success: true }
}

// Skip next scheduled delivery month
export async function skipNextDelivery(pantryId: string, scheduleId: string) {
  const session = await getCurrentSession()
  if (!session) return { success: false, error: "Not authorized" }

  const dbConnected = await isDbConnected()
  if (dbConnected) {
    try {
      await prisma.$transaction(async (tx) => {
        const schedule = await tx.pantrySchedule.findUnique({ where: { id: scheduleId } })
        if (!schedule) return

        const formattedMonth = new Date(schedule.scheduledDate).toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        })

        await tx.pantrySchedule.update({
          where: { id: scheduleId },
          data: { status: "skipped" },
        })

        await tx.pantryHistory.create({
          data: {
            pantryId,
            action: "delivery_skipped",
            notes: `Skipped scheduled delivery for ${formattedMonth}.`,
          },
        })
      })

      revalidatePath("/account")
      return { success: true }
    } catch (err) {
      console.error("Database skip delivery failed, falling back to mock:", err)
    }
  }

  // Mock Fallback
  const db = getMockDb()
  const pantry = db.pantries.find((p: any) => p.id === pantryId)
  if (pantry) {
    const schedule = pantry.schedules.find((s: any) => s.id === scheduleId)
    if (schedule) {
      const formattedMonth = new Date(schedule.scheduledDate).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })

      schedule.status = "skipped"
      pantry.history.unshift({
        id: "hist_" + Math.random().toString(36).substr(2, 9),
        pantryId,
        action: "delivery_skipped",
        notes: `Skipped scheduled delivery for ${formattedMonth}.`,
        changedBy: "customer",
        createdAt: new Date().toISOString(),
      })
      saveMockDb(db)
    }
  }

  revalidatePath("/account")
  return { success: true }
}
