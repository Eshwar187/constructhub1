import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import type { Message } from "ai"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Clone the request to avoid the "Body has already been read" error
    const clonedRequest = request.clone()
    const requestBody = await clonedRequest.json()
    const parsedMessages: Message[] = requestBody.messages
    const lastUserMessage: Message | undefined = parsedMessages.filter((m) => m.role === "user").pop()

    if (!lastUserMessage) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 })
    }

    // Log the chat interaction to the database
    const { db } = await connectToDatabase()

    // Create a new query record
    await db.collection("queries").insertOne({
      userId: session.user.id,
      message: lastUserMessage.content,
      timestamp: new Date(),
      type: "ai_chat",
    })

    // Create a new activity record
    await db.collection("activities").insertOne({
      userId: session.user.id,
      type: "ai_chat",
      details: `Chat with AI: "${lastUserMessage.content.substring(0, 50)}${lastUserMessage.content.length > 50 ? "..." : ""}"`,
      timestamp: new Date(),
    })

    // Forward the request to the AI service
    // For now, we'll just echo back a response
    const aiResponse = {
      role: "assistant",
      content: `I received your message: "${lastUserMessage.content}". This is a placeholder response from the BuildWise AI assistant. In a production environment, this would be connected to an actual AI service.`,
    }

    return NextResponse.json({ messages: [...parsedMessages, aiResponse] })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

