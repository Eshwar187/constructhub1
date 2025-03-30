"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Bell, RefreshCw, Download, Trash2, Send } from "lucide-react"
import { toast } from "sonner"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"

interface Notification {
  id: string
  title: string
  message: string
  type: "system" | "user" | "project" | "alert"
  status: "sent" | "scheduled" | "draft"
  recipients: string
  createdAt: string
  scheduledFor?: string
}

export default function Notifications() {
  const [newNotification, setNewNotification] = useState<Partial<Notification>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Refresh logic here
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExport = () => {
    // Export logic here
    toast.success("Notifications exported successfully!");
  };

  const handleCreateNotification = () => {
    // Create notification logic here
    toast.success("Notification created successfully!");
  };

  const handleSendNow = (id: string) => {
    // Send notification logic here
    toast.success("Notification sent successfully!");
  };

  const handleDelete = (id: string) => {
    // Delete notification logic here
    toast.success("Notification deleted successfully!");
  };

  useEffect(() => {
    // Fetch notifications logic here
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage system notifications and alerts
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* New Notification Form */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Notification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as "system" | "user" | "project" | "alert" })}
                  className="w-full p-2 border rounded dark:bg-slate-700"
                >
                  <option value="system">System</option>
                  <option value="user">User</option>
                  <option value="project">Project</option>
                  <option value="alert">Alert</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-slate-700 min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Recipients</label>
                <select
                  value={newNotification.recipients}
                  onChange={(e) => setNewNotification({ ...newNotification, recipients: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-slate-700"
                >
                  <option value="all">All Users</option>
                  <option value="new_users">New Users</option>
                  <option value="active_users">Active Users</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Schedule (optional)</label>
                <input
                  type="datetime-local"
                  value={newNotification.scheduledFor}
                  onChange={(e) => setNewNotification({ ...newNotification, scheduledFor: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-slate-700"
                />
              </div>
            </div>
            <button
              onClick={handleCreateNotification}
              className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              Create Notification
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search notifications..."
                  className="w-full p-2 border rounded dark:bg-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-slate-700"
                >
                  <option value="all">All Types</option>
                  <option value="system">System</option>
                  <option value="user">User</option>
                  <option value="project">Project</option>
                  <option value="alert">Alert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-slate-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="sent">Sent</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-slate-700"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="title">Title</option>
                  <option value="type">Type</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
            {isLoading ? (
              <div className="p-6 text-center">
                <Bell className="h-12 w-12 text-amber-500 mx-auto mb-4 animate-pulse" />
                <p>Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p>No notifications found</p>
              </div>
            ) : (
              <div className="divide-y dark:divide-slate-700">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                          {notification.message}
                        </p>
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>Type: {notification.type} | </span>
                          <span>Status: {notification.status} | </span>
                          <span>Recipients: {notification.recipients} | </span>
                          <span>Created: {new Date(notification.createdAt).toLocaleString()}</span>
                          {notification.scheduledFor && (
                            <span> | Scheduled: {new Date(notification.scheduledFor).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {notification.status === "draft" && (
                          <button
                            onClick={() => handleSendNow(notification.id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}