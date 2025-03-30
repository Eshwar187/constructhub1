import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { ClerkProvider } from "@/components/clerk-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ConstructHub - Construction Planning Assistant",
  description: "AI-powered construction planning and material optimization",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}

