"use client"

import type React from "react"

import { ClerkProvider as BaseClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  return (
    <BaseClerkProvider
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
        elements: {
          formButtonPrimary: "bg-amber-500 hover:bg-amber-600 text-black font-semibold",
          footerActionLink: "text-amber-500 hover:text-amber-600",
          card: "bg-white dark:bg-slate-800 shadow-md",
        },
      }}
    >
      {children}
    </BaseClerkProvider>
  )
}

