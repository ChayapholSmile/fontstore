"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, Check } from "lucide-react"
import { useLanguage } from "@/lib/contexts/LanguageContext"

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  fontId?: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { t } = useLanguage()

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2 border-b">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className="flex items-start gap-2 p-3 cursor-pointer"
                onClick={() => !notification.read && markAsRead(notification._id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{notification.title}</h4>
                    {!notification.read && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      markAsRead(notification._id)
                    }}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
