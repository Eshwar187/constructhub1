import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    // Check if user is admin using the admin-session cookie
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin-session")

    if (!adminSession || adminSession.value !== "true") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get total users
    const totalUsers = await db.collection("users").countDocuments()

    // Get total queries
    const totalQueries = await db.collection("userQueries").countDocuments()

    // Get new users this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const newUsers = await db.collection("users").countDocuments({
      createdAt: { $gte: oneWeekAgo },
    })

    // Get new queries today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const newQueries = await db.collection("userQueries").countDocuments({
      timestamp: { $gte: today },
    })

    // Get active users (users who logged in within the last 24 hours)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    const activeUsers = await db.collection("users").countDocuments({
      lastLogin: { $gte: oneDayAgo },
    })

    // Get total projects
    const totalProjects = await db.collection("projects").countDocuments()

    // Get new projects this week
    const newProjects = await db.collection("projects").countDocuments({
      createdAt: { $gte: oneWeekAgo },
    })

    // Calculate conversion rate (users who created at least one project)
    const usersWithProjects = await db
      .collection("projects")
      .aggregate([{ $group: { _id: "$userId" } }, { $count: "count" }])
      .toArray()

    const conversionRate = totalUsers > 0 ? Math.round(((usersWithProjects[0]?.count || 0) / totalUsers) * 100) : 0

    // Calculate conversion rate change
    // In a real app, you would compare with historical data
    // For now, we'll use a random number between -5 and 10
    const conversionRateChange = Math.floor(Math.random() * 16) - 5

    return NextResponse.json({
      totalUsers,
      totalQueries,
      newUsers,
      newQueries,
      activeUsers,
      totalProjects,
      newProjects,
      conversionRate,
      conversionRateChange,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ message: "An error occurred while fetching stats" }, { status: 500 })
  }
}

