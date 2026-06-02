"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: any
  darkMode: boolean
  setDarkMode: (darkMode: boolean) => void
  notifications: boolean
  setNotifications: (notifications: boolean) => void
  userStatus: string
  setUserStatus: (status: string) => void
  onUserUpdate?: (updatedUser: any) => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  user,
  darkMode,
  setDarkMode,
  notifications,
  setNotifications,
  userStatus,
  setUserStatus,
  onUserUpdate,
}: SettingsDialogProps) {
  const { toast } = useToast()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateProfile",
          userId: user.id,
          name,
          email,
        }),
      })

      const data = await res.json()

      if (data.success) {
        // Update current user locally
        const updatedUser = { ...user, name, email }
        localStorage.setItem("user", JSON.stringify(updatedUser))

        if (onUserUpdate) {
          onUserUpdate(updatedUser)
        }

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        })
      } else {
        toast({
          title: "Error updating profile",
          description: data.error || "An error occurred",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("Profile update error:", err)
      toast({
        title: "Error",
        description: "Could not update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleChangePassword = async () => {
    if (!user) return

    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      })
      return
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "changePassword",
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()

      if (data.success) {
        // Clear password fields
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")

        toast({
          title: "Password updated",
          description: "Your password has been changed successfully",
        })
      } else {
        toast({
          title: "Error changing password",
          description: data.error || "An error occurred",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("Password update error:", err)
      toast({
        title: "Error",
        description: "Could not change password. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Settings</DialogTitle>
        </DialogHeader>
        <div className="flex border-b">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "general" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "profile" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "security" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("security")}
          >
            Security
          </button>
        </div>

        {activeTab === "general" && (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <div className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark themes</div>
              </div>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notifications</Label>
                <div className="text-sm text-gray-500 dark:text-gray-400">Receive notifications for new messages</div>
              </div>
              <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup value={userStatus} onValueChange={setUserStatus} className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="available" id="available" />
                  <Label htmlFor="available" className="flex items-center gap-2 font-normal">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Available
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="busy" id="busy" />
                  <Label htmlFor="busy" className="flex items-center gap-2 font-normal">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Busy
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="away" id="away" />
                  <Label htmlFor="away" className="flex items-center gap-2 font-normal">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    Away
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="offline" id="offline" />
                  <Label htmlFor="offline" className="flex items-center gap-2 font-normal">
                    <span className="h-2 w-2 rounded-full bg-gray-500" />
                    Appear Offline
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">{user ? getInitials(user.name) : ""}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                Change Avatar
              </Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleChangePassword}>Change Password</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
