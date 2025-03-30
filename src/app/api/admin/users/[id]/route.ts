import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const userId = params.id

    // Check if user exists
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user's projects
    const projects = await db.collection("projects").find({ userId: userId }).toArray()
    const projectIds = projects.map((project) => project._id)

    // Delete floor plans associated with the user's projects
    await db.collection("floorPlans").deleteMany({ projectId: { $in: projectIds } })

    // Delete the projects
    await db.collection("projects").deleteMany({ userId: userId })

    // Delete user's queries
    await db.collection("queries").deleteMany({ userId: userId })

    // Delete user's activities
    await db.collection("activities").deleteMany({ userId: userId })

    // Finally, delete the user
    await db.collection("users").deleteOne({ _id: new ObjectId(userId) })

    // Log the deletion
    await db.collection("adminLogs").insertOne({
      action: "delete_user",
      resourceId: userId,
      timestamp: new Date(),
      details: { userId },
    })

    return NextResponse.json({ success: true, message: "User and all associated data deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

