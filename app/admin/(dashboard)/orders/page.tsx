import { prisma } from "@/lib/prisma"
import AdminOrdersContent from "@/components/admin/AdminOrdersContent"

export const metadata = {
  title: "Ledger & Fulfillments — Admin Portal",
  description: "Monitor customer coordinates, update order dispatches, and calculate ledger snapshots.",
}

interface AdminOrdersPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    page?: string
  }>
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const status = resolvedParams.status || "";
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10) || 1);
  
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build prisma query filters
  const where: any = {};
  
  if (status && status !== "all") {
    where.status = status;
  }
  
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
    ];
  }

  // Run high-speed concurrent db lookups for orders list and count
  let dbOrders: any[] = [];
  let totalCount = 0;

  try {
    const [fetchedOrders, fetchedCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          history: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    dbOrders = fetchedOrders;
    totalCount = fetchedCount;
  } catch (error) {
    console.error("Failed to fetch orders from database, using fallback:", error);
  }

  return (
    <div className="space-y-6" id="admin-orders-page">
      <div className="flex justify-between items-center pb-4 border-b border-wood-light/10">
        <div>
          <h1 className="heading-sm text-charcoal font-semibold">Ledger & Fulfillments</h1>
          <p className="text-xs text-charcoal/50 font-body mt-0.5">
            Manage dispatch statuses, print packing slips, and monitor customer orders.
          </p>
        </div>
      </div>

      <AdminOrdersContent 
        orders={dbOrders} 
        totalCount={totalCount} 
        currentPage={page} 
      />
    </div>
  )
}
