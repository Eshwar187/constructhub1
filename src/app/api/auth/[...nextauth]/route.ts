import NextAuth from "next-auth/next"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"
import { compare } from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"
import { Adapter } from "next-auth/adapters"

// Custom interfaces
interface CustomUser {
  id: string
  email: string
  username: string
  name?: string
}

interface CustomSession extends Session {
  user: {
    id: string
    username: string
    email?: string | null
    name?: string | null
    image?: string | null
  }
}

interface CustomJWT extends JWT {
  id: string
  username: string
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const { db } = await connectToDatabase()
        const user = await db.collection("users").findOne({ 
          email: credentials.email 
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        await db.collection("users").updateOne(
          { _id: user._id },
          { $set: { lastLogin: new Date() } }
        )

        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          name: user.username,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }): Promise<CustomJWT> {
      if (user) {
        token.id = user.id
        token.username = user.username
      }
      return token as CustomJWT
    },
    async session({ session, token }): Promise<CustomSession> {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          username: token.username as string,
        }
      }
      return session as CustomSession
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}

// Create the handler with proper typing
const handler = NextAuth(authOptions)

// Export as named exports for Next.js API routes
export { handler as GET, handler as POST }