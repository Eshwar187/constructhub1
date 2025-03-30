"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, Shield, Bell, Search, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { toast } from "sonner"

export function AdminHeader() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New user registered",
      description: "A new user has registered on the platform",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: 2,
      title: "System update",
      description: "New features have been deployed",
      time: "2 hours ago",
      read: false,
    },
  ])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/admin-logout", {
        method: "POST",
      })

      toast.success("Logged out", {
        description: "You have been logged out of the admin panel.",
      })

      router.push("/admin/login")
    } catch (error) {
      toast.error("Error", {
        description: "Failed to log out. Please try again.",
      })
    }
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
    toast.success("All notifications marked as read")
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="container mx-auto py-3 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2 md:hidden">
          <Shield className="h-6 w-6 text-amber-500" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
            Admin
          </h1>
        </div>

        <div className="hidden md:flex relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search users, queries, projects..."
            className="pl-10 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-slate-200 dark:border-slate-700"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem] text-slate-700" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-slate-200 dark:border-slate-700 relative"
              >
                <Bell className="h-[1.2rem] w-[1.2rem]" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Notifications</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                <>
                  {notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3 cursor-pointer">
                      <div className="flex items-start gap-2 w-full">
                        <div
                          className={`h-2 w-2 rounded-full mt-1.5 ${notification.read ? "bg-slate-300 dark:bg-slate-600" : "bg-amber-500"}`}
                        ></div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {notification.description}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-amber-600 dark:text-amber-400">
                    View all notifications
                  </DropdownMenuItem>
                </>
              ) : (
                <div className="py-4 text-center text-slate-500 dark:text-slate-400">No notifications</div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
              >
                <Shield className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Admin menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                <span>eshwar@admin.com</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/admin/settings" className="flex items-center w-full">
                  Admin Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

