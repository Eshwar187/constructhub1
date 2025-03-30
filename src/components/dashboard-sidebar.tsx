"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, FileText, Settings, HelpCircle, User, Layers, Paintbrush, Users } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/logo"

export function DashboardSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true
    }
    if (path !== "/dashboard" && pathname?.startsWith(path)) {
      return true
    }
    return false
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <SidebarHeader className="flex items-center gap-2 px-4 py-4">
          <Logo size="sm" />
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                <Link href="/dashboard">
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard/projects")}>
                <Link href="/dashboard/projects">
                  <FileText className="h-5 w-5" />
                  <span>My Projects</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard/chat")}>
                <Link href="/dashboard/chat">
                  <MessageSquare className="h-5 w-5" />
                  <span>AI Assistant</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard/floor-plans")}>
                <Link href="/dashboard/floor-plans">
                  <Layers className="h-5 w-5" />
                  <span>Floor Plans</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard/materials")}>
                <Link href="/dashboard/materials">
                  <Paintbrush className="h-5 w-5" />
                  <span>Materials</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard/designers")}>
                <Link href="/dashboard/designers">
                  <Users className="h-5 w-5" />
                  <span>Designers</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard/profile")}>
                <Link href="/dashboard/profile">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/dashboard/settings")}>
                <Link href="/dashboard/settings">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-slate-200 dark:border-slate-700">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/help">
                  <HelpCircle className="h-5 w-5" />
                  <span>Help & Support</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarTrigger className="absolute top-3 -right-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-md" />
      </Sidebar>
    </SidebarProvider>
  )
}

