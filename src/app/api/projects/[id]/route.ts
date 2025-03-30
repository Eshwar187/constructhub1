import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Fetch a specific project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Ensure params is typed as a Promise
) {
  try {
    // Resolve params
    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    // Check authentication
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!ObjectId.isValid(projectId)) {
      return NextResponse.json({ message: "Invalid project ID" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Get user ID from session
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Fetch project
    const project = await db.collection("projects").findOne({
      _id: new ObjectId(projectId),
      userId: user._id.toString(),
    });

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ message: "An error occurred while fetching the project" }, { status: 500 });
  }
}

// PUT - Update a project
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Resolve params
    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    // Check authentication
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!ObjectId.isValid(projectId)) {
      return NextResponse.json({ message: "Invalid project ID" }, { status: 400 });
    }

    const updateData = await request.json();

    const { db } = await connectToDatabase();

    // Get user ID from session
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if project exists and belongs to user
    const existingProject = await db.collection("projects").findOne({
      _id: new ObjectId(projectId),
      userId: user._id.toString(),
    });

    if (!existingProject) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    // Update project
    const result = await db.collection("projects").updateOne(
      { _id: new ObjectId(projectId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    // Log activity
    await db.collection("userActivity").insertOne({
      userId: user._id.toString(),
      type: "project_updated",
      details: `Updated project: ${existingProject.name}`,
      projectId: new ObjectId(projectId),
      timestamp: new Date(),
    });

    return NextResponse.json({
      message: "Project updated successfully",
      project: { ...existingProject, ...updateData, updatedAt: new Date() },
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ message: "An error occurred while updating the project" }, { status: 500 });
  }
}

// DELETE - Delete a project
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Resolve params
    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    // Check authentication
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!ObjectId.isValid(projectId)) {
      return NextResponse.json({ message: "Invalid project ID" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Get user ID from session
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if project exists and belongs to user
    const existingProject = await db.collection("projects").findOne({
      _id: new ObjectId(projectId),
      userId: user._id.toString(),
    });

    if (!existingProject) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    // Delete project
    await db.collection("projects").deleteOne({ _id: new ObjectId(projectId) });

    // Log activity
    await db.collection("userActivity").insertOne({
      userId: user._id.toString(),
      type: "project_deleted",
      details: `Deleted project: ${existingProject.name}`,
      timestamp: new Date(),
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ message: "An error occurred while deleting the project" }, { status: 500 });
  }
}