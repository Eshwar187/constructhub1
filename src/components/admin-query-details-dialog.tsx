"use client"

import { format } from "date-fns"
import { MessageSquare, User, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface AdminQueryDetailsDialogProps {
  query: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminQueryDetailsDialog({ query, open, onOpenChange }: AdminQueryDetailsDialogProps) {
  if (!query) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Query Details</DialogTitle>
          <DialogDescription>Detailed information about the selected user query.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 py-2">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Query ID: {query._id.toString().substring(0, 8)}...</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {format(new Date(query.timestamp), "PPP p")}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">User Information</p>
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg flex items-center space-x-3">
                <User className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-medium">{query.username}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{query.userEmail}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Query Content</p>
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                <p className="whitespace-pre-wrap">{query.query}</p>
              </div>
            </div>

            {query.response && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">AI Response</p>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <p className="whitespace-pre-wrap">{query.response}</p>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Metadata</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Project</p>
                  <p className="font-medium">{query.projectName || "No project"}</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Query Type</p>
                  <p className="font-medium">{query.type || "General"}</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Processing Time</p>
                  <p className="font-medium">{query.processingTime || "Unknown"} ms</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400">IP Address</p>
                  <p className="font-medium">{query.ipAddress || "Unknown"}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button variant="default">View User Profile</Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

