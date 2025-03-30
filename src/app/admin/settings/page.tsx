"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Save, Loader2, Shield, Bell, Database, Globe, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"

const generalFormSchema = z.object({
  siteName: z.string().min(1, { message: "Site name is required" }),
  siteUrl: z.string().url({ message: "Please enter a valid URL" }),
  contactEmail: z.string().email({ message: "Please enter a valid email" }),
  maxProjectsPerUser: z.string().min(1, { message: "Required" }),
  defaultBudgetCategory: z.string().min(1, { message: "Required" }),
})

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  userRegistrationAlerts: z.boolean(),
  projectCreationAlerts: z.boolean(),
  aiQueryAlerts: z.boolean(),
  dailyReportEmail: z.boolean(),
  weeklyReportEmail: z.boolean(),
})

const apiFormSchema = z.object({
  openaiApiKey: z.string().min(1, { message: "API key is required" }),
  mailjetApiKey: z.string().min(1, { message: "API key is required" }),
  mailjetSecretKey: z.string().min(1, { message: "Secret key is required" }),
  vercelAiApiKey: z.string().min(1, { message: "API key is required" }),
})

export default function AdminSettingsPage() {
  const [isGeneralSubmitting, setIsGeneralSubmitting] = useState(false)
  const [isNotificationSubmitting, setIsNotificationSubmitting] = useState(false)
  const [isApiSubmitting, setIsApiSubmitting] = useState(false)

  const generalForm = useForm<z.infer<typeof generalFormSchema>>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      siteName: "BuildWise AI",
      siteUrl: "https://buildwise.ai",
      contactEmail: "admin@buildwise.ai",
      maxProjectsPerUser: "10",
      defaultBudgetCategory: "medium",
    },
  })

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      userRegistrationAlerts: true,
      projectCreationAlerts: true,
      aiQueryAlerts: false,
      dailyReportEmail: false,
      weeklyReportEmail: true,
    },
  })

  const apiForm = useForm<z.infer<typeof apiFormSchema>>({
    resolver: zodResolver(apiFormSchema),
    defaultValues: {
      openaiApiKey: "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",
      mailjetApiKey: "f1cd4094579f3af884060150d9144558",
      mailjetSecretKey: "91b7cd6d9a4808146a731815a27aad7a",
      vercelAiApiKey: "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",
    },
  })

  const onGeneralSubmit = async (values: z.infer<typeof generalFormSchema>) => {
    setIsGeneralSubmitting(true)
    try {
      // In a real app, this would be an API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Settings saved", {
        description: "General settings have been updated successfully.",
      })
    } catch (error) {
      toast.error("Failed to save settings", {
        description: "An error occurred while saving general settings.",
      })
    } finally {
      setIsGeneralSubmitting(false)
    }
  }

  const onNotificationSubmit = async (values: z.infer<typeof notificationFormSchema>) => {
    setIsNotificationSubmitting(true)
    try {
      // In a real app, this would be an API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Notification settings saved", {
        description: "Your notification preferences have been updated.",
      })
    } catch (error) {
      toast.error("Failed to save settings", {
        description: "An error occurred while saving notification settings.",
      })
    } finally {
      setIsNotificationSubmitting(false)
    }
  }

  const onApiSubmit = async (values: z.infer<typeof apiFormSchema>) => {
    setIsApiSubmitting(true)
    try {
      // In a real app, this would be an API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("API settings saved", {
        description: "Your API keys have been updated successfully.",
      })
    } catch (error) {
      toast.error("Failed to save settings", {
        description: "An error occurred while saving API settings.",
      })
    } finally {
      setIsApiSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
              Admin Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Configure system settings and preferences for BuildWise AI
            </p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-1">
              <TabsTrigger value="general" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <Globe className="mr-2 h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="api" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <Key className="mr-2 h-4 w-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <Shield className="mr-2 h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="database" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <Database className="mr-2 h-4 w-4" />
                Database
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure basic settings for your BuildWise AI platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...generalForm}>
                    <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                      <FormField
                        control={generalForm.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>The name of your BuildWise AI instance</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={generalForm.control}
                          name="siteUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Site URL</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>The URL where your site is hosted</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={generalForm.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Email</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>Email for system notifications</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={generalForm.control}
                          name="maxProjectsPerUser"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Projects Per User</FormLabel>
                              <FormControl>
                                <Input {...field} type="number" min="1" max="100" />
                              </FormControl>
                              <FormDescription>Maximum number of projects a user can create</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={generalForm.control}
                          name="defaultBudgetCategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Budget Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select budget category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low (Under ₹20 Lakhs)</SelectItem>
                                  <SelectItem value="medium">Medium (₹20-50 Lakhs)</SelectItem>
                                  <SelectItem value="high">High (Above ₹50 Lakhs)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>Default budget category for new projects</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-amber-500 hover:bg-amber-600 text-black"
                          disabled={isGeneralSubmitting}
                        >
                          {isGeneralSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Settings
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure when and how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>Receive notifications via email</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Admin Alerts</h3>

                        <FormField
                          control={notificationForm.control}
                          name="userRegistrationAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>User Registration</FormLabel>
                                <FormDescription>Get notified when a new user registers</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="projectCreationAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Project Creation</FormLabel>
                                <FormDescription>Get notified when a new project is created</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="aiQueryAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>AI Queries</FormLabel>
                                <FormDescription>Get notified for each AI assistant query</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Reports</h3>

                        <FormField
                          control={notificationForm.control}
                          name="dailyReportEmail"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Daily Report</FormLabel>
                                <FormDescription>Receive a daily summary report</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="weeklyReportEmail"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Weekly Report</FormLabel>
                                <FormDescription>Receive a weekly summary report</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-amber-500 hover:bg-amber-600 text-black"
                          disabled={isNotificationSubmitting}
                        >
                          {isNotificationSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Preferences
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="api">
              <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage API keys for third-party services</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...apiForm}>
                    <form onSubmit={apiForm.handleSubmit(onApiSubmit)} className="space-y-6">
                      <FormField
                        control={apiForm.control}
                        name="openaiApiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>OpenAI API Key</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormDescription>Used for AI assistant and floor plan generation</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={apiForm.control}
                          name="mailjetApiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mailjet API Key</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormDescription>For sending emails and notifications</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={apiForm.control}
                          name="mailjetSecretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mailjet Secret Key</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" />
                              </FormControl>
                              <FormDescription>Secret key for Mailjet API</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={apiForm.control}
                        name="vercelAiApiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vercel AI API Key</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormDescription>For Vercel AI SDK integration</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-amber-500 hover:bg-amber-600 text-black"
                          disabled={isApiSubmitting}
                        >
                          {isApiSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save API Keys
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Configure security settings for your platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <h3 className="text-base font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Require 2FA for admin accounts</p>
                      </div>
                      <Switch checked={true} />
                    </div>

                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <h3 className="text-base font-medium">Session Timeout</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Automatically log out after 24 hours of inactivity
                        </p>
                      </div>
                      <Switch checked={true} />
                    </div>

                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <h3 className="text-base font-medium">IP Restriction</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Restrict admin access to specific IP addresses
                        </p>
                      </div>
                      <Switch checked={false} />
                    </div>

                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <h3 className="text-base font-medium">Password Policy</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Require strong passwords (min 8 chars, special chars, numbers)
                        </p>
                      </div>
                      <Switch checked={true} />
                    </div>

                    <div className="flex justify-end">
                      <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                        <Save className="mr-2 h-4 w-4" />
                        Save Security Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="database">
              <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>Database Management</CardTitle>
                  <CardDescription>Manage database settings and perform maintenance tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Database Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Connection:</span>
                              <span className="text-sm font-medium text-green-600">Connected</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Type:</span>
                              <span className="text-sm font-medium">MongoDB Atlas</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Size:</span>
                              <span className="text-sm font-medium">1.2 GB</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Documents:</span>
                              <span className="text-sm font-medium">12,458</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Backup Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Last Backup:</span>
                              <span className="text-sm font-medium">Today, 04:30 AM</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Backup Size:</span>
                              <span className="text-sm font-medium">1.1 GB</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Schedule:</span>
                              <span className="text-sm font-medium">Daily</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-slate-500 dark:text-slate-400">Retention:</span>
                              <span className="text-sm font-medium">30 days</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Maintenance Tasks</h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                          variant="outline"
                          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                        >
                          <Database className="h-5 w-5 text-amber-500" />
                          <span>Backup Now</span>
                        </Button>

                        <Button
                          variant="outline"
                          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                        >
                          <Shield className="h-5 w-5 text-amber-500" />
                          <span>Optimize Database</span>
                        </Button>

                        <Button
                          variant="outline"
                          className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                        >
                          <Bell className="h-5 w-5 text-amber-500" />
                          <span>Clear Old Logs</span>
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Database Connection</h3>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <h3 className="text-base font-medium">Connection String</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                              mongodb+srv://******:******@cluster0.mongodb.net/buildwise
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Show
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                        <Save className="mr-2 h-4 w-4" />
                        Save Database Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

