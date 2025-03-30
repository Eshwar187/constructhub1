import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"

// GET - Fetch all projects for the current user
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get user ID from session
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Fetch projects for this user
    const projects = await db
      .collection("projects")
      .find({ userId: user._id.toString() })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ message: "An error occurred while fetching projects" }, { status: 500 })
  }
}

// POST - Create a new project
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const projectData = await request.json()

    // Validate required fields
    if (!projectData.name || !projectData.landArea || !projectData.budget || !projectData.location) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get user ID from session
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Create new project with enhanced structure
    const newProject = {
      userId: user._id.toString(),
      name: projectData.name,
      description: projectData.description || "",

      // Enhanced land area structure
      landArea: projectData.landArea.value,
      landAreaUnit: projectData.landArea.unit,
      dimensions: projectData.landArea.dimensions,

      // Enhanced budget structure
      budget: projectData.budget.value,
      currency: projectData.budget.currency,
      budgetCategory: projectData.budget.category,

      // Enhanced location structure
      locationType: projectData.location.type,

      // For global locations
      region: projectData.location.region,
      country: projectData.location.country,
      city: projectData.location.city,

      // For India-specific locations (backward compatibility)
      state: projectData.location.state,
      indianCity: projectData.location.city,

      status: "in_progress",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("projects").insertOne(newProject)

    // Log activity
    await db.collection("userActivity").insertOne({
      userId: user._id.toString(),
      type: "project_created",
      details: `Created project: ${projectData.name}`,
      projectId: result.insertedId,
      timestamp: new Date(),
    })

    return NextResponse.json(
      {
        message: "Project created successfully",
        project: { ...newProject, _id: result.insertedId },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ message: "An error occurred while creating the project" }, { status: 500 })
  }
}

