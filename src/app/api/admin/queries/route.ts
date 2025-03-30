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

    // Get all queries
    const queries = await db.collection("userQueries").find({}).sort({ timestamp: -1 }).limit(100).toArray()

    // Enrich queries with user information
    const enrichedQueries = await Promise.all(
      queries.map(async (query) => {
        const user = await db
          .collection("users")
          .findOne({ _id: query.userId }, { projection: { username: 1, email: 1 } })

        // Get project information if available
        let projectName = null
        if (query.projectId) {
          const project = await db.collection("projects").findOne({ _id: query.projectId }, { projection: { name: 1 } })
          projectName = project?.name
        }

        return {
          ...query,
          username: user?.username || "Unknown",
          userEmail: user?.email || "Unknown",
          projectName,
        }
      }),
    )

    return NextResponse.json({ queries: enrichedQueries })
  } catch (error) {
    console.error("Error fetching queries:", error)
    return NextResponse.json({ message: "An error occurred while fetching queries" }, { status: 500 })
  }
}

