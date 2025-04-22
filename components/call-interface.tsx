"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Phone, Video, VideoOff, Volume2, VolumeX } from "lucide-react"
import type { RTCConnection } from "@/utils/media-utils"

interface CallInterfaceProps {
  contactName: string
  contactInitials: string
  isVideo: boolean
  isIncoming: boolean
  callId: string
  onAccept: () => void
  onDecline: () => void
  onEnd: () => void
  rtcConnection: RTCConnection | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
}

export function CallInterface({
  contactName,
  contactInitials,
  isVideo,
  isIncoming,
  callId,
  onAccept,
  onDecline,
  onEnd,
  rtcConnection,
  localStream,
  remoteStream,
}: CallInterfaceProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(!isVideo)
  const [isSpeakerOff, setIsSpeakerOff] = useState(false)
  const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "ended">(
    isIncoming ? "connecting" : "connected",
  )
  const [callDuration, setCallDuration] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Set up local and remote video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }

    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
      setCallStatus("connected")

      // Start call timer
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1)
        }, 1000)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [localStream, remoteStream])

  // Handle mute/unmute
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted
      })
      setIsMuted(!isMuted)
    }
  }

  // Handle video on/off
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  // Handle speaker on/off
  const toggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !isSpeakerOff
      setIsSpeakerOff(!isSpeakerOff)
    }
  }

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="relative w-full max-w-md overflow-hidden rounded-lg">
        {/* Video container */}
        <div className="relative aspect-video bg-gray-900">
          {isVideo && (
            <>
              {/* Remote video (full size) */}
              {remoteStream && (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                  muted={isSpeakerOff}
                />
              )}

              {/* Local video (picture-in-picture) */}
              {localStream && (
                <div className="absolute bottom-4 right-4 h-1/4 w-1/4 overflow-hidden rounded-lg border-2 border-white">
                  <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                </div>
              )}
            </>
          )}

          {/* Avatar fallback for audio calls or when video is off */}
          {(!isVideo || !remoteStream || isVideoOff) && (
            <div className="flex h-full w-full items-center justify-center">
              <Avatar className="h-32 w-32">
                <AvatarFallback className="text-4xl">{contactInitials}</AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Call status overlay */}
          <div className="absolute inset-x-0 top-4 flex justify-center">
            <div className="rounded-full bg-black/50 px-4 py-1 text-white">
              {callStatus === "connecting" ? "Connecting..." : formatDuration(callDuration)}
            </div>
          </div>
        </div>

        {/* Call controls */}
        <div className="bg-white p-4 dark:bg-gray-800">
          <div className="mb-4 text-center">
            <h3 className="text-lg font-medium">{contactName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {callStatus === "connecting" ? "Calling..." : "In call"}
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            {/* Mute button */}
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${isMuted ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400" : ""}`}
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {/* End call button */}
            <Button variant="destructive" size="icon" className="rounded-full" onClick={onEnd}>
              <Phone className="h-5 w-5 rotate-135" />
            </Button>

            {/* Video toggle button (only for video calls) */}
            {isVideo && (
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full ${
                  isVideoOff ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400" : ""
                }`}
                onClick={toggleVideo}
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
            )}

            {/* Speaker toggle button */}
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${
                isSpeakerOff ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400" : ""
              }`}
              onClick={toggleSpeaker}
            >
              {isSpeakerOff ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>

          {/* Accept/Decline buttons for incoming calls */}
          {isIncoming && callStatus === "connecting" && (
            <div className="mt-4 flex justify-center space-x-4">
              <Button variant="destructive" onClick={onDecline}>
                Decline
              </Button>
              <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={onAccept}>
                Accept
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
