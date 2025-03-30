import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const projectId = params.id

    // Check if project exists
    const project = await db.collection("projects").findOne({ _id: new ObjectId(projectId) })
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Delete floor plans associated with the project
    await db.collection("floorPlans").deleteMany({ projectId: new ObjectId(projectId) })

    // Delete queries associated with the project
    await db.collection("queries").deleteMany({ projectId: new ObjectId(projectId) })

    // Delete activities associated with the project
    await db.collection("activities").deleteMany({
      resourceId: new ObjectId(projectId),
      resourceType: "project",
    })

    // Finally, delete the project
    await db.collection("projects").deleteOne({ _id: new ObjectId(projectId) })

    // Log the deletion
    await db.collection("adminLogs").insertOne({
      action: "delete_project",
      resourceId: projectId,
      timestamp: new Date(),
      details: { projectId, userId: project.userId },
    })

    return NextResponse.json({ success: true, message: "Project and all associated data deleted successfully" })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}

