"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Phone, Video } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface CallNotificationProps {
  callerName: string
  callerInitials: string
  isVideo: boolean
  onAccept: () => void
  onDecline: () => void
}

export function CallNotification({ callerName, callerInitials, isVideo, onAccept, onDecline }: CallNotificationProps) {
  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center">
      <Card className="w-full max-w-sm animate-in fade-in slide-in-from-top-5 duration-300">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>{callerInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-medium">{callerName}</h4>
              <p className="text-sm text-gray-500">Incoming {isVideo ? "video" : "audio"} call...</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="destructive" size="icon" className="rounded-full" onClick={onDecline}>
                <Phone className="h-4 w-4 rotate-135" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="rounded-full bg-green-600 hover:bg-green-700"
                onClick={onAccept}
              >
                {isVideo ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
