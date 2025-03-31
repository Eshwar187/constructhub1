"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Users, Building2, MessageSquare, DollarSign } from "lucide-react"

interface StatsProps {
  totalUsers: number
  activeUsers: number
  totalProjects: number
  completedProjects: number
  totalQueries: number
  resolvedQueries: number
  totalRevenue: number
}

interface AdminRealTimeStatsProps {
  stats?: StatsProps
  isLoading?: boolean
}

export function AdminRealTimeStats({
  stats = {
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    completedProjects: 0,
    totalQueries: 0,
    resolvedQueries: 0,
    totalRevenue: 0,
  },
  isLoading = false,
}: AdminRealTimeStatsProps) {
  const [currentStats, setCurrentStats] = useState(stats)

  useEffect(() => {
    if (stats) {
      setCurrentStats(stats)
    }
  }, [stats])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex animate-pulse space-y-3">
                <div className="h-14 w-14 rounded-lg bg-muted"></div>
                <div className="space-y-2 flex-1 ml-4">
                  <div className="h-4 w-1/2 rounded bg-muted"></div>
                  <div className="h-6 w-1/3 rounded bg-muted"></div>
                  <div className="h-4 w-1/4 rounded bg-muted"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <h3 className="text-2xl font-bold mt-1">{currentStats.totalUsers.toLocaleString()}</h3>
              <div className="flex items-center mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs font-medium text-green-500">+12.5%</span>
                <span className="text-xs text-muted-foreground ml-1">vs last month</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
              <h3 className="text-2xl font-bold mt-1">{currentStats.totalProjects.toLocaleString()}</h3>
              <div className="flex items-center mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs font-medium text-green-500">+8.2%</span>
                <span className="text-xs text-muted-foreground ml-1">vs last month</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Queries</p>
              <h3 className="text-2xl font-bold mt-1">{currentStats.totalQueries.toLocaleString()}</h3>
              <div className="flex items-center mt-1">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs font-medium text-green-500">+24.8%</span>
                <span className="text-xs text-muted-foreground ml-1">vs last month</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1">₹{currentStats.totalRevenue.toLocaleString()}</h3>
              <div className="flex items-center mt-1">
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-xs font-medium text-red-500">-3.1%</span>
                <span className="text-xs text-muted-foreground ml-1">vs last month</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

