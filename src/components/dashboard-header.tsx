"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { Bell, Search, Moon, Sun, Menu } from "lucide-react"
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
import { Logo } from "@/components/logo"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DashboardHeader() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Project updated",
      description: "Your project 'Modern Villa' has been updated",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: 2,
      title: "New message",
      description: "You have a new message from Designer",
      time: "2 hours ago",
      read: false,
    },
  ])

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="container mx-auto py-3 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <div className="hidden md:block">
            <Logo size="sm" />
          </div>
        </div>

        <div className="hidden md:flex relative max-w-md w-full mx-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search projects, materials, designers..."
            className="pl-10 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
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
              <Moon className="h-[1.2rem] w-[1.2rem]" />
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
                          className={`h-2 w-2 rounded-full mt-1.5 ${
                            notification.read ? "bg-slate-300 dark:bg-slate-600" : "bg-amber-500"
                          }`}
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

          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "w-9 h-9",
                userButtonTrigger: "focus:shadow-none focus:ring-2 focus:ring-amber-500 rounded-full",
              },
            }}
            afterSignOutUrl="/"
          />
        </div>
      </div>
    </header>
  )
}

