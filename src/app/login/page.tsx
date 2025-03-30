"use client"

import { Logo } from "@/components/logo"
import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center">
      <div className="w-full max-w-md px-4">
        <div className="flex justify-center py-8">
          <Logo variant="white" />
        </div>

        <div className="w-full">
          <SignIn
            appearance={{
              elements: {
                card: "bg-slate-800/50 backdrop-blur-sm border border-slate-700 shadow-xl",
                headerTitle: "text-white text-2xl",
                headerSubtitle: "text-slate-400",
                socialButtonsBlockButton: "border-slate-700 bg-slate-900 text-white hover:bg-slate-800",
                socialButtonsBlockButtonText: "text-white font-medium",
                formFieldLabel: "text-white",
                formFieldInput: "bg-slate-900 border-slate-700 text-white",
                footerActionText: "text-slate-400",
                footerActionLink: "text-amber-400 hover:text-amber-300",
              },
            }}
            redirectUrl="/dashboard"
            signUpUrl="/signup"
          />
        </div>
      </div>
    </div>
  )
}

