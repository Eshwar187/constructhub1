import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    // Check if user is admin
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if user is admin
    const adminUser = await db.collection("admins").findOne({ userId })
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get analytics data
    // This is a placeholder - in a real app, you would calculate these values from your database
    const analyticsData = {
      stats: {
        totalUsers: 1248,
        activeUsers: 856,
        totalProjects: 642,
        completedProjects: 312,
        totalQueries: 3429,
        resolvedQueries: 2891,
        totalRevenue: 1250000,
      },
      charts: {
        userGrowth: [
          { month: "Jan", users: 40 },
          { month: "Feb", users: 55 },
          { month: "Mar", users: 75 },
          { month: "Apr", users: 90 },
          { month: "May", users: 120 },
          { month: "Jun", users: 150 },
          { month: "Jul", users: 180 },
        ],
        projectDistribution: [
          { name: "Residential", value: 350 },
          { name: "Commercial", value: 120 },
          { name: "Industrial", value: 75 },
          { name: "Institutional", value: 97 },
        ],
        revenueByMonth: [
          { month: "Jan", revenue: 120000 },
          { month: "Feb", revenue: 145000 },
          { month: "Mar", revenue: 165000 },
          { month: "Apr", revenue: 190000 },
          { month: "May", revenue: 210000 },
          { month: "Jun", revenue: 230000 },
          { month: "Jul", revenue: 250000 },
        ],
        queryByType: [
          { type: "Floor Plans", count: 1200 },
          { type: "Material Costs", count: 850 },
          { type: "Designer Recommendations", count: 720 },
          { type: "Budget Planning", count: 450 },
          { type: "Other", count: 209 },
        ],
      },
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}

