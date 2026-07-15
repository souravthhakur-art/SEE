"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/session"

// 1. Profile Actions
export async function updateProfile(payload: { fullName: string; phone?: string | null }) {
  const session = await getCurrentSession()
  if (!session) {
    return { success: false, error: "You must be signed in to perform this action." }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fullName: payload.fullName,
        phone: payload.phone || null,
      },
    })
    revalidatePath("/account")
    return { success: true, error: undefined }
  } catch (error) {
    console.error("Failed to update profile:", error)
    return { success: false, error: "Unable to update profile. Please check your inputs and try again." }
  }
}

// 2. Newsletter / Consent Actions
export async function updateNewsletterPreferences(payload: {
  subscribed: boolean
  marketingConsent: boolean
}) {
  const session = await getCurrentSession()
  if (!session) {
    return { success: false, error: "You must be signed in to perform this action." }
  }

  const email = session.user.email

  try {
    await prisma.$transaction(async (tx) => {
      // Update marketing consent on user
      await tx.user.update({
        where: { id: session.user.id },
        data: { marketingConsent: payload.marketingConsent },
      })

      if (payload.subscribed) {
        // Upsert subscriber record
        await tx.newsletterSubscriber.upsert({
          where: { email },
          update: { isActive: true },
          create: {
            email,
            source: "customer_account_dashboard",
            isActive: true,
          },
        })
      } else {
        // Deactivate subscriber record if exists
        const existing = await tx.newsletterSubscriber.findUnique({
          where: { email },
        })
        if (existing) {
          await tx.newsletterSubscriber.update({
            where: { email },
            data: { isActive: false },
          })
        }
      }
    })

    revalidatePath("/account")
    return { success: true, error: undefined }
  } catch (error) {
    console.error("Failed to update preferences:", error)
    return { success: false, error: "Unable to save your preferences. Please try again later." }
  }
}

// 3. Address Actions
export async function saveAddress(payload: {
  id?: string
  label?: string | null
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode: string
  country?: string
  phone?: string | null
  isDefault?: boolean
  isDefaultShipping?: boolean
  isDefaultBilling?: boolean
}) {
  const session = await getCurrentSession()
  if (!session) {
    return { success: false, error: "You must be signed in to perform this action." }
  }

  const userId = session.user.id

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. If this address is set as default, default-shipping, or default-billing,
      // reset others first to ensure there's only one default of each type.
      if (payload.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        })
      }
      if (payload.isDefaultShipping) {
        await tx.address.updateMany({
          where: { userId, isDefaultShipping: true },
          data: { isDefaultShipping: false },
        })
      }
      if (payload.isDefaultBilling) {
        await tx.address.updateMany({
          where: { userId, isDefaultBilling: true },
          data: { isDefaultBilling: false },
        })
      }

      // 2. Perform Create or Update
      if (payload.id) {
        // Update existing address
        await tx.address.update({
          where: { id: payload.id, userId }, // secure ownership
          data: {
            label: payload.label || null,
            addressLine1: payload.addressLine1,
            addressLine2: payload.addressLine2 || null,
            city: payload.city,
            state: payload.state,
            postalCode: payload.postalCode,
            country: payload.country || "India",
            phone: payload.phone || null,
            isDefault: !!payload.isDefault,
            isDefaultShipping: !!payload.isDefaultShipping,
            isDefaultBilling: !!payload.isDefaultBilling,
          },
        })
      } else {
        // Create new address
        await tx.address.create({
          data: {
            userId,
            label: payload.label || null,
            addressLine1: payload.addressLine1,
            addressLine2: payload.addressLine2 || null,
            city: payload.city,
            state: payload.state,
            postalCode: payload.postalCode,
            country: payload.country || "India",
            phone: payload.phone || null,
            isDefault: !!payload.isDefault,
            isDefaultShipping: !!payload.isDefaultShipping,
            isDefaultBilling: !!payload.isDefaultBilling,
          },
        })
      }

      revalidatePath("/account")
      return { success: true, error: undefined }
    })
  } catch (error) {
    console.error("Failed to save address:", error)
    return { success: false, error: "Unable to save address. Please check your input fields." }
  }
}

export async function deleteAddress(addressId: string) {
  const session = await getCurrentSession()
  if (!session) {
    return { success: false, error: "You must be signed in to perform this action." }
  }

  try {
    await prisma.address.delete({
      where: {
        id: addressId,
        userId: session.user.id, // secure ownership
      },
    })
    revalidatePath("/account")
    return { success: true, error: undefined }
  } catch (error) {
    console.error("Failed to delete address:", error)
    return { success: false, error: "Unable to delete this address. Please try again later." }
  }
}
