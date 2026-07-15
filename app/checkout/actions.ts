"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/session"
import { products, subscriptionBoxes } from "@/lib/data"

// Ensure WELCOME5 exists in the DB
async function seedWelcomeCoupon() {
  try {
    await prisma.coupon.upsert({
      where: { code: "WELCOME5" },
      update: {
        active: true,
        firstOrderOnly: true,
        discountType: "percentage",
        discountValue: 5,
      },
      create: {
        code: "WELCOME5",
        description: "5% off on your first order",
        discountType: "percentage",
        discountValue: 5,
        firstOrderOnly: true,
        active: true,
      },
    })

    await prisma.promotion.upsert({
      where: { code: "WELCOME5" },
      update: {
        active: true,
        firstOrderOnly: true,
        discountType: "percentage",
        discountValue: 5,
      },
      create: {
        name: "Welcome First Order Discount",
        code: "WELCOME5",
        description: "5% off on your first order",
        discountType: "percentage",
        discountValue: 5,
        firstOrderOnly: true,
        active: true,
        onePerCustomer: true,
      },
    })
  } catch (error) {
    console.error("Error seeding welcome coupon:", error)
  }
}

export async function validateCoupon(code: string, customerEmail: string) {
  if (!code || !customerEmail) {
    return { valid: false, error: "Please provide a coupon code and your email." }
  }

  const normalizedCode = code.trim().toUpperCase()
  const normalizedEmail = customerEmail.trim().toLowerCase()

  // Auto-seed welcome coupon on use to make sure it's present
  if (normalizedCode === "WELCOME5") {
    await seedWelcomeCoupon()
  }

  try {
    // Look up coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    })

    if (!coupon || !coupon.active) {
      return { valid: false, error: "Invalid or inactive coupon code." }
    }

    // First order check
    if (coupon.firstOrderOnly) {
      const orderCount = await prisma.order.count({
        where: {
          customerEmail: {
            equals: normalizedEmail,
            mode: "insensitive",
          },
          status: {
            not: "cancelled",
          },
        },
      })

      if (orderCount > 0) {
        return { valid: false, error: "This coupon is only valid for first-time customers." }
      }
    }

    return {
      valid: true,
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description,
    }
  } catch (error) {
    console.error("Failed to validate coupon:", error)
    return { valid: false, error: "An error occurred while validating the coupon." }
  }
}

interface OrderItemInput {
  productId: string
  quantity: number
}

interface AddressInput {
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode: string
  country?: string
}

interface PlaceOrderInput {
  customerName: string
  customerEmail: string
  customerPhone?: string | null
  shippingAddress: AddressInput
  billingAddress?: AddressInput | null
  couponCode?: string | null
  items: OrderItemInput[]
  notes?: string | null
  isPantry?: boolean
  pantryPlan?: string
  pantryFrequency?: string
  pantryWindow?: string
  pantryItems?: { productId: string; quantity: number }[]
}

export async function placeOrder(payload: PlaceOrderInput) {
  const session = await getCurrentSession()
  const userId = session?.user?.id || null

  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    billingAddress,
    couponCode,
    items,
    notes,
    isPantry,
    pantryPlan,
    pantryFrequency,
    pantryWindow,
    pantryItems,
  } = payload

  if (!customerName || !customerEmail || items.length === 0) {
    return { success: false, error: "Missing required order details." }
  }

  try {
    // 1. Verify and map order items, fetch latest product details
    const orderItemsToCreate: Array<{
      productId: string
      productName: string
      productSku: string
      productSlug: string
      quantity: number
      price: number
      weight: string
      image: string
    }> = []
    let subtotal = 0

    for (const item of items) {
      let productInfo = products.find((p) => p.id === item.productId)
      
      // Support virtual pantry plans
      if (!productInfo && item.productId.startsWith("pantry-plan-")) {
        const planId = item.productId.replace("pantry-plan-", "")
        const plan = subscriptionBoxes.find((b) => b.id === planId)
        if (plan) {
          productInfo = {
            id: item.productId,
            name: `${plan.name} Membership`,
            price: plan.price,
            weight: "Box",
            image: "/images/subscriptions/seasonal-harvests.jpg",
            slug: `pantry-plan-${planId}`,
          } as any
        }
      }

      if (!productInfo) {
        return { success: false, error: `Product not found: ${item.productId}` }
      }

      const itemTotal = productInfo.price * item.quantity
      subtotal += itemTotal

      orderItemsToCreate.push({
        productId: productInfo.id,
        productName: productInfo.name,
        productSku: productInfo.id, // using id as fallback SKU since catalog is static
        productSlug: productInfo.slug,
        quantity: item.quantity,
        price: productInfo.price, // Snapshotted price (immutable)
        weight: productInfo.weight,
        image: productInfo.image,
      })
    }

    // 2. Validate discount / coupon code
    let discount = 0
    let couponId: string | null = null
    let promotionId: string | null = null

    if (couponCode) {
      const couponRes = await validateCoupon(couponCode, customerEmail)
      if (couponRes.valid && couponRes.id) {
        couponId = couponRes.id
        if (couponRes.discountType === "percentage") {
          discount = Math.round((subtotal * (couponRes.discountValue || 0)) / 100)
        } else {
          discount = couponRes.discountValue || 0
        }

        // Check if there is an equivalent Promotion
        const matchingPromotion = await prisma.promotion.findUnique({
          where: { code: couponRes.code },
        })
        if (matchingPromotion) {
          promotionId = matchingPromotion.id
        }
      } else if (couponCode.trim() !== "") {
        return { success: false, error: couponRes.error || "Invalid coupon code." }
      }
    }

    // 3. Shipping Fee (Free above 1000 INR)
    const shippingFee = subtotal >= 1000 ? 0 : 99

    // 4. Tax (5% GST included or placeholder)
    const tax = Math.round((subtotal - discount) * 0.05)

    // 5. Grand Total
    const grandTotal = Math.max(0, subtotal - discount + shippingFee)

    // Generate unique order number (e.g. PD-202610-A97F)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const orderNumber = `PD-${dateStr}-${randomSuffix}`

    // 6. DB Transaction to create order
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName,
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone,
          shippingAddress: shippingAddress as any,
          billingAddress: (billingAddress || shippingAddress) as any,
          status: "processing",
          subtotal,
          shippingFee,
          discount,
          tax,
          grandTotal,
          couponCode: couponCode ? couponCode.trim().toUpperCase() : null,
          couponId,
          promotionId,
          notes,
          items: {
            create: orderItemsToCreate,
          },
          history: {
            create: {
              status: "processing",
              notes: "Order placed successfully. Awaiting merchant confirmation.",
              changedBy: "System",
            },
          },
        },
      })

      // If coupon used, record a redemption and increment coupon count
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } },
        })

        if (promotionId) {
          await tx.promotion.update({
            where: { id: promotionId },
            data: {
              redemptions: {
                create: {
                  orderId: newOrder.id,
                  userId,
                  customerEmail: customerEmail.trim().toLowerCase(),
                },
              },
            },
          })
        } else {
          await tx.promotionRedemption.create({
            data: {
              couponId,
              orderId: newOrder.id,
              userId,
              customerEmail: customerEmail.trim().toLowerCase(),
            },
          })
        }
      }

      // Add audit log/notes entry
      await tx.orderNotes.create({
        data: {
          orderId: newOrder.id,
          note: `Customer placed order for ₹${grandTotal}. Shipping method: Cash on Delivery.`,
        },
      })

      // If this is a pantry subscription, create the Pantry, PantryItems, and PantrySchedule records
      if (isPantry && pantryPlan) {
        // Compute shippingAddressId
        let finalAddressId: string | null = null
        if (userId) {
          const existingAddress = await tx.address.findFirst({
            where: {
              userId,
              addressLine1: shippingAddress.addressLine1,
              city: shippingAddress.city,
              postalCode: shippingAddress.postalCode,
            },
          })
          if (existingAddress) {
            finalAddressId = existingAddress.id
          } else {
            const newAddr = await tx.address.create({
              data: {
                userId,
                label: "Pantry Delivery",
                addressLine1: shippingAddress.addressLine1,
                addressLine2: shippingAddress.addressLine2 || null,
                city: shippingAddress.city,
                state: shippingAddress.state,
                postalCode: shippingAddress.postalCode,
                country: shippingAddress.country || "India",
                phone: customerPhone || null,
              },
            })
            finalAddressId = newAddr.id
          }
        }

        // Get saving percent based on plan
        const planObj = subscriptionBoxes.find((b) => b.id === pantryPlan)
        const name = planObj ? planObj.name : "Family Pantry"
        const savingPercent = pantryPlan === "signature" ? 10 : pantryPlan === "seasonal" ? 10 : pantryPlan === "family" ? 5 : 0

        // Create the Pantry subscription record
        const newPantry = await tx.pantry.create({
          data: {
            userId: userId || "guest_pantry_user", // Fallback for safety
            name: name,
            status: "active",
            deliveryWindow: pantryWindow || "early_month",
            frequency: pantryFrequency || "monthly",
            tier: pantryPlan, // Storing plan code here makes it easy to check which plan they have!
            savingPercent,
            shippingAddressId: finalAddressId,
          },
        })

        // Create Pantry items
        if (pantryItems && pantryItems.length > 0) {
          await tx.pantryItem.createMany({
            data: pantryItems.map((item) => ({
              pantryId: newPantry.id,
              productId: item.productId,
              quantity: item.quantity,
            })),
          })
        }

        // Create initial Schedules (3 months)
        const schedulesData = []
        const now = new Date()
        const intervalMonths = pantryFrequency === "monthly" ? 1 : pantryFrequency === "bi_monthly" ? 2 : 3
        
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

        // Create initial Delivery history for the first month
        await tx.pantryDelivery.create({
          data: {
            pantryId: newPantry.id,
            orderId: newOrder.id,
            dispatchWindow: pantryWindow || "early_month",
            status: "processing",
          },
        })

        // Add history log
        await tx.pantryHistory.create({
          data: {
            pantryId: newPantry.id,
            action: "created",
            notes: `Pantry Membership "${name}" activated via Checkout. First order: ${orderNumber}.`,
          },
        })
      }

      return newOrder
    })

    revalidatePath("/account")
    return { success: true, orderNumber: order.orderNumber }
  } catch (error) {
    console.error("Failed to place order:", error)
    return { success: false, error: "An unexpected error occurred while placing your order. Please try again." }
  }
}
