// types/next-auth.d.ts

import { JWT } from "next-auth/jwt"
import { Session as DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string | null
    }
  }

  interface User {
    id: string
    username?: string
    name?: string
    email?: string
    image?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    username?: string
  }
}