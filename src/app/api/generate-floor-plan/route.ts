import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const { projectId, requirements } = await req.json()

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Get project details
    const project = await db.collection("projects").findOne({ _id: new ObjectId(projectId) })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Generate floor plan using OpenAI
    const prompt = `
      Create a detailed architectural blueprint for a ${project.buildingType} with the following specifications:
      - Land area: ${project.landArea} ${project.landAreaUnit}
      - Budget: ${project.budget} ${project.currency}
      - Location: ${project.location.state}, ${project.location.country}
      - Number of bedrooms: ${project.bedrooms || 3}
      - Number of bathrooms: ${project.bathrooms || 2}
      - Additional requirements: ${requirements || "Standard layout with living room, kitchen, and dining area"}
      
      The blueprint should include:
      1. Floor layout with room dimensions
      2. Wall placements
      3. Door and window positions
      4. Kitchen and bathroom fixtures
      5. Scale and measurements
      
      Create a professional architectural blueprint that optimizes space usage and follows standard building codes.
    `

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural",
    })

    const floorPlanUrl = response.data[0].url

    // Save floor plan to database
    const floorPlan = {
      projectId: new ObjectId(projectId),
      userId,
      imageUrl: floorPlanUrl,
      requirements: requirements || "Standard layout",
      createdAt: new Date(),
      status: "completed",
    }

    const result = await db.collection("floorPlans").insertOne(floorPlan)

    // Update project with floor plan ID
    await db
      .collection("projects")
      .updateOne({ _id: new ObjectId(projectId) }, { $push: { floorPlans: new ObjectId(result.insertedId) } })

    // Log activity
    await db.collection("activities").insertOne({
      userId,
      action: "generate_floor_plan",
      resourceId: result.insertedId,
      resourceType: "floor_plan",
      details: { projectId },
      timestamp: new Date(),
    })

    return NextResponse.json({
      success: true,
      floorPlan: {
        id: result.insertedId,
        imageUrl: floorPlanUrl,
        requirements: requirements || "Standard layout",
        createdAt: new Date(),
      },
    })
  } catch (error) {
    console.error("Error generating floor plan:", error)
    return NextResponse.json({ error: "Failed to generate floor plan" }, { status: 500 })
  }
}

