import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Step 1: Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Parse and validate request body
    const { projectId, requirements } = await req.json();
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }
    if (requirements && typeof requirements !== "string") {
      return NextResponse.json({ error: "Requirements must be a string" }, { status: 400 });
    }
    if (requirements && requirements.length > 1000) {
      return NextResponse.json(
        { error: "Requirements cannot exceed 1000 characters" },
        { status: 400 }
      );
    }

    // Step 3: Connect to database
    const { db, client } = await connectToDatabase();

    // Step 4: Get project details
    const project = await db.collection("projects").findOne({ _id: new ObjectId(projectId) });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Step 5: Generate floor plan using OpenAI
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
    `;

    // Note: Consider adding rate limiting or queuing for OpenAI API calls to avoid hitting rate limits
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "natural",
    });

    // Validate OpenAI response
    const floorPlanUrl = response.data?.[0]?.url;
    if (!floorPlanUrl) {
      throw new Error("Failed to generate floor plan image from OpenAI");
    }

    // Step 6: Save floor plan to database and update project in a transaction
    const floorPlan = {
      projectId: new ObjectId(projectId),
      userId,
      imageUrl: floorPlanUrl,
      requirements: requirements || "Standard layout",
      createdAt: new Date(),
      status: "completed",
    };

    const session = await client.startSession();
    let result: { insertedId: ObjectId } | undefined;
    try {
      await session.withTransaction(async () => {
        // Insert the floor plan
        result = await db.collection("floorPlans").insertOne(floorPlan, { session });

        // Update the project's floorPlans array using an aggregation pipeline
        const updateResult = await db.collection("projects").updateOne(
          { _id: new ObjectId(projectId) },
          [
            {
              $set: {
                floorPlans: {
                  $cond: {
                    if: { $or: [{ $eq: ["$floorPlans", null] }, { $not: { $isArray: "$floorPlans" } }] },
                    then: [],
                    else: "$floorPlans",
                  },
                },
              },
            },
            {
              $set: {
                floorPlans: {
                  $concatArrays: ["$floorPlans", [result.insertedId]],
                },
              },
            },
          ],
          { session }
        );

        // Validate the update
        if (updateResult.matchedCount === 0) {
          throw new Error("Project not found during floorPlans update");
        }
        if (updateResult.modifiedCount === 0) {
          throw new Error("Failed to update project's floorPlans array");
        }

        // Log activity
        await db.collection("activities").insertOne(
          {
            userId,
            action: "generate_floor_plan",
            resourceId: result.insertedId,
            resourceType: "floor_plan",
            details: { projectId },
            timestamp: new Date(),
          },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    // Step 7: Return success response
    return NextResponse.json({
      success: true,
      floorPlan: {
        id: result?.insertedId || null,
        imageUrl: floorPlanUrl,
        requirements: requirements || "Standard layout",
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error generating floor plan:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate floor plan";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}