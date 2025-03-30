"use client"

import { useState, useEffect } from "react"
import { Users, MessageSquare, Building2, TrendingUp, TrendingDown, Activity, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface AdminRealTimeStatsProps {
  initialStats: {
    totalUsers: number
    totalQueries: number
    activeUsers: number
    conversionRate: number
    newUsers: number
    newQueries: number
    totalProjects: number
    conversionRateChange: number
  }
}

export function AdminRealTimeStats({ initialStats }: AdminRealTimeStatsProps) {
  const [stats, setStats] = useState(initialStats)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isLive, setIsLive] = useState(true)

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      // Simulate random changes to stats
      const randomChange = () => Math.floor(Math.random() * 3) - 1 // -1, 0, or 1

      const newStats = {
        ...stats,
        totalUsers: Math.max(0, stats.totalUsers + (Math.random() > 0.7 ? 1 : 0)),
        activeUsers: Math.max(0, stats.activeUsers + randomChange()),
        totalQueries: Math.max(0, stats.totalQueries + (Math.random() > 0.5 ? Math.floor(Math.random() * 3) : 0)),
        newQueries: Math.max(0, stats.newQueries + (Math.random() > 0.6 ? 1 : 0)),
        totalProjects: Math.max(0, stats.totalProjects + (Math.random() > 0.8 ? 1 : 0)),
      }

      // Show notifications for significant changes
      if (newStats.totalUsers > stats.totalUsers) {
        toast.info("New user registered", {
          description: `Total users: ${newStats.totalUsers}`,
        })
      }

      if (newStats.totalProjects > stats.totalProjects) {
        toast.info("New project created", {
          description: `Total projects: ${newStats.totalProjects}`,
        })
      }

      if (newStats.newQueries > stats.newQueries + 2) {
        toast.info("Increased AI assistant usage", {
          description: `${newStats.newQueries} queries today`,
        })
      }

      setStats(newStats)
      setLastUpdated(new Date())
    }, 15000) // Update every 15 seconds

    return () => clearInterval(interval)
  }, [stats, isLive])

  const toggleLiveUpdates = () => {
    setIsLive(!isLive)
    toast.success(isLive ? "Live updates paused" : "Live updates enabled", {
      description: isLive ? "Real-time data updates paused" : "Dashboard will update in real-time",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Dashboard Overview</h2>
        <div className="flex items-center gap-2">
          <Badge
            variant={isLive ? "default" : "outline"}
            className={`cursor-pointer ${isLive ? "bg-green-600 hover:bg-green-700" : ""}`}
            onClick={toggleLiveUpdates}
          >
            <Activity className="mr-1 h-3 w-3" />
            {isLive ? "Live Updates" : "Updates Paused"}
          </Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                <TrendingUp className="mr-1 h-3 w-3" />+{stats.newUsers || 2}
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stats.newUsers || 2} new users this week</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <div className="h-8 w-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalQueries}</div>
              <div className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                <TrendingUp className="mr-1 h-3 w-3" />+{stats.newQueries || 8}
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stats.newQueries || 8} queries today</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalProjects || 12}</div>
              <div className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                <TrendingUp className="mr-1 h-3 w-3" />+{stats.newUsers || 3}
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats.newUsers || 3} new projects this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <div
                className={`flex items-center text-xs font-medium ${stats.conversionRateChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {stats.conversionRateChange >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {stats.conversionRateChange >= 0 ? "+" : ""}
                {stats.conversionRateChange || 5}%
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {Math.abs(stats.conversionRateChange || 5)}% {stats.conversionRateChange >= 0 ? "increase" : "decrease"}{" "}
              from last month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

