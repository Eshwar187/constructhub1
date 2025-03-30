"use client"

import { format } from "date-fns"
import { User, Mail, Calendar, Clock, FileText, MessageSquare } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface UserActivity {
  type: string
  timestamp: string | Date
  details: string
}

interface AdminUserDetailsDialogProps {
  user: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminUserDetailsDialog({ user, open, onOpenChange }: AdminUserDetailsDialogProps) {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Detailed information about the selected user.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 py-2">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <User className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium">{user.username || "No username"}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user.name || "No name provided"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</p>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <p>{user.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">User ID</p>
                <p className="font-mono text-sm">{user._id}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Registered On</p>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <p>{format(new Date(user.createdAt), "PPP")}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Last Login</p>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <p>{user.lastLogin ? format(new Date(user.lastLogin), "PPP p") : "Never"}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Activity Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <FileText className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-medium">Projects</p>
                  </div>
                  <p className="text-2xl font-bold">{user.projectsCount || 0}</p>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-medium">Queries</p>
                  </div>
                  <p className="text-2xl font-bold">{user.queriesCount || 0}</p>
                </div>

                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-medium">Last Active</p>
                  </div>
                  <p className="text-sm">
                    {user.lastActive ? format(new Date(user.lastActive), "MMM d, yyyy") : "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            {user.recentActivity && user.recentActivity.length > 0 && (
              <>
                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-2">
                    {user.recentActivity.map((activity: UserActivity, index: number) => (
                      <div key={index} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium">{activity.type}</p>
                        <p className="text-xs text-slate-500">
                        {format(new Date(activity.timestamp), "MMM d, HH:mm")}
                        </p>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{activity.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

