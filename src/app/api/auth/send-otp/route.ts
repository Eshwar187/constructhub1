import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import mailjet from "node-mailjet"

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Generate OTP
    const otp = generateOTP()

    // Set expiration time (15 minutes from now)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)

    // Store OTP in database
    await db.collection("otps").insertOne({
      email,
      code: otp,
      createdAt: new Date(),
      expiresAt,
    })

    // Send email with OTP using Mailjet
    const mailjetClient = mailjet.apiConnect(process.env.MAILJET_API_KEY || "", process.env.MAILJET_SECRET_KEY || "")

    await mailjetClient.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "noreply@buildwise.ai",
            Name: "BuildWise AI",
          },
          To: [
            {
              Email: email,
            },
          ],
          Subject: "Your BuildWise AI Verification Code",
          TextPart: `Your verification code is: ${otp}. It will expire in 15 minutes.`,
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #f59e0b; margin-bottom: 10px;">BuildWise AI</h1>
                <p style="font-size: 18px; color: #333;">Your Verification Code</p>
              </div>
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
                <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</p>
              </div>
              <p style="color: #666; margin-bottom: 20px;">This code will expire in 15 minutes. If you didn't request this code, you can safely ignore this email.</p>
              <div style="text-align: center; color: #888; font-size: 12px; margin-top: 30px;">
                <p>&copy; 2025 BuildWise AI. All rights reserved.</p>
              </div>
            </div>
          `,
        },
      ],
    })

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 })
  }
}

