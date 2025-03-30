"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Download,
  RefreshCw,
  Users,
  MessageSquare,
  Building2,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState("month")
  const [authError, setAuthError] = useState(false)

  // Check if user is admin
  const checkAdmin = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/check-admin")
      if (!response.ok) {
        setAuthError(true)
        router.push("/admin/login")
      } else {
        setIsAdmin(true)
        fetchData()
      }
    } catch (error) {
      setAuthError(true)
      router.push("/admin/login")
    }
  }, [router])

  useEffect(() => {
    checkAdmin()
  }, [checkAdmin])

  // Fetch analytics data
  const fetchData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      // In a real app, this would fetch analytics data from the API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      toast.error("Error loading analytics", {
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const handleRefresh = () => {
    fetchData()
    toast.success("Analytics refreshed", {
      description: "The analytics data has been updated.",
    })
  }

  const handleExport = () => {
    // In a real app, this would export the analytics data to CSV
    toast.success("Analytics exported", {
      description: "The analytics data has been exported to CSV.",
    })
  }

  if (authError) {
    return null // Don't render anything if there's an auth error, we'll redirect
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Checking permissions...</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Verifying your admin access</p>
          <div className="h-2 w-48 mx-auto bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Comprehensive analytics and insights for BuildWise AI platform
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[130px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                variant="outline"
                className="gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</CardTitle>
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,248</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <span className="i-lucide-trending-up mr-1"></span>
                  +12% from last {timeRange}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">AI Queries</CardTitle>
                <div className="h-8 w-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8,549</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <span className="i-lucide-trending-up mr-1"></span>
                  +24% from last {timeRange}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Projects</CardTitle>
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3,721</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <span className="i-lucide-trending-up mr-1"></span>
                  +18% from last {timeRange}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Floor Plans</CardTitle>
                <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,845</div>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <span className="i-lucide-trending-up mr-1"></span>
                  +15% from last {timeRange}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                      Interactive charts will be displayed here with real-time data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Query Analytics</CardTitle>
                <CardDescription>AI assistant usage patterns</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                      Interactive charts will be displayed here with real-time data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Project Distribution</CardTitle>
                <CardDescription>Projects by location and budget</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                      Interactive charts will be displayed here with real-time data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>Most used platform features</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                      Interactive charts will be displayed here with real-time data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

