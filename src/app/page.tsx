import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, Shield, User } from "lucide-react"
import { Logo } from "@/components/logo"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <Logo variant="white" />
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:text-amber-400">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">Sign Up</Button>
          </Link>
          <Link href="/admin/login">
            <Button variant="outline" className="text-white border-white hover:bg-slate-700">
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-5xl font-bold leading-tight">
              Build Smarter with <span className="text-amber-400">AI-Powered</span> Construction Planning
            </h2>
            <p className="text-xl text-slate-300">
              Get customized floor plans, material optimization, and connect with local designers - all based on your
              budget and requirements.
            </p>
            <div className="flex gap-4 pt-4">
              <Link href="/signup">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black">
                  Get Started
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-slate-700">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg blur opacity-75"></div>
            <div className="relative bg-slate-800 p-6 rounded-lg border border-slate-700">
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="Construction planning visualization"
                className="rounded-md w-full h-auto"
              />
            </div>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-amber-500 transition-all">
            <div className="h-12 w-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Floor Plans</h3>
            <p className="text-slate-300">
              Generate optimized floor plans based on your land area and budget constraints.
            </p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-amber-500 transition-all">
            <div className="h-12 w-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-amber-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 20h.01m4 0h.01m4 0h.01m4 0h.01m4 0h.01M5 14h14c1 0 2-1 2-2V6c0-1-1-2-2-2H5c-1 0-2 1-2 2v6c0 1 1 2 2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Material Optimization</h3>
            <p className="text-slate-300">
              Get recommendations for efficient material usage based on your location and budget.
            </p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-amber-500 transition-all">
            <div className="h-12 w-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Local Experts</h3>
            <p className="text-slate-300">
              Connect with interior designers and contractors in your area who match your budget.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-8 mt-20">
        <div className="container mx-auto text-center text-slate-400">
          <p>© 2025 ConstructHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

