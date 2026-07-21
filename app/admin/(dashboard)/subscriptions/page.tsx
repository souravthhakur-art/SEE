import { prisma } from "@/lib/prisma"
import AdminPantryContent from "@/components/admin/AdminPantryContent"

export const revalidate = 0 // Disable cache to ensure live analytics

export default async function AdminSubscriptionsPage() {
  // Fetch all pantry memberships with related information
  let pantries: any[] = []
  try {
    pantries = await prisma.pantry.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            image: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                media: {
                  include: {
                    media: true
                  }
                }
              }
            }
          }
        },
        schedules: {
          orderBy: {
            scheduledDate: "asc"
          }
        },
        deliveries: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        },
        history: {
          orderBy: {
            createdAt: "desc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
  } catch (error) {
    console.error("Failed to fetch subscriptions from database, using fallback:", error)
  }

  return <AdminPantryContent pantries={pantries} />
}
