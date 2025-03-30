"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useChat } from "ai/react"
import { Bot, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
// Add the import for getCurrencySymbol
import { getCurrencySymbol } from "@/lib/unit-utils"

// Update the ChatUIProps interface to include the missing properties
interface ChatUIProps {
  projectDetails?: {
    landArea?: string
    landAreaUnit?: string
    budget?: string
    currency?: string
    state?: string
    city?: string
    location?: {
      type?: string
      region?: string
      country?: string
      state?: string
      city?: string
    }
  }
}

export function ChatUI({ projectDetails }: ChatUIProps) {
  const { data: session } = useSession()
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Update the initialMessage to include the landAreaUnit and currency
  const initialMessage = projectDetails
    ? `I have a construction project with the following details:
     - Land area: ${projectDetails.landArea} ${projectDetails.landAreaUnit || "acres"}
     - Budget: ${projectDetails.currency ? getCurrencySymbol(projectDetails.currency) : "₹"}${projectDetails.budget}
     - Location: ${projectDetails.location?.city || projectDetails.city || ""}, ${projectDetails.location?.state || projectDetails.state || ""}
     
     Can you help me with floor plan suggestions and material optimization?`
    : undefined

  const { messages, handleSubmit, isLoading, append } = useChat({
    initialMessages: initialMessage
      ? [
          {
            id: "init",
            role: "user",
            content: initialMessage,
          },
        ]
      : [],
    onFinish: () => {
      // Scroll to bottom when message is complete
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
      }
    },
  })

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Auto-focus the input field
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      append({
        role: "user",
        content: input,
      })
      setInput("")
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
        <div className="space-y-4 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3 rounded-lg p-3",
                message.role === "user"
                  ? "ml-auto max-w-[80%] bg-amber-500/10 text-slate-900 dark:text-slate-100"
                  : "mr-auto max-w-[80%] bg-slate-100 dark:bg-slate-800",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border text-sm",
                  message.role === "user" ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-700",
                )}
              >
                {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className="flex-1 space-y-2 overflow-hidden">
                <div className="prose prose-slate dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mr-auto max-w-[80%] flex items-start gap-3 rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-slate-100 text-sm dark:bg-slate-700">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="h-4 w-4 animate-bounce">
                  <span className="sr-only">Thinking...</span>
                  <div className="h-1 w-1 rounded-full bg-slate-500"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <form onSubmit={onSubmit} className="flex gap-2">
          <Textarea
            ref={inputRef}
            placeholder="Ask about floor plans, materials, or local designers..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-12 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                onSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}

