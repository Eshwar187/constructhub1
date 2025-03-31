import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: Request) {
  try {
    // Check if user is admin using Clerk
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // In a real app, you would check if the user is an admin in your database
    // For now, we'll use a simple check
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin-session")

    if (!adminSession || adminSession.value !== "true") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get all users
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray()

    // Enrich users with query and project counts
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const queriesCount = await db.collection("userQueries").countDocuments({ userId: user._id.toString() })
        const projectsCount = await db.collection("projects").countDocuments({ userId: user._id.toString() })

        // Get recent activity
        const recentActivity = await db
          .collection("userActivity")
          .find({ userId: user._id.toString() })
          .sort({ timestamp: -1 })
          .limit(5)
          .toArray()

        return {
          ...user,
          queriesCount,
          projectsCount,
          recentActivity,
        }
      }),
    )

    return NextResponse.json({ users: enrichedUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "An error occurred while fetching users" }, { status: 500 })
  }
}

