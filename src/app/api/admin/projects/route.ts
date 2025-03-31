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

    // Get all projects
    const projects = await db.collection("projects").find({}).sort({ createdAt: -1 }).limit(100).toArray()

    // Enrich projects with user information
    const enrichedProjects = await Promise.all(
      projects.map(async (project) => {
        const user = await db
          .collection("users")
          .findOne({ _id: project.userId }, { projection: { username: 1, email: 1 } })

        return {
          ...project,
          username: user?.username || "Unknown",
          userEmail: user?.email || "Unknown",
        }
      }),
    )

    return NextResponse.json({ projects: enrichedProjects })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ message: "An error occurred while fetching projects" }, { status: 500 })
  }
}

