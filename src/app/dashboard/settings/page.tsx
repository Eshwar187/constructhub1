"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Shield, Key, User, Save, Loader2, Bell, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

const securityFormSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  company: z.string().optional(),
})

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  projectUpdates: z.boolean(),
  securityAlerts: z.boolean(),
  marketingEmails: z.boolean(),
})

const preferencesFormSchema = z.object({
  language: z.string(),
  theme: z.string(),
  currency: z.string(),
  areaUnit: z.string(),
})

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userPreferences, setUserPreferences] = useState<any>({
    language: "en",
    theme: "system",
    currency: "USD",
    areaUnit: "sqft",
  })
  const [userNotifications, setUserNotifications] = useState<any>({
    emailNotifications: true,
    projectUpdates: true,
    securityAlerts: true,
    marketingEmails: false,
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/user/profile")
          if (response.ok) {
            const data = await response.json()
            setUserProfile(data.user)

            // Set preferences if available
            if (data.user.preferences) {
              setUserPreferences(data.user.preferences)
            }

            // Set notification settings if available
            if (data.user.notifications) {
              setUserNotifications(data.user.notifications)
            }
          } else {
            toast.error("Failed to load profile", {
              description: "Please try again later.",
            })
          }
        } catch (error) {
          console.error("Error fetching profile:", error)
          toast.error("Error loading profile", {
            description: "An unexpected error occurred.",
          })
        }
      }
    }

    if (status === "authenticated") {
      fetchUserProfile()
    }
  }, [status])

  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
    },
  })

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: userNotifications,
  })

  const preferencesForm = useForm<z.infer<typeof preferencesFormSchema>>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: userPreferences,
  })

  // Update form values when user profile is loaded
  useEffect(() => {
    if (userProfile) {
      profileForm.reset({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        company: userProfile.company || "",
      })
    }
  }, [userProfile, profileForm])

  // Update form values when user preferences are loaded
  useEffect(() => {
    if (userPreferences) {
      preferencesForm.reset(userPreferences)
    }
  }, [userPreferences, preferencesForm])

  // Update form values when user notification settings are loaded
  useEffect(() => {
    if (userNotifications) {
      notificationForm.reset(userNotifications)
    }
  }, [userNotifications, notificationForm])

  const handleChangePassword = async (values: z.infer<typeof securityFormSchema>) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      })

      if (response.ok) {
        securityForm.reset()
        toast.success("Password updated", {
          description: "Your password has been changed successfully.",
        })
      } else {
        const error = await response.json()
        toast.error("Failed to update password", {
          description: error.message || "Please try again later.",
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateProfile = async (values: z.infer<typeof profileFormSchema>) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.user)

        // Update session data
        await update({
          ...session,
          user: {
            ...session?.user,
            name: values.name,
          },
        })

        toast.success("Profile updated", {
          description: "Your profile has been updated successfully.",
        })
      } else {
        const error = await response.json()
        toast.error("Failed to update profile", {
          description: error.message || "Please try again later.",
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateNotifications = async (values: z.infer<typeof notificationFormSchema>) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        setUserNotifications(values)
        toast.success("Notification preferences updated", {
          description: "Your notification settings have been updated successfully.",
        })
      } else {
        const error = await response.json()
        toast.error("Failed to update notification preferences", {
          description: error.message || "Please try again later.",
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePreferences = async (values: z.infer<typeof preferencesFormSchema>) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        setUserPreferences(values)
        toast.success("Preferences updated", {
          description: "Your preferences have been updated successfully.",
        })
      } else {
        const error = await response.json()
        toast.error("Failed to update preferences", {
          description: error.message || "Please try again later.",
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col">
        <DashboardHeader />

        <main className="flex-1 container mx-auto py-6 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold">Account Settings</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account settings and preferences</p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1">
              <TabsTrigger value="profile" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
              >
                <Palette className="h-4 w-4 mr-2" />
                Preferences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>Optional</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>Optional</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-amber-500 hover:bg-amber-600 text-black"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
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
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Update your password and security preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Form {...securityForm}>
                    <form onSubmit={securityForm.handleSubmit(handleChangePassword)} className="space-y-4">
                      <FormField
                        control={securityForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={securityForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 8 characters and include uppercase, lowercase, and numbers
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={securityForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-amber-500 hover:bg-amber-600 text-black"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Key className="mr-2 h-4 w-4" />
                              Change Password
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="2fa" className="text-base">
                          Enable Two-Factor Authentication
                        </Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch id="2fa" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Session Management</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sessions" className="text-base">
                          Active Sessions
                        </Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          You are currently logged in on 1 device
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage Sessions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Control how and when you receive notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(handleUpdateNotifications)} className="space-y-4">
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

                      <FormField
                        control={notificationForm.control}
                        name="projectUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Project Updates</FormLabel>
                              <FormDescription>Get notified about changes to your projects</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="securityAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Security Alerts</FormLabel>
                              <FormDescription>Receive alerts about security-related activities</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="marketingEmails"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Marketing Emails</FormLabel>
                              <FormDescription>Receive emails about new features and offers</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-amber-500 hover:bg-amber-600 text-black"
                          disabled={isSaving}
                        >
                          {isSaving ? (
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

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>User Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...preferencesForm}>
                    <form onSubmit={preferencesForm.handleSubmit(handleUpdatePreferences)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={preferencesForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="en">English</SelectItem>
                                  <SelectItem value="hi">Hindi</SelectItem>
                                  <SelectItem value="es">Spanish</SelectItem>
                                  <SelectItem value="fr">French</SelectItem>
                                  <SelectItem value="de">German</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={preferencesForm.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Theme</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select theme" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="dark">Dark</SelectItem>
                                  <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={preferencesForm.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Currency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                  <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                                  <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                                  <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={preferencesForm.control}
                          name="areaUnit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Area Unit</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select area unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="sqft">Square Feet (sq ft)</SelectItem>
                                  <SelectItem value="sqm">Square Meters (sq m)</SelectItem>
                                  <SelectItem value="acres">Acres</SelectItem>
                                  <SelectItem value="hectares">Hectares</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          className="bg-amber-500 hover:bg-amber-600 text-black"
                          disabled={isSaving}
                        >
                          {isSaving ? (
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
          </Tabs>
        </main>
      </div>
    </div>
  )
}

