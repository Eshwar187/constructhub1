import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "")

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error verifying webhook", {
      status: 400,
    })
  }

  // Get the event type
  const eventType = evt.type

  // Connect to MongoDB
  const { db } = await connectToDatabase()

  // Handle the event
  try {
    if (eventType === "user.created") {
      // Create a new user in your database
      await db.collection("users").insertOne({
        clerkId: evt.data.id,
        email: evt.data.email_addresses[0]?.email_address,
        username: evt.data.username || evt.data.first_name,
        firstName: evt.data.first_name,
        lastName: evt.data.last_name,
        imageUrl: evt.data.image_url,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } else if (eventType === "user.updated") {
      // Update the user in your database
      await db.collection("users").updateOne(
        { clerkId: evt.data.id },
        {
          $set: {
            email: evt.data.email_addresses[0]?.email_address,
            username: evt.data.username || evt.data.first_name,
            firstName: evt.data.first_name,
            lastName: evt.data.last_name,
            imageUrl: evt.data.image_url,
            updatedAt: new Date(),
          },
        },
      )
    } else if (eventType === "user.deleted") {
      // Delete the user from your database
      await db.collection("users").deleteOne({ clerkId: evt.data.id })
    }

    return new Response("Webhook processed successfully", { status: 200 })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return new Response("Error processing webhook", { status: 500 })
  }
}

