"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  BarChart3,
  Shield,
  Layers,
  Bell,
  Database,
  LogOut,
} from "lucide-react"
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
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => {
    return pathname === path
  }

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

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <SidebarHeader className="flex items-center gap-2 px-4 py-4">
          <Shield className="h-6 w-6 text-amber-500" />
          <span className="font-bold text-lg bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
            Admin Panel
          </span>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/dashboard")}>
                <Link href="/admin/dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/users")}>
                <Link href="/admin/users">
                  <Users className="h-5 w-5" />
                  <span>Users</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/queries")}>
                <Link href="/admin/queries">
                  <MessageSquare className="h-5 w-5" />
                  <span>User Queries</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/projects")}>
                <Link href="/admin/projects">
                  <Building2 className="h-5 w-5" />
                  <span>Projects</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/floor-plans")}>
                <Link href="/admin/floor-plans">
                  <Layers className="h-5 w-5" />
                  <span>Floor Plans</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/analytics")}>
                <Link href="/admin/analytics">
                  <BarChart3 className="h-5 w-5" />
                  <span>Analytics</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/notifications")}>
                <Link href="/admin/notifications">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/database")}>
                <Link href="/admin/database">
                  <Database className="h-5 w-5" />
                  <span>Database</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/settings")}>
                <Link href="/admin/settings">
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
                <Link href="/">
                  <Building2 className="h-5 w-5" />
                  <span>View Site</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarTrigger className="absolute top-3 -right-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-md" />
      </Sidebar>
    </SidebarProvider>
  )
}

