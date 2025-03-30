"use client"

import { format, formatDistanceToNow } from "date-fns"
import { MessageSquare, Download, User, Clock, Paintbrush, Users, Building2 } from "lucide-react"

interface Activity {
  _id: string
  userId: string
  type: string
  details: string
  timestamp: string
  projectId?: string
}

interface RecentActivityListProps {
  activities: Activity[]
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No activity yet</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Your recent actions and interactions with BuildWise AI will appear here.
        </p>
      </div>
    )
  }

  // Sort activities by timestamp (newest first)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ai_chat":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "project_created":
        return <Building2 className="h-5 w-5 text-green-500" />
      case "project_updated":
        return <Building2 className="h-5 w-5 text-amber-500" />
      case "project_deleted":
        return <Building2 className="h-5 w-5 text-red-500" />
      case "floor_plan":
        return <Download className="h-5 w-5 text-purple-500" />
      case "profile_update":
        return <User className="h-5 w-5 text-indigo-500" />
      case "material_search":
        return <Paintbrush className="h-5 w-5 text-orange-500" />
      case "designer_search":
        return <Users className="h-5 w-5 text-pink-500" />
      default:
        return <Clock className="h-5 w-5 text-slate-500" />
    }
  }

  const getActivityTitle = (activity: Activity) => {
    switch (activity.type) {
      case "ai_chat":
        return "AI Consultation"
      case "project_created":
        return "Project Created"
      case "project_updated":
        return "Project Updated"
      case "project_deleted":
        return "Project Deleted"
      case "floor_plan":
        return "Floor Plan Generated"
      case "profile_update":
        return "Profile Updated"
      case "material_search":
        return "Materials Searched"
      case "designer_search":
        return "Designers Searched"
      default:
        return "Activity"
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "ai_chat":
        return "bg-blue-100 dark:bg-blue-900/30"
      case "project_created":
        return "bg-green-100 dark:bg-green-900/30"
      case "project_updated":
        return "bg-amber-100 dark:bg-amber-900/30"
      case "project_deleted":
        return "bg-red-100 dark:bg-red-900/30"
      case "floor_plan":
        return "bg-purple-100 dark:bg-purple-900/30"
      case "profile_update":
        return "bg-indigo-100 dark:bg-indigo-900/30"
      case "material_search":
        return "bg-orange-100 dark:bg-orange-900/30"
      case "designer_search":
        return "bg-pink-100 dark:bg-pink-900/30"
      default:
        return "bg-slate-100 dark:bg-slate-800"
    }
  }

  return (
    <div className="space-y-4">
      {sortedActivities.map((activity) => (
        <div
          key={activity._id}
          className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div
            className={`flex-shrink-0 h-10 w-10 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center`}
          >
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{getActivityTitle(activity)}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{activity.details}</p>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                <span title={format(new Date(activity.timestamp), "PPpp")}>
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

