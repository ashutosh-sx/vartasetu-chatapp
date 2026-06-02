"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LogOut,
  Send,
  Menu,
  MessageSquare,
  Settings,
  Search,
  Trash2,
  MoreVertical,
  UserMinus,
  Check,
  X,
  Smile,
  Phone,
  Video,
  UserPlus,
  Shield,
  Info,
  ChevronLeft,
  Filter,
  Paperclip,
  File,
  User,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { RTCConnection, requestMediaPermissions, selectFiles, createObjectURL } from "@/utils/media-utils"
import Image from "next/image"
import { SettingsDialog } from "@/components/settings-dialog"

type UserType = {
  id: string
  name: string
  email: string
  avatar?: string
  online?: boolean
  darkMode?: boolean
  notifications?: boolean
  lastSeen?: number
  status?: string
  typing?: { [key: string]: boolean }
}

type ContactStatus = "accepted" | "pending" | "blocked" | "sent"

type Contact = {
  id: string
  userId: string
  contactId: string
  name: string
  email: string
  status: ContactStatus
  lastMessage: string
  time: string
  unread: number
  online: boolean
  avatar?: string
  typing?: boolean
  lastSeen?: number | string
}

type MessageType = "text" | "image" | "video" | "audio" | "file"

type Message = {
  id: string
  senderId: string
  receiverId: string
  text: string
  timestamp: number
  edited?: boolean
  read?: boolean
  delivered?: boolean
  conversationId: string
  reactions?: { [userId: string]: string }
  type: MessageType
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileMimeType?: string
}

type CallType = "audio" | "video"

type Call = {
  id: string
  callerId: string
  receiverId: string
  type: CallType
  status: "ringing" | "ongoing" | "ended" | "missed" | "rejected"
  startTime: number
  endTime?: number
  offer?: RTCSessionDescriptionInit
  answer?: RTCSessionDescriptionInit
  iceCandidates?: RTCIceCandidate[]
}

type Reaction = "👍" | "❤️" | "😂" | "😮" | "😢" | "🙏"

const REACTIONS: Reaction[] = ["👍", "❤️", "😂", "😮", "😢", "🙏"]

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "away", label: "Away" },
  { value: "offline", label: "Appear Offline" },
]

export default function ChatPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserType | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [sentRequests, setSentRequests] = useState<Contact[]>([])
  const [receivedRequests, setReceivedRequests] = useState<Contact[]>([])
  const [blockedContacts, setBlockedContacts] = useState<Contact[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  const messageInputRef = useRef<HTMLInputElement>(null)

  const [showAddContact, setShowAddContact] = useState(false)
  const [newContactEmail, setNewContactEmail] = useState("")
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [editedText, setEditedText] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [showDeleteChat, setShowDeleteChat] = useState(false)
  const [showDeleteContact, setShowDeleteContact] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [activeTab, setActiveTab] = useState("chats")
  const [showProfile, setShowProfile] = useState(false)
  const [userStatus, setUserStatus] = useState("available")
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [showReactions, setShowReactions] = useState<string | null>(null)
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [filterOptions, setFilterOptions] = useState({
    showOnlineOnly: false,
    sortBy: "recent" as "recent" | "name" | "unread",
  })
  const [showFilterOptions, setShowFilterOptions] = useState(false)

  // Media sharing state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [showMediaPreview, setShowMediaPreview] = useState(false)

  // Call state
  const [activeCall, setActiveCall] = useState<Call | null>(null)
  const [showCallInterface, setShowCallInterface] = useState(false)
  const [showIncomingCall, setShowIncomingCall] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const rtcConnectionRef = useRef<RTCConnection | null>(null)
  const callPollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const activeCallRef = useRef<Call | null>(null)

  useEffect(() => {
    activeCallRef.current = activeCall
  }, [activeCall])

  const syncData = async (userId: string) => {
    try {
      const contactsRes = await fetch(`/api/contacts?userId=${encodeURIComponent(userId)}`)
      const contactsData = await contactsRes.json()
      
      const messagesRes = await fetch(`/api/messages?userId=${encodeURIComponent(userId)}`)
      const messagesData = await messagesRes.json()
      
      const callsRes = await fetch(`/api/calls?userId=${encodeURIComponent(userId)}`)
      const callsData = await callsRes.json()

      if (contactsData.success) {
        const allMsgList = messagesData.messages || []
        const userContacts = contactsData.contacts || []
        
        const updatedContacts = userContacts.map((contact: Contact) => {
          const contactMessages = allMsgList.filter(
            (msg: Message) => msg.senderId === contact.contactId && msg.receiverId === userId && !msg.read,
          )

          const conversationMessages = allMsgList.filter(
            (msg: Message) =>
              (msg.senderId === contact.contactId && msg.receiverId === userId) ||
              (msg.senderId === userId && msg.receiverId === contact.contactId),
          )

          const lastMsg =
            conversationMessages.length > 0
              ? [...conversationMessages].sort((a: Message, b: Message) => b.timestamp - a.timestamp)[0]
              : null

          return {
            ...contact,
            unread: contactMessages.length,
            lastMessage: lastMsg
              ? lastMsg.type === "text"
                ? lastMsg.text
                : `Sent ${lastMsg.type}`
              : contact.lastMessage,
            time: lastMsg ? formatTimeRelative(lastMsg.timestamp) : contact.time,
          }
        })

        setContacts(updatedContacts)
        setSentRequests(contactsData.sentRequests || [])
        setReceivedRequests(contactsData.receivedRequests || [])
        setBlockedContacts(contactsData.blockedContacts || [])
      }

      if (messagesData.success) {
        setMessages(messagesData.messages || [])
      }

      if (callsData.success && callsData.calls) {
        const incomingCall = callsData.calls.find((call: Call) => call.receiverId === userId && call.status === "ringing")
        
        if (incomingCall && !activeCallRef.current) {
          setActiveCall(incomingCall)
          setShowIncomingCall(true)

          const audio = new Audio("/ringtone.mp3")
          audio.loop = true
          audio.play().catch((err) => console.error("Could not play ringtone:", err))
          
          const audioRef: { current: HTMLAudioElement | null } = { current: audio }
          
          const timeoutId = setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.pause()
              audioRef.current = null
            }
            handleDeclineCall(incomingCall.id)
            setShowIncomingCall(false)
          }, 30000)
          
          ;(window as any)._activeCallRingtoneCleanup = () => {
            clearTimeout(timeoutId)
            if (audioRef.current) {
              audioRef.current.pause()
              audioRef.current = null
            }
          }
        } else if (activeCallRef.current) {
          const dbCallState = callsData.calls.find((call: Call) => call.id === activeCallRef.current?.id)
          if (!dbCallState || dbCallState.status === "ended" || dbCallState.status === "rejected") {
            handleEndCallLocal()
          } else if (activeCallRef.current.status === "ringing" && dbCallState.status === "ongoing" && dbCallState.answer) {
            setActiveCall(dbCallState)
            if (rtcConnectionRef.current && dbCallState.answer) {
              rtcConnectionRef.current.setRemoteAnswer(dbCallState.answer)
            }
          }
        }
      }
    } catch (err) {
      console.error("Error in syncData:", err)
    }
  }

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(storedUser)
    setUser(parsedUser)
    setDarkMode(parsedUser.darkMode || false)
    setNotifications(parsedUser.notifications !== false)
    setUserStatus(parsedUser.status || "available")

    // Run initial sync
    syncData(parsedUser.id)

    // Set up message/presence/calls polling
    const intervalId = setInterval(() => {
      if (parsedUser) {
        syncData(parsedUser.id)
      }
    }, 3000)

    return () => clearInterval(intervalId)
  }, [router])

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    if (user) {
      const updatedUser = { ...user, darkMode }
      localStorage.setItem("user", JSON.stringify(updatedUser))

      fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateSettings", userId: user.id, darkMode }),
      })
    }
  }, [darkMode])

  // Save notification preference
  useEffect(() => {
    if (user) {
      const updatedUser = { ...user, notifications }
      localStorage.setItem("user", JSON.stringify(updatedUser))

      fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateSettings", userId: user.id, notifications }),
      })
    }
  }, [notifications])

  // Save user status
  useEffect(() => {
    if (user) {
      const updatedUser = { ...user, status: userStatus }
      localStorage.setItem("user", JSON.stringify(updatedUser))

      fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateSettings", userId: user.id, status: userStatus }),
      })
    }
  }, [userStatus])

  // Load contacts for the current user
  const loadContacts = async (userId: string) => {
    try {
      const res = await fetch(`/api/contacts?userId=${encodeURIComponent(userId)}`)
      const data = await res.json()
      if (data.success) {
        setContacts(data.contacts || [])
        setSentRequests(data.sentRequests || [])
        setReceivedRequests(data.receivedRequests || [])
        setBlockedContacts(data.blockedContacts || [])
      }
    } catch (err) {
      console.error("Failed to load contacts:", err)
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Filter messages for the selected contact
  const getConversationMessages = () => {
    if (!selectedContact || !user) return []

    const conversationId = getConversationId(user.id, selectedContact.contactId)
    return messages.filter((msg) => msg.conversationId === conversationId).sort((a, b) => a.timestamp - b.timestamp)
  }

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (selectedContact && user) {
      const markAsRead = async () => {
        try {
          const res = await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "markRead",
              senderId: selectedContact.contactId,
              receiverId: user.id,
            }),
          })
          const data = await res.json()
          if (data.success) {
            // Update local messages state
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.senderId === selectedContact.contactId && msg.receiverId === user.id
                  ? { ...msg, read: true }
                  : msg
              )
            )
            // Update local contacts state
            setContacts((prevContacts) =>
              prevContacts.map((contact) =>
                contact.contactId === selectedContact.contactId
                  ? { ...contact, unread: 0 }
                  : contact
              )
            )
          }
        } catch (err) {
          console.error("Failed to mark messages as read:", err)
        }
      }

      markAsRead()
    }
  }, [selectedContact, user])

  // Generate a unique conversation ID for two users
  const getConversationId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join("_")
  }

  // Handle file selection
  const handleFileSelect = async () => {
    try {
      const files = await selectFiles("*/*", true)
      if (files.length > 0) {
        setSelectedFiles(files)
        setShowMediaPreview(true)
      }
    } catch (error) {
      console.error("Error selecting files:", error)
      toast({
        title: "Error",
        description: "Could not select files. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle sending media files
  const handleSendMedia = async (files: File[]) => {
    if (!selectedContact || !user) return

    const conversationId = getConversationId(user.id, selectedContact.contactId)

    // Create a message for each file
    const newMessages: Message[] = []

    for (const file of files) {
      // In a real app, we would upload the file to a server and get a URL
      // For this demo, we'll use object URLs (these will be lost on page refresh)
      const fileUrl = createObjectURL(file)

      // Determine message type based on file type
      let type: MessageType = "file"
      if (file.type.startsWith("image/")) type = "image"
      else if (file.type.startsWith("video/")) type = "video"
      else if (file.type.startsWith("audio/")) type = "audio"

      const newMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderId: user.id,
        receiverId: selectedContact.contactId,
        text: `Sent ${type}`,
        timestamp: Date.now(),
        conversationId,
        read: false,
        delivered: true,
        type,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileMimeType: file.type,
      }

      newMessages.push(newMessage)
    }

    // Add to all messages in localStorage
    const allMessages = JSON.parse(localStorage.getItem("allMessages") || "[]")
    const updatedAllMessages = [...allMessages, ...newMessages]
    localStorage.setItem("allMessages", JSON.stringify(updatedAllMessages))

    // Update local state
    setMessages([...messages, ...newMessages])

    // Update contact's last message
    updateContactLastMessage(
      selectedContact.contactId,
      `Sent ${files.length > 1 ? `${files.length} files` : files[0].name}`,
    )

    // Close media preview
    setShowMediaPreview(false)
    setSelectedFiles([])

    toast({
      title: "Media sent",
      description: `Sent ${files.length} ${files.length === 1 ? "file" : "files"}`,
    })
  }

  // Initialize a call
  const initializeCall = async (isVideo: boolean) => {
    if (!selectedContact || !user) return

    try {
      // Request permissions with a clear message to the user
      toast({
        title: "Permission Request",
        description: `Please allow access to your ${isVideo ? "camera and microphone" : "microphone"} to continue.`,
      })

      // First check if permissions are already granted
      let permissionsGranted = false

      try {
        const result = await navigator.permissions.query({ name: "microphone" as PermissionName })
        if (result.state === "granted") {
          permissionsGranted = true
        } else if (result.state === "denied") {
          throw new Error("Microphone permission was denied. Please allow access in your browser settings.")
        }

        if (isVideo) {
          const videoResult = await navigator.permissions.query({ name: "camera" as PermissionName })
          if (videoResult.state === "denied") {
            throw new Error("Camera permission was denied. Please allow access in your browser settings.")
          }
          permissionsGranted = permissionsGranted && videoResult.state === "granted"
        }
      } catch (permError) {
        console.log("Could not query permissions, will try to request directly:", permError)
      }

      // Request the actual media stream
      const constraints = {
        audio: true,
        video: isVideo ? { width: 640, height: 480 } : false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      // Set local stream
      setLocalStream(stream)

      // Create RTC connection
      const rtcConnection = new RTCConnection()
      rtcConnectionRef.current = rtcConnection

      // Add local stream to connection
      await rtcConnection.addLocalStream(stream)

      // Set up remote stream handler
      rtcConnection.onRemoteStreamChange = (stream) => {
        setRemoteStream(stream)
      }

      // Create offer
      const offer = await rtcConnection.createOffer()

      if (!offer) {
        throw new Error("Could not create offer")
      }

      // Create call object
      const newCall: Call = {
        id: `call_${Date.now()}`,
        callerId: user.id,
        receiverId: selectedContact.contactId,
        type: isVideo ? "video" : "audio",
        status: "ringing",
        startTime: Date.now(),
        offer,
        iceCandidates: [],
      }

      // Set up ICE candidate handler
      rtcConnection.onIceCandidate = (candidate) => {
        fetch("/api/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "submitIce", callId: newCall.id, candidate }),
        })
      }

      // Store call in PostgreSQL database
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          callId: newCall.id,
          callerId: user.id,
          receiverId: selectedContact.contactId,
          type: isVideo ? "video" : "audio",
          offer,
        }),
      })

      // Set active call
      setActiveCall(newCall)
      setShowCallInterface(true)

      // Start polling for answer
      startCallPolling(newCall.id)

      return newCall
    } catch (error: any) {
      console.error("Error accessing media devices:", error)

      // Provide more specific error messages
      let errorMessage = "Could not initialize call. Please check your camera and microphone permissions."

      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage = `Permission denied. Please allow access to your ${isVideo ? "camera and microphone" : "microphone"} in your browser settings.`
        // Close the call interface when permission is denied
        setShowCallInterface(false)
        setActiveCall(null)
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage = `${isVideo ? "Camera and/or microphone" : "Microphone"} not found. Please check your device connections.`
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage = `Could not access your ${isVideo ? "camera and/or microphone" : "microphone"}. The device might be in use by another application.`
      }

      toast({
        title: "Call failed",
        description: errorMessage,
        variant: "destructive",
      })

      // Clean up
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
        setLocalStream(null)
      }

      if (rtcConnectionRef.current) {
        rtcConnectionRef.current.closeConnection()
        rtcConnectionRef.current = null
      }

      return null
    }
  }

  // Start polling for call updates
  const startCallPolling = (callId: string) => {
    // Clear any existing polling interval
    if (callPollingIntervalRef.current) {
      clearInterval(callPollingIntervalRef.current)
    }

    // Set up polling interval
    callPollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/calls?userId=${encodeURIComponent(user?.id || "")}`)
        const data = await res.json()
        if (!data.success || !data.calls) return

        const call = data.calls.find((c: Call) => c.id === callId)

        if (!call) {
          handleEndCallLocal()
          return
        }

        // Check if call status has changed
        if (call.status !== activeCallRef.current?.status) {
          setActiveCall(call)

          // If call was rejected or ended, clean up
          if (call.status === "rejected" || call.status === "ended" || call.status === "missed") {
            handleEndCallLocal()
          }
        }

        // If we're the caller, check for answer
        if (call.callerId === user?.id && call.answer && rtcConnectionRef.current) {
          rtcConnectionRef.current.setRemoteAnswer(call.answer)

          if (call.iceCandidates) {
            call.iceCandidates.forEach((candidate: RTCIceCandidate) => {
              rtcConnectionRef.current?.addIceCandidate(candidate)
            })
          }
        }

        // If we're the receiver, check for ICE candidates
        if (call.receiverId === user?.id && rtcConnectionRef.current) {
          if (call.iceCandidates) {
            call.iceCandidates.forEach((candidate: RTCIceCandidate) => {
              rtcConnectionRef.current?.addIceCandidate(candidate)
            })
          }
        }
      } catch (err) {
        console.error("Error in call polling:", err)
      }
    }, 1000)
  }

  // Handle accepting a call
  const handleAcceptCall = async () => {
    if (!activeCall || !user) return

    try {
      toast({
        title: "Permission Request",
        description: `Please allow access to your ${activeCall.type === "video" ? "camera and microphone" : "microphone"} to continue.`,
      })

      const { success, stream, error } = await requestMediaPermissions(activeCall.type === "video", true)

      if (!success || !stream) {
        toast({
          title: "Permission Denied",
          description: `You need to allow access to your ${activeCall.type === "video" ? "camera and microphone" : "microphone"} to accept calls.`,
          variant: "destructive",
        })
        throw new Error(error || "Could not access media devices")
      }

      setLocalStream(stream)

      const rtcConnection = new RTCConnection()
      rtcConnectionRef.current = rtcConnection

      await rtcConnection.addLocalStream(stream)

      rtcConnection.onRemoteStreamChange = (stream) => {
        setRemoteStream(stream)
      }

      rtcConnection.onIceCandidate = (candidate) => {
        fetch("/api/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "submitIce", callId: activeCall.id, candidate }),
        })
      }

      if (!activeCall.offer) {
        throw new Error("No offer provided on call")
      }

      const answer = await rtcConnection.createAnswer(activeCall.offer)

      if (!answer) {
        throw new Error("Could not create answer")
      }

      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer",
          callId: activeCall.id,
          answer,
        }),
      })

      setActiveCall({
        ...activeCall,
        status: "ongoing",
        answer,
      })

      setShowIncomingCall(false)
      setShowCallInterface(true)

      startCallPolling(activeCall.id)
    } catch (error: any) {
      console.error("Error accepting call:", error)

      let errorMessage = "Could not accept call. Please check your camera and microphone permissions."

      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage = `Permission denied. Please allow access to your ${activeCall.type === "video" ? "camera and microphone" : "microphone"} in your browser settings.`
      }

      toast({
        title: "Call failed",
        description: errorMessage,
        variant: "destructive",
      })

      handleDeclineCall(activeCall.id)
    }
  }

  // Handle declining a call
  const handleDeclineCall = async (callId: string) => {
    try {
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", callId }),
      })
    } catch (err) {
      console.error("Failed to decline call:", err)
    }

    handleEndCallLocal()
  }

  // Handle ending a call locally
  const handleEndCallLocal = () => {
    setShowIncomingCall(false)
    setShowCallInterface(false)
    setActiveCall(null)

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      setLocalStream(null)
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop())
      setRemoteStream(null)
    }

    if (rtcConnectionRef.current) {
      rtcConnectionRef.current.closeConnection()
      rtcConnectionRef.current = null
    }

    if (callPollingIntervalRef.current) {
      clearInterval(callPollingIntervalRef.current)
      callPollingIntervalRef.current = null
    }

    // Call ringtone cleanup if active
    if ((window as any)._activeCallRingtoneCleanup) {
      (window as any)._activeCallRingtoneCleanup()
      delete (window as any)._activeCallRingtoneCleanup
    }
  }

  // Handle ending a call
  const handleEndCall = async () => {
    if (!activeCall) return

    try {
      await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end", callId: activeCall.id }),
      })
    } catch (err) {
      console.error("Failed to end call in DB:", err)
    }

    handleEndCallLocal()
  }

  // Update the handleLogout function in the chat page
  const handleLogout = async () => {
    // Set user as offline
    if (user) {
      try {
        await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "updateSettings", userId: user.id, online: false }),
        })
      } catch (err) {
        console.error("Failed to set user offline during logout:", err)
      }
    }

    // Clear user from localStorage
    localStorage.removeItem("user")

    // Redirect to login page
    router.push("/login")
  }

  const handleAddContact = async () => {
    if (!newContactEmail.trim() || !newContactEmail.includes("@") || !user) return

    // Check if contact already exists
    const normalizedEmail = newContactEmail.trim().toLowerCase()
    if (
      contacts.some((contact) => contact.email.toLowerCase() === normalizedEmail) ||
      sentRequests.some((contact) => contact.email.toLowerCase() === normalizedEmail) ||
      receivedRequests.some((contact) => contact.email.toLowerCase() === normalizedEmail) ||
      blockedContacts.some((contact) => contact.email.toLowerCase() === normalizedEmail)
    ) {
      toast({
        title: "Contact already exists",
        description: "This contact is already in your list",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          userId: user.id,
          email: normalizedEmail,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Contact request sent",
          description: `A request has been sent to ${newContactEmail}`,
        })
        setNewContactEmail("")
        setShowAddContact(false)
        loadContacts(user.id)
      } else {
        toast({
          title: "Failed to add contact",
          description: data.error || "An error occurred",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("Error adding contact:", err)
      toast({
        title: "Error",
        description: "Could not add contact. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAcceptContact = async (contactId: string) => {
    if (!user) return

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept",
          userId: user.id,
          contactId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Contact accepted",
          description: "Contact has been added to your contacts",
        })
        loadContacts(user.id)
      } else {
        toast({
          title: "Failed to accept contact",
          description: data.error || "An error occurred",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      console.error("Error accepting contact:", err)
    }
  }

  const handleRejectContact = async (contactId: string) => {
    if (!user) return

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          userId: user.id,
          contactId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Contact rejected",
          description: "Request has been rejected",
        })
        loadContacts(user.id)
      }
    } catch (err: any) {
      console.error("Error rejecting contact:", err)
    }
  }

  const handleCancelRequest = async (contactId: string) => {
    if (!user) return

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          userId: user.id,
          contactId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Request canceled",
          description: "Your request has been canceled",
        })
        loadContacts(user.id)
      }
    } catch (err: any) {
      console.error("Error canceling request:", err)
    }
  }

  const handleBlockContact = async (contactId: string) => {
    if (!user) return

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "block",
          userId: user.id,
          contactId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Contact blocked",
          description: "Contact has been blocked",
        })
        if (selectedContact && selectedContact.contactId === contactId) {
          setSelectedContact(null)
        }
        loadContacts(user.id)
      }
    } catch (err: any) {
      console.error("Error blocking contact:", err)
    }
  }

  const handleUnblockContact = async (contactId: string) => {
    if (!user) return

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unblock",
          userId: user.id,
          contactId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Contact unblocked",
          description: "Contact has been unblocked",
        })
        loadContacts(user.id)
      }
    } catch (err: any) {
      console.error("Error unblocking contact:", err)
    }
  }

  const handleDeleteContact = async () => {
    if (!user || !selectedContact) return

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          userId: user.id,
          contactId: selectedContact.contactId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: "Contact deleted",
          description: `${selectedContact.name} has been removed from your contacts`,
        })
        setSelectedContact(null)
        setShowDeleteContact(false)
        loadContacts(user.id)
      }
    } catch (err: any) {
      console.error("Error deleting contact:", err)
    }
  }

  const handleDeleteChat = async () => {
    if (!user || !selectedContact) return

    const conversationId = getConversationId(user.id, selectedContact.contactId)

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clearHistory",
          conversationId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        // Update local state
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.conversationId !== conversationId))

        // Update contact's last message locally
        setContacts((prevContacts) =>
          prevContacts.map((contact) =>
            contact.contactId === selectedContact.contactId
              ? { ...contact, lastMessage: "", time: "No messages" }
              : contact,
          ),
        )

        setShowDeleteChat(false)

        toast({
          title: "Chat deleted",
          description: `Your conversation with ${selectedContact.name} has been deleted`,
        })
      }
    } catch (err: any) {
      console.error("Error deleting chat:", err)
    }
  }

  const handleEditMessage = (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId)
    if (message && message.senderId === user?.id) {
      setEditingMessage(messageId)
      setEditedText(message.text)
    }
  }

  const saveEditedMessage = async () => {
    if (!editingMessage || !editedText.trim() || !user) return

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          messageId: editingMessage,
          text: editedText,
        }),
      })

      const data = await res.json()

      if (data.success) {
        // Update local state
        const updatedMessages = messages.map((msg) =>
          msg.id === editingMessage ? { ...msg, text: editedText, edited: true } : msg,
        )
        setMessages(updatedMessages)

        // Update contact's last message if this was the last message
        if (selectedContact) {
          const conversationId = getConversationId(user.id, selectedContact.contactId)
          const conversationMessages = updatedMessages.filter((msg) => msg.conversationId === conversationId)
          const sortedMessages = [...conversationMessages].sort((a, b) => b.timestamp - a.timestamp)

          if (sortedMessages.length > 0 && sortedMessages[0].id === editingMessage) {
            updateContactLastMessage(selectedContact.contactId, editedText)
          }
        }

        setEditingMessage(null)
        setEditedText("")
      }
    } catch (err: any) {
      console.error("Error editing message:", err)
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    setShowDeleteConfirm(messageId)
  }

  const confirmDeleteMessage = async (messageId: string) => {
    if (!user) return

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          messageId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        const updatedMessages = messages.filter((msg) => msg.id !== messageId)
        setMessages(updatedMessages)

        // Update contact's last message if this was the last message
        if (selectedContact) {
          const conversationId = getConversationId(user.id, selectedContact.contactId)
          const conversationMessages = updatedMessages.filter((msg) => msg.conversationId === conversationId)
          const sortedMessages = [...conversationMessages].sort((a, b) => b.timestamp - a.timestamp)

          if (sortedMessages.length > 0) {
            updateContactLastMessage(selectedContact.contactId, sortedMessages[0].text)
          } else {
            updateContactLastMessage(selectedContact.contactId, "")
          }
        }

        setShowDeleteConfirm(null)
      }
    } catch (err: any) {
      console.error("Error deleting message:", err)
    }
  }

  const handleReactToMessage = async (messageId: string, reaction: string) => {
    if (!user) return

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "react",
          messageId,
          userId: user.id,
          reaction,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, reactions: data.reactions } : msg,
          ),
        )
        setShowReactions(null)
      }
    } catch (err: any) {
      console.error("Error reacting to message:", err)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedContact || !user) return

    const conversationId = getConversationId(user.id, selectedContact.contactId)
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          messageId,
          senderId: user.id,
          receiverId: selectedContact.contactId,
          text: message,
          conversationId,
          type: "text",
        }),
      })

      const data = await res.json()

      if (data.success && data.message) {
        setMessages((prevMessages) => [...prevMessages, data.message])
        
        // Update contact's last message locally
        updateContactLastMessage(selectedContact.contactId, message)

        // Clear typing indicator
        if (typingTimeout) {
          clearTimeout(typingTimeout)
          setTypingTimeout(null)
        }
        setIsTyping(false)
        updateTypingStatus(selectedContact.contactId, false)

        setMessage("")
      }
    } catch (err: any) {
      console.error("Error sending message:", err)
    }
  }

  const updateContactLastMessage = (contactId: string, messageText: string) => {
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.contactId === contactId
          ? {
              ...contact,
              lastMessage: messageText || "No messages",
              time: messageText ? "Just now" : "No messages",
            }
          : contact,
      ),
    )
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)

    if (!isTyping && selectedContact) {
      setIsTyping(true)
      updateTypingStatus(selectedContact.contactId, true)
    }

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Set new timeout to clear typing indicator after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      if (selectedContact) {
        setIsTyping(false)
        updateTypingStatus(selectedContact.contactId, false)
      }
    }, 2000)

    setTypingTimeout(timeout)
  }

  const updateTypingStatus = async (contactId: string, isTypingValue: boolean) => {
    if (!user) return

    const currentTyping = user.typing || {}
    const updatedTyping = { ...currentTyping, [contactId]: isTypingValue }
    
    // Update local state
    const updatedUser = { ...user, typing: updatedTyping }
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))

    try {
      await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateSettings",
          userId: user.id,
          typing: updatedTyping
        })
      })
    } catch (err) {
      console.error("Failed to update typing status:", err)
    }
  }

  const isContactTyping = (contactId: string) => {
    const contact = contacts.find((c) => c.contactId === contactId)
    return contact?.typing || false
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatTimeRelative = (timestamp: number) => {
    const now = new Date()
    const messageDate = new Date(timestamp)
    const diffDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return formatTime(timestamp)
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString(undefined, { weekday: "long" })
    } else {
      return messageDate.toLocaleDateString()
    }
  }

  const getInitials = (name: string) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getUserDetails = (userId: string) => {
    if (user && user.id === userId) return user
    const foundContact = contacts.find(c => c.contactId === userId) ||
                         sentRequests.find(c => c.contactId === userId) ||
                         receivedRequests.find(c => c.contactId === userId) ||
                         blockedContacts.find(c => c.contactId === userId)
    if (foundContact) {
      return {
        name: foundContact.name,
        avatar: foundContact.avatar,
        online: foundContact.online,
        lastSeen: (foundContact as any).lastSeen,
      }
    }
    return null
  }

  const getContactStatus = (contactId: string) => {
    if (!user) return null

    const details = getUserDetails(contactId)
    if (!details) return "Offline"

    if (details.online) {
      return "Online"
    } else if (details.lastSeen) {
      return `Last seen ${formatTimeRelative(Number(details.lastSeen))}`
    } else {
      return "Offline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <Badge variant="outline" className="bg-green-500 border-green-500 h-2 w-2 rounded-full p-0" />
      case "busy":
        return <Badge variant="outline" className="bg-red-500 border-red-500 h-2 w-2 rounded-full p-0" />
      case "away":
        return <Badge variant="outline" className="bg-yellow-500 border-yellow-500 h-2 w-2 rounded-full p-0" />
      default:
        return <Badge variant="outline" className="bg-gray-500 border-gray-500 h-2 w-2 rounded-full p-0" />
    }
  }

  // Render media message
  const renderMediaMessage = (message: Message) => {
    if (!message.fileUrl) return null

    switch (message.type) {
      case "image":
        return (
          <div className="mt-2 rounded-md overflow-hidden">
            <Image
              src={message.fileUrl || "/placeholder.svg"}
              alt={message.fileName || "Image"}
              width={300}
              height={200}
              className="object-contain max-h-[300px] w-auto"
            />
          </div>
        )
      case "video":
        return (
          <div className="mt-2 rounded-md overflow-hidden">
            <video src={message.fileUrl} controls className="max-h-[300px] max-w-full" />
          </div>
        )
      case "audio":
        return (
          <div className="mt-2">
            <audio src={message.fileUrl} controls className="w-full" />
          </div>
        )
      case "file":
        return (
          <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center gap-2">
            <File className="h-6 w-6 flex-shrink-0" />
            <div className="overflow-hidden">
              <div className="truncate font-medium text-sm">{message.fileName}</div>
              {message.fileSize && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {(message.fileSize / 1024).toFixed(1)} KB
                </div>
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Filter and sort contacts based on search query and filter options
  const filteredContacts = contacts
    .filter((contact) => {
      // Apply search filter
      const matchesSearch =
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase())

      // Apply online filter if enabled
      if (filterOptions.showOnlineOnly) {
        return matchesSearch && contact.online
      }

      return matchesSearch
    })
    .sort((a, b) => {
      // Apply sorting
      switch (filterOptions.sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "unread":
          return b.unread - a.unread
        case "recent":
        default:
          // Sort by most recent message
          if (a.time === "Just now") return -1
          if (b.time === "Just now") return 1
          if (a.time === "No messages") return 1
          if (b.time === "No messages") return -1
          return 0
      }
    })

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h2 className="mt-4 text-xl font-semibold">Loading VartaSetu...</h2>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-[#fafbfc] dark:bg-[#0b0f19] overflow-hidden text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Header */}
      <header className="flex h-16 items-center border-b border-slate-200/50 bg-white/70 dark:border-slate-800/40 dark:bg-[#0b0f19]/70 backdrop-blur-md px-4 sticky top-0 z-40 transition-all duration-300">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 border-r border-slate-200/60 dark:border-slate-800/55 bg-white dark:bg-[#0b0f19]">
                  <SheetHeader>
                    <SheetTitle className="sr-only">Sidebar Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center border-b border-slate-100 dark:border-slate-900 px-4 bg-slate-50/50 dark:bg-slate-950/20">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-sm">{user.name}</div>
                            {getStatusIcon(userStatus)}
                          </div>
                          <div className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">{user.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <Tabs defaultValue="chats" className="w-full flex flex-col h-full" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4 bg-slate-100/60 dark:bg-slate-900/60 p-1 rounded-xl mx-2 my-2 w-[calc(100%-16px)]">
                          <TabsTrigger value="chats" className="rounded-lg text-xs font-semibold">Chats</TabsTrigger>
                          <TabsTrigger value="received" className="rounded-lg text-xs font-semibold relative">
                            Inbox
                            {receivedRequests.length > 0 && (
                              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-650 text-[9px] text-white">
                                {receivedRequests.length}
                              </span>
                            )}
                          </TabsTrigger>
                          <TabsTrigger value="sent" className="rounded-lg text-xs font-semibold">Sent</TabsTrigger>
                          <TabsTrigger value="blocked" className="rounded-lg text-xs font-semibold">Blocked</TabsTrigger>
                        </TabsList>
 
                        <TabsContent value="chats" className="flex flex-col flex-1 overflow-hidden m-0">
                          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 p-3">
                            <div className="relative w-full">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-600" />
                              <Input
                                placeholder="Search contacts..."
                                className="h-9 pl-8.5 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/30 dark:border-slate-800 dark:bg-slate-900/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowFilterOptions(!showFilterOptions)}
                              className={cn(
                                "h-9 w-9 rounded-xl border border-slate-200/50 dark:border-slate-850",
                                (filterOptions.showOnlineOnly || filterOptions.sortBy !== "recent") &&
                                  "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20",
                              )}
                            >
                              <Filter className="h-4 w-4" />
                            </Button>
                          </div>
                          {showFilterOptions && (
                            <div className="border-b border-slate-100 dark:border-slate-900 p-4 space-y-3 bg-slate-50/30 dark:bg-slate-950/10">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="online-only" className="text-xs font-semibold text-slate-550 dark:text-slate-400">
                                  Show online contacts only
                                </Label>
                                <Switch
                                  id="online-only"
                                  checked={filterOptions.showOnlineOnly}
                                  onCheckedChange={(checked) =>
                                    setFilterOptions({ ...filterOptions, showOnlineOnly: checked })
                                  }
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-550 dark:text-slate-400">Sort by</Label>
                                <RadioGroup
                                  value={filterOptions.sortBy}
                                  onValueChange={(value) =>
                                    setFilterOptions({
                                      ...filterOptions,
                                      sortBy: value as "recent" | "name" | "unread",
                                    })
                                  }
                                  className="flex flex-col space-y-1"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="recent" id="recent" className="text-indigo-650" />
                                    <Label htmlFor="recent" className="text-xs font-medium cursor-pointer">
                                      Recent messages
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="name" id="name" className="text-indigo-650" />
                                    <Label htmlFor="name" className="text-xs font-medium cursor-pointer">
                                      Name
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="unread" id="unread" className="text-indigo-650" />
                                    <Label htmlFor="unread" className="text-xs font-medium cursor-pointer">
                                      Unread messages
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-end p-2 border-b border-slate-100 dark:border-slate-900 bg-slate-50/10">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAddContact(true)}
                              className="text-xs rounded-xl font-bold border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-800 dark:hover:bg-slate-900"
                            >
                              <UserPlus className="h-3.5 w-3.5 mr-1" />
                              Add Contact
                            </Button>
                          </div>
                          <ScrollArea className="flex-1 custom-scrollbar">
                            <div className="p-2 space-y-1">
                              {filteredContacts.length > 0 ? (
                                filteredContacts.map((contact) => (
                                  <button
                                    key={contact.id}
                                    className={cn(
                                      "flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all duration-200",
                                      selectedContact?.contactId === contact.contactId
                                        ? "bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-300"
                                        : "hover:bg-slate-100/60 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-400",
                                    )}
                                    onClick={() => {
                                      setSelectedContact(contact)
                                      setSidebarOpen(false)
                                    }}
                                  >
                                    <div className="relative">
                                      <Avatar className="h-9 w-9 border border-slate-205 dark:border-slate-805">
                                        {contact.avatar ? (
                                          <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                        ) : (
                                          <AvatarFallback className="bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 font-bold text-xs text-indigo-600">{getInitials(contact.name)}</AvatarFallback>
                                        )}
                                      </Avatar>
                                      {contact.online && (
                                        <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-950" />
                                      )}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                      <div className="flex items-center justify-between">
                                        <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">{contact.name}</div>
                                        <div className="text-[10px] text-slate-400">{contact.time}</div>
                                      </div>
                                      <div className="text-[11px] text-slate-450 dark:text-slate-500 truncate mt-0.5">
                                        {isContactTyping(contact.contactId) ? (
                                          <span className="text-indigo-600 dark:text-indigo-400 italic">typing...</span>
                                        ) : (
                                          contact.lastMessage
                                        )}
                                      </div>
                                    </div>
                                    {contact.unread > 0 && (
                                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm shadow-indigo-600/20">
                                        {contact.unread}
                                      </div>
                                    )}
                                  </button>
                                ))
                              ) : (
                                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                                  {searchQuery ? "No contacts found" : "No contacts yet"}
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>
 
                        <TabsContent value="received" className="flex flex-col flex-1 overflow-hidden m-0">
                          <ScrollArea className="flex-1 custom-scrollbar">
                            <div className="p-2 space-y-1">
                              {receivedRequests.length > 0 ? (
                                receivedRequests.map((contact) => (
                                  <div
                                    key={contact.id}
                                    className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left border border-slate-100 bg-slate-50/30 dark:border-slate-900 dark:bg-slate-950/20"
                                  >
                                    <div className="relative">
                                      <Avatar className="h-8 w-8">
                                        {contact.avatar ? (
                                          <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                        ) : (
                                          <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 text-xs font-bold">{getInitials(contact.name)}</AvatarFallback>
                                        )}
                                      </Avatar>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                      <div className="font-semibold text-xs truncate">{contact.name}</div>
                                      <div className="text-[10px] text-slate-400 truncate">{contact.email}</div>
                                    </div>
                                    <div className="flex gap-1">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => handleAcceptContact(contact.contactId)}
                                              className="h-8 w-8 text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg"
                                            >
                                              <Check className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">Accept</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
 
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => handleRejectContact(contact.contactId)}
                                              className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">Reject</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
 
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => handleBlockContact(contact.contactId)}
                                              className="h-8 w-8 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                            >
                                              <Shield className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="text-xs">Block</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                                  No pending inbox requests
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>
 
                        <TabsContent value="sent" className="flex flex-col flex-1 overflow-hidden m-0">
                          <ScrollArea className="flex-1 custom-scrollbar">
                            <div className="p-2 space-y-1">
                              {sentRequests.length > 0 ? (
                                sentRequests.map((contact) => (
                                  <div
                                    key={contact.id}
                                    className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left border border-slate-100 bg-slate-50/30 dark:border-slate-900 dark:bg-slate-950/20"
                                  >
                                    <div className="relative">
                                      <Avatar className="h-8 w-8">
                                        {contact.avatar ? (
                                          <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                        ) : (
                                          <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 text-xs font-bold">{getInitials(contact.name)}</AvatarFallback>
                                        )}
                                      </Avatar>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                      <div className="font-semibold text-xs truncate">{contact.name}</div>
                                      <div className="text-[10px] text-slate-400 truncate">{contact.email}</div>
                                      <div className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">Request sent</div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCancelRequest(contact.contactId)}
                                      className="text-xs rounded-xl hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ))
                              ) : (
                                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                                  No sent requests
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>
 
                        <TabsContent value="blocked" className="flex flex-col flex-1 overflow-hidden m-0">
                          <ScrollArea className="flex-1 custom-scrollbar">
                            <div className="p-2 space-y-1">
                              {blockedContacts.length > 0 ? (
                                blockedContacts.map((contact) => (
                                  <div
                                    key={contact.id}
                                    className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left border border-slate-105 bg-slate-50/30 dark:border-slate-905 dark:bg-slate-955/20"
                                  >
                                    <div className="relative">
                                      <Avatar className="h-8 w-8">
                                        {contact.avatar ? (
                                          <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                        ) : (
                                          <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">{getInitials(contact.name)}</AvatarFallback>
                                        )}
                                      </Avatar>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                      <div className="font-semibold text-xs truncate">{contact.name}</div>
                                      <div className="text-[10px] text-slate-400 truncate">{contact.email}</div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUnblockContact(contact.contactId)}
                                      className="text-xs rounded-xl border-slate-205 dark:border-slate-805 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                    >
                                      Unblock
                                    </Button>
                                  </div>
                                ))
                              ) : (
                                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                                  No blocked contacts
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <div className="flex items-center gap-2">
              <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-gradient-to-tr from-indigo-650 to-violet-500 shadow-sm flex items-center justify-center text-white">
                <Image
                  src="/vartasetu-logo-icon.jpeg"
                  alt="VartaSetu Logo"
                  width={36}
                  height={36}
                  className="object-contain opacity-95"
                />
              </div>
              <div className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 dark:from-white dark:via-indigo-100 dark:to-indigo-300 bg-clip-text text-transparent">
                VartaSetu
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setShowProfile(true)} title="Profile">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setShowSettings(true)} title="Settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl text-red-500 hover:text-red-650 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={handleLogout} title="Log Out">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </div>
      </header>
 
      <main className="flex flex-1 overflow-hidden">
        {!isMobile && (
          <aside className="h-full w-80 border-r border-slate-200/60 dark:border-slate-800/50 bg-white dark:bg-[#0b0f19] flex-shrink-0 transition-colors duration-300">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center border-b border-slate-100 dark:border-slate-900 px-4 bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-sm">{user.name}</div>
                      {getStatusIcon(userStatus)}
                    </div>
                    <div className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">{user.email}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col overflow-hidden">
                <Tabs defaultValue="chats" className="w-full flex flex-col h-full" onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 bg-slate-100/60 dark:bg-slate-900/60 p-1 rounded-xl mx-2 my-2 w-[calc(100%-16px)]">
                    <TabsTrigger value="chats" className="rounded-lg text-xs font-semibold">Chats</TabsTrigger>
                    <TabsTrigger value="received" className="rounded-lg text-xs font-semibold relative">
                      Inbox
                      {receivedRequests.length > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-650 text-[9px] text-white">
                          {receivedRequests.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="rounded-lg text-xs font-semibold">Sent</TabsTrigger>
                    <TabsTrigger value="blocked" className="rounded-lg text-xs font-semibold">Blocked</TabsTrigger>
                  </TabsList>
 
                  <TabsContent value="chats" className="flex flex-col flex-1 overflow-hidden m-0">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 p-3">
                      <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-450 dark:text-slate-650" />
                        <Input
                          placeholder="Search contacts..."
                          className="h-9 pl-8.5 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/30 dark:border-slate-800 dark:bg-slate-900/50"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowFilterOptions(!showFilterOptions)}
                        className={cn(
                          "h-9 w-9 rounded-xl border border-slate-200/50 dark:border-slate-850",
                          (filterOptions.showOnlineOnly || filterOptions.sortBy !== "recent") &&
                            "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20",
                        )}
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                    {showFilterOptions && (
                      <div className="border-b border-slate-100 dark:border-slate-900 p-4 space-y-3 bg-slate-50/30 dark:bg-slate-950/10">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="online-only" className="text-xs font-semibold text-slate-550 dark:text-slate-400">
                            Show online contacts only
                          </Label>
                          <Switch
                            id="online-only"
                            checked={filterOptions.showOnlineOnly}
                            onCheckedChange={(checked) =>
                              setFilterOptions({ ...filterOptions, showOnlineOnly: checked })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-550 dark:text-slate-400">Sort by</Label>
                          <RadioGroup
                            value={filterOptions.sortBy}
                            onValueChange={(value) =>
                              setFilterOptions({
                                ...filterOptions,
                                sortBy: value as "recent" | "name" | "unread",
                              })
                            }
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="recent" id="recent" className="text-indigo-650" />
                              <Label htmlFor="recent" className="text-xs font-medium cursor-pointer">
                                Recent messages
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="name" id="name" className="text-indigo-650" />
                              <Label htmlFor="name" className="text-xs font-medium cursor-pointer">
                                Name
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="unread" id="unread" className="text-indigo-650" />
                              <Label htmlFor="unread" className="text-xs font-medium cursor-pointer">
                                Unread messages
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end p-2 border-b border-slate-100 dark:border-slate-900 bg-slate-50/10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddContact(true)}
                        className="text-xs rounded-xl font-bold border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-800 dark:hover:bg-slate-900"
                      >
                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                        Add Contact
                      </Button>
                    </div>
                    <ScrollArea className="flex-1 custom-scrollbar">
                      <div className="p-2 space-y-1">
                        {filteredContacts.length > 0 ? (
                          filteredContacts.map((contact) => (
                            <button
                              key={contact.id}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all duration-200",
                                selectedContact?.contactId === contact.contactId
                                  ? "bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-300"
                                  : "hover:bg-slate-100/60 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-400",
                              )}
                              onClick={() => {
                                setSelectedContact(contact)
                              }}
                            >
                              <div className="relative">
                                <Avatar className="h-9 w-9 border border-slate-205 dark:border-slate-805">
                                  {contact.avatar ? (
                                    <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                  ) : (
                                    <AvatarFallback className="bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 font-bold text-xs text-indigo-600">{getInitials(contact.name)}</AvatarFallback>
                                  )}
                                </Avatar>
                                {contact.online && (
                                  <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-950" />
                                )}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div className="flex items-center justify-between">
                                  <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">{contact.name}</div>
                                  <div className="text-[10px] text-slate-400">{contact.time}</div>
                                </div>
                                <div className="text-[11px] text-slate-450 dark:text-slate-500 truncate mt-0.5">
                                  {isContactTyping(contact.contactId) ? (
                                    <span className="text-indigo-600 dark:text-indigo-400 italic">typing...</span>
                                  ) : (
                                    contact.lastMessage
                                  )}
                                </div>
                              </div>
                              {contact.unread > 0 && (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm shadow-indigo-600/20">
                                  {contact.unread}
                                </div>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                            {searchQuery ? "No contacts found" : "No contacts yet"}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
 
                  <TabsContent value="received" className="flex flex-col flex-1 overflow-hidden m-0">
                    <ScrollArea className="flex-1 custom-scrollbar">
                      <div className="p-2 space-y-1">
                        {receivedRequests.length > 0 ? (
                          receivedRequests.map((contact) => (
                            <div
                              key={contact.id}
                              className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left border border-slate-100 bg-slate-50/30 dark:border-slate-900 dark:bg-slate-950/20"
                            >
                              <div className="relative">
                                <Avatar className="h-8 w-8">
                                  {contact.avatar ? (
                                    <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                  ) : (
                                    <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-605 text-xs font-bold">{getInitials(contact.name)}</AvatarFallback>
                                  )}
                                </Avatar>
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div className="font-semibold text-xs truncate">{contact.name}</div>
                                <div className="text-[10px] text-slate-450 dark:text-slate-550 truncate">{contact.email}</div>
                              </div>
                              <div className="flex gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleAcceptContact(contact.contactId)}
                                        className="h-8 w-8 text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg"
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Accept</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
 
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRejectContact(contact.contactId)}
                                        className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Reject</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
 
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleBlockContact(contact.contactId)}
                                        className="h-8 w-8 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                      >
                                        <Shield className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Block</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                            No pending inbox requests
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
 
                  <TabsContent value="sent" className="flex flex-col flex-1 overflow-hidden m-0">
                    <ScrollArea className="flex-1 custom-scrollbar">
                      <div className="p-2 space-y-1">
                        {sentRequests.length > 0 ? (
                          sentRequests.map((contact) => (
                            <div
                              key={contact.id}
                              className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left border border-slate-105 bg-slate-50/30 dark:border-slate-905 dark:bg-slate-955/20"
                            >
                              <div className="relative">
                                <Avatar className="h-8 w-8">
                                  {contact.avatar ? (
                                    <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                  ) : (
                                    <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 text-xs font-bold">{getInitials(contact.name)}</AvatarFallback>
                                  )}
                                </Avatar>
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div className="font-semibold text-xs truncate">{contact.name}</div>
                                <div className="text-[10px] text-slate-400 truncate">{contact.email}</div>
                                <div className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">Request sent</div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelRequest(contact.contactId)}
                                className="text-xs rounded-xl hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20"
                              >
                                Cancel
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                            No sent requests
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
 
                  <TabsContent value="blocked" className="flex flex-col flex-1 overflow-hidden m-0">
                    <ScrollArea className="flex-1 custom-scrollbar">
                      <div className="p-2 space-y-1">
                        {blockedContacts.length > 0 ? (
                          blockedContacts.map((contact) => (
                            <div
                              key={contact.id}
                              className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left border border-slate-100 bg-slate-50/30 dark:border-slate-900 dark:bg-slate-950/20"
                            >
                              <div className="relative">
                                <Avatar className="h-8 w-8">
                                  {contact.avatar ? (
                                    <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                  ) : (
                                    <AvatarFallback className="bg-slate-105 text-slate-600 text-xs font-bold">{getInitials(contact.name)}</AvatarFallback>
                                  )}
                                </Avatar>
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div className="font-semibold text-xs truncate">{contact.name}</div>
                                <div className="text-[10px] text-slate-400 truncate">{contact.email}</div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnblockContact(contact.contactId)}
                                className="text-xs rounded-xl border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                              >
                                Unblock
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                            No blocked contacts
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </aside>
        )}
 
        {selectedContact ? (
          <div className="flex flex-1 flex-col bg-slate-50/30 dark:bg-slate-950/5 relative">
            
            {/* Contact Header */}
            <div className="flex h-16 items-center border-b border-slate-200/50 bg-white/70 dark:border-slate-800/40 dark:bg-[#0b0f19]/70 backdrop-blur-sm px-4 justify-between z-10 transition-colors">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="mr-2 rounded-xl">
                    <ChevronLeft className="h-5 w-5" />
                    <span className="sr-only">Back</span>
                  </Button>
                )}
                <Avatar className="cursor-pointer border border-slate-200/60 dark:border-slate-800/60" onClick={() => setShowContactInfo(true)}>
                  {selectedContact.avatar ? (
                    <AvatarImage src={selectedContact.avatar || "/placeholder.svg"} alt={selectedContact.name} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 text-indigo-600 font-bold text-sm">{getInitials(selectedContact.name)}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{selectedContact.name}</div>
                  <div className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">
                    {getContactStatus(selectedContact.contactId)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => initializeCall(false)}>
                        <Phone className="h-4.5 w-4.5 text-slate-600 dark:text-slate-300" />
                        <span className="sr-only">Start audio call</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Audio call</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
 
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => initializeCall(true)}>
                        <Video className="h-4.5 w-4.5 text-slate-600 dark:text-slate-300" />
                        <span className="sr-only">Start video call</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Video call</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
 
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <MoreVertical className="h-4.5 w-4.5 text-slate-600 dark:text-slate-300" />
                      <span className="sr-only">More Options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => setShowContactInfo(true)}>
                      <Info className="h-4 w-4 mr-2 text-slate-500" />
                      Contact Info
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowDeleteChat(true)} className="text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDeleteContact(true)} className="text-red-500 hover:text-red-600">
                      <UserMinus className="h-4 w-4 mr-2" />
                      Delete Contact
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBlockContact(selectedContact.contactId)}>
                      <Shield className="h-4 w-4 mr-2 text-amber-500" />
                      Block Contact
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
 
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 custom-scrollbar">
              <div className="flex flex-col gap-3 py-2 max-w-5xl mx-auto w-full">
                {getConversationMessages().map((msg) => (
                  <div
                    key={msg.id}
                    className={cn("flex w-full flex-col", msg.senderId === user.id ? "items-end" : "items-start")}
                  >
                    <div className="flex items-end gap-2 max-w-[85vw] sm:max-w-[70%]">
                      {msg.senderId !== user.id && (
                        <Avatar className="h-7 w-7 border border-slate-200 dark:border-slate-800/80 mb-1">
                          {selectedContact.avatar ? (
                            <AvatarImage
                              src={selectedContact.avatar || "/placeholder.svg"}
                              alt={selectedContact.name}
                            />
                          ) : (
                            <AvatarFallback className="bg-slate-100 text-xs font-bold text-slate-600">{getInitials(selectedContact.name)}</AvatarFallback>
                          )}
                        </Avatar>
                      )}
                      <div className="flex flex-col">
                        <div
                          className={cn(
                            "relative rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-sm break-words leading-relaxed",
                            msg.senderId === user.id
                              ? "bg-indigo-600 text-white rounded-br-none shadow-indigo-500/5"
                              : "bg-white dark:bg-slate-850 dark:text-white border border-slate-200/40 dark:border-slate-800/85 rounded-bl-none shadow-slate-100/5",
                          )}
                        >
                          {editingMessage === msg.id ? (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              <Input
                                type="text"
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    saveEditedMessage()
                                  } else if (e.key === "Escape") {
                                    setEditingMessage(null)
                                    setEditedText("")
                                  }
                                }}
                                autoFocus
                                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm h-9"
                              />
                              <div className="flex justify-end gap-1.5">
                                <Button size="sm" variant="outline" className="h-7 text-[11px] rounded-lg" onClick={saveEditedMessage}>
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-[11px] rounded-lg text-slate-500"
                                  onClick={() => {
                                    setEditingMessage(null)
                                    setEditedText("")
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {msg.type !== "text" ? renderMediaMessage(msg) : <p>{msg.text}</p>}
                              {msg.edited && (
                                <span className="ml-1.5 text-[9px] font-bold opacity-60 italic text-slate-400 dark:text-slate-500">
                                  (edited)
                                </span>
                              )}
                            </>
                          )}
                          <div className="absolute -top-2.5 right-2.5 flex items-center gap-1">
                            {msg.reactions &&
                              Object.entries(msg.reactions).map(([userId, reaction]) => {
                                return (
                                  <Badge
                                    key={userId}
                                    variant="secondary"
                                    className="cursor-default rounded-full border border-slate-100 dark:border-slate-800/80 px-1 py-0.5 text-[9px] shadow-sm"
                                  >
                                    {reaction}
                                  </Badge>
                                )
                              })}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-450 dark:text-slate-500 px-1">
                          {msg.senderId === user.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-4.5 w-4.5 rounded-lg opacity-40 hover:opacity-100 transition-opacity">
                                  <MoreVertical className="h-3 w-3" />
                                  <span className="sr-only">More</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-lg">
                                <DropdownMenuItem className="text-xs" onClick={() => handleEditMessage(msg.id)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-xs text-red-500" onClick={() => handleDeleteMessage(msg.id)}>Delete</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-xs" onClick={() => setShowReactions(msg.id)}>React</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          <div className="font-medium">{formatTime(msg.timestamp)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
 
            {/* Input Footer */}
            <div className="p-3 bg-white/70 dark:bg-[#0b0f19]/70 border-t border-slate-200/50 dark:border-slate-800/40 backdrop-blur-md sticky bottom-0 z-10 transition-colors duration-300">
              <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
                <div className="hidden sm:block">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900">
                        <Smile className="h-5 w-5 text-slate-500" />
                        <span className="sr-only">Add emoji</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 rounded-xl">
                      <div className="p-3">
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-450">Emoji Reacts</h4>
                        <div className="grid grid-cols-6 gap-1.5 pt-1">
                          {["👍", "❤️", "😂", "😮", "😢", "🙏"].map(emoji => (
                            <Button 
                              key={emoji} 
                              variant="outline" 
                              className="h-9 w-9 p-0 text-lg hover:bg-indigo-50 hover:border-indigo-100 rounded-lg"
                              onClick={() => {
                                // Apply emoji reaction if any message is focused or toggle
                                toast({
                                  title: "Reaction Guide",
                                  description: "Click the 3 dots on any message to react directly!",
                                })
                              }}
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
 
                <Button variant="ghost" size="icon" onClick={handleFileSelect} className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 flex-shrink-0">
                  <Paperclip className="h-5 w-5 text-slate-500" />
                  <span className="sr-only">Add attachment</span>
                </Button>
 
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={handleTyping}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage()
                    }
                  }}
                  ref={messageInputRef}
                  className="h-10 rounded-xl border-slate-200/80 bg-slate-50/50 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-0 dark:border-slate-800 dark:bg-slate-900/50 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white flex-shrink-0 shadow-sm transition-all"
                >
                  <Send className="h-4.5 w-4.5" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-6 space-y-4 bg-slate-50/15 dark:bg-slate-950/5">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Start Bridging Conversations</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Select a contact from your list on the left, or add a new engineering friend by clicking Add Contact.
              </p>
            </div>
          </div>
        )}
      </main>
 
      {/* Media Preview Dialog */}
      <Dialog open={showMediaPreview} onOpenChange={setShowMediaPreview}>
        <DialogContent className="rounded-2xl border-slate-200 dark:border-slate-800/80 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Send Attachment</DialogTitle>
            <DialogDescription className="text-xs">Preview your selected media files before sending.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-64 pr-2">
            <div className="flex flex-col gap-3 pt-1">
              {selectedFiles.map((file, index) => {
                const fileUrl = createObjectURL(file)
                return (
                  <div key={index} className="flex items-center gap-3 border border-slate-100 dark:border-slate-900 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/30">
                    {file.type.startsWith("image/") && (
                      <Image
                        src={fileUrl || "/placeholder.svg"}
                        alt={file.name}
                        width={80}
                        height={80}
                        className="object-cover rounded-lg border dark:border-slate-800 h-16 w-16"
                      />
                    )}
                    {file.type.startsWith("video/") && (
                      <video src={fileUrl} controls className="max-w-[80px] max-h-[80px] rounded-lg border dark:border-slate-850 h-16" />
                    )}
                    {file.type.startsWith("audio/") && <audio src={fileUrl} controls className="max-w-[120px] scale-90" />}
                    {!file.type.startsWith("image/") &&
                      !file.type.startsWith("video/") &&
                      !file.type.startsWith("audio/") && <File className="h-8 w-8 text-indigo-500" />}
                    <div className="overflow-hidden flex-1">
                      <div className="font-bold text-xs truncate">{file.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100 dark:border-slate-900">
            <Button variant="ghost" className="rounded-xl text-xs h-9" onClick={() => setShowMediaPreview(false)}>
              Cancel
            </Button>
            <Button className="rounded-xl text-xs h-9 bg-indigo-650 text-white hover:bg-indigo-700" onClick={() => handleSendMedia(selectedFiles)}>Send Files</Button>
          </div>
        </DialogContent>
      </Dialog>
 
      {/* Add Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="rounded-2xl border-slate-205 dark:border-slate-805 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add New Contact</DialogTitle>
            <DialogDescription className="text-xs">Enter the email address of the user you want to add.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-500">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@outlook.com"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                className="rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500/30"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-900 pt-3">
            <Button variant="ghost" className="rounded-xl text-xs h-9" onClick={() => setShowAddContact(false)}>
              Cancel
            </Button>
            <Button className="rounded-xl text-xs h-9 bg-indigo-650 text-white hover:bg-indigo-700" onClick={handleAddContact}>Send Invitation</Button>
          </div>
        </DialogContent>
      </Dialog>
 
      {/* Delete Message Confirmation Dialog */}
      <Dialog open={showDeleteConfirm !== null} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="rounded-2xl max-w-xs border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-red-500">Delete Message?</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure? This message will be permanently removed for everyone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" className="rounded-xl text-xs h-8" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" className="rounded-xl text-xs h-8" onClick={() => confirmDeleteMessage(showDeleteConfirm || "")}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
 
      {/* Settings Dialog */}
      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        notifications={notifications}
        setNotifications={setNotifications}
        userStatus={userStatus}
        setUserStatus={setUserStatus}
        onUserUpdate={(u) => setUser(u)}
      />
 
      {/* Delete Chat Confirmation Dialog */}
      <Dialog open={showDeleteChat} onOpenChange={() => setShowDeleteChat(false)}>
        <DialogContent className="rounded-2xl max-w-xs border-slate-205 dark:border-slate-805">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-red-500">Delete Conversation?</DialogTitle>
            <DialogDescription className="text-xs">
              This will remove all messages in this conversation. This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" className="rounded-xl text-xs h-8" onClick={() => setShowDeleteChat(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="rounded-xl text-xs h-8" onClick={handleDeleteChat}>
              Clear History
            </Button>
          </div>
        </DialogContent>
      </Dialog>
 
      {/* Delete Contact Confirmation Dialog */}
      <Dialog open={showDeleteContact} onOpenChange={() => setShowDeleteContact(false)}>
        <DialogContent className="rounded-2xl max-w-xs border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-red-500">Remove Contact?</DialogTitle>
            <DialogDescription className="text-xs">
              This will remove this user from your contact list. You will need to add them again to chat.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" className="rounded-xl text-xs h-8" onClick={() => setShowDeleteContact(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="rounded-xl text-xs h-8" onClick={handleDeleteContact}>
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
 
      {/* Profile Sheet */}
      <Sheet open={showProfile} onOpenChange={setShowProfile}>
        <SheetContent side="right" className="border-l border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#0b0f19]">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold">My Profile</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col pt-4">
            <div className="flex items-center gap-3 p-4 border border-slate-100 dark:border-slate-900 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
              <Avatar className="h-12 w-12 border">
                <AvatarFallback className="bg-indigo-650 text-white font-bold text-base">{getInitials(user?.name || "")}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <div className="font-bold text-sm truncate">{user?.name}</div>
                <div className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</div>
              </div>
            </div>
            
            <ScrollArea className="flex-1 py-4 pr-1">
              <div className="space-y-4">
                <div className="space-y-1 bg-slate-50/20 dark:bg-slate-900/10 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
                  <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-405 uppercase tracking-wider">Account Info</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    Manage your personal profile status and presence settings.
                  </p>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold text-slate-500">Name</Label>
                  <Input type="text" id="name" value={user?.name} disabled className="rounded-xl bg-slate-100 dark:bg-slate-900 border-none cursor-not-allowed" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-500">Email</Label>
                  <Input type="email" id="email" value={user?.email} disabled className="rounded-xl bg-slate-100 dark:bg-slate-900 border-none cursor-not-allowed" />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs font-bold text-slate-500">My Presence</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={false}
                        className="w-full justify-between rounded-xl border-slate-200 dark:border-slate-805 text-xs font-semibold h-10"
                      >
                        {STATUS_OPTIONS.find((option) => option.value === userStatus)?.label}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-1.5 rounded-xl border-slate-200 dark:border-slate-800">
                      <RadioGroup value={userStatus} onValueChange={setUserStatus} className="flex flex-col space-y-0.5">
                        {STATUS_OPTIONS.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2 px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg cursor-pointer">
                            <RadioGroupItem value={option.value} id={option.value} className="h-4 w-4" />
                            <Label htmlFor={option.value} className="text-xs font-medium cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </ScrollArea>
            <div className="border-t border-slate-100 dark:border-slate-900 py-4 mt-auto">
              <Button variant="outline" className="w-full justify-start gap-2 rounded-xl text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Sign out of VartaSetu
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
 
      {/* Contact Info Sheet */}
      <Sheet open={showContactInfo} onOpenChange={setShowContactInfo}>
        <SheetContent side="right" className="border-l border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#0b0f19]">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold">Contact Info</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col pt-4">
            <div className="flex items-center gap-3 p-4 border border-slate-100 dark:border-slate-900 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
              <Avatar className="h-12 w-12 border">
                {selectedContact?.avatar ? (
                  <AvatarImage src={selectedContact?.avatar || "/placeholder.svg"} alt={selectedContact?.name} />
                ) : (
                  <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 text-base font-bold">{getInitials(selectedContact?.name || "")}</AvatarFallback>
                )}
              </Avatar>
              <div className="overflow-hidden">
                <div className="font-bold text-sm truncate">{selectedContact?.name}</div>
                <div className="text-xs text-slate-400 truncate mt-0.5">{selectedContact?.email}</div>
              </div>
            </div>
            
            <ScrollArea className="flex-1 py-4 pr-1">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold text-slate-500">Name</Label>
                  <Input type="text" id="name" value={selectedContact?.name} disabled className="rounded-xl bg-slate-100 dark:bg-slate-900 border-none cursor-not-allowed" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-500">Email Address</Label>
                  <Input type="email" id="email" value={selectedContact?.email} disabled className="rounded-xl bg-slate-100 dark:bg-slate-900 border-none cursor-not-allowed" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs font-bold text-slate-500">Last Active Presence</Label>
                  <Input type="text" id="status" value={getContactStatus(selectedContact?.contactId || "") || ""} disabled className="rounded-xl bg-slate-100 dark:bg-slate-900 border-none cursor-not-allowed font-medium" />
                </div>
              </div>
            </ScrollArea>
            <div className="border-t border-slate-100 dark:border-slate-900 py-4 mt-auto space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-xl text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-955/20 text-xs font-bold"
                onClick={() => handleBlockContact(selectedContact?.contactId || "")}
              >
                <Shield className="h-4 w-4" />
                Block Contact
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-xl text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-955/20 text-xs font-bold"
                onClick={() => setShowDeleteContact(true)}
              >
                <UserMinus className="h-4 w-4" />
                Delete Contact
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
 
      {/* Reactions Popover */}
      <Popover open={showReactions !== null} onOpenChange={() => setShowReactions(null)}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <Smile className="h-5 w-5" />
            <span className="sr-only">Add reaction</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-2 rounded-xl border-slate-205 dark:border-slate-805 shadow-lg">
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Add Emoji Reaction</h4>
            <div className="grid grid-cols-6 gap-1 pt-0.5">
              {REACTIONS.map((reaction) => (
                <Button
                  key={reaction}
                  variant="outline"
                  className="h-9 w-9 p-0 text-lg hover:bg-indigo-50 hover:border-indigo-100 rounded-lg transition-all"
                  onClick={() => handleReactToMessage(showReactions || "", reaction)}
                >
                  {reaction}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
 
      {/* Incoming Call Dialog */}
      <Dialog open={showIncomingCall} onOpenChange={() => setShowIncomingCall(false)}>
        <DialogContent className="rounded-2xl max-w-xs border-slate-200 dark:border-slate-800 text-center">
          <DialogHeader className="items-center">
            <div className="h-14 w-14 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-650 dark:text-indigo-400 mb-2 animate-pulse">
              <Phone className="h-6 w-6" />
            </div>
            <DialogTitle className="text-base font-bold">Incoming {activeCall?.type} Call</DialogTitle>
            <DialogDescription className="text-xs">
              {
                getUserDetails(activeCall?.callerId || "")?.name || "VartaSetu User"
              }{" "}
              is calling you...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-900">
            <Button size="sm" className="rounded-xl px-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xs h-9" onClick={handleAcceptCall}>
              Accept Call
            </Button>
            <Button size="sm" variant="ghost" className="rounded-xl px-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-xs h-9" onClick={() => handleDeclineCall(activeCall?.id || "")}>
              Decline
            </Button>
          </div>
        </DialogContent>
      </Dialog>
 
      {/* Call Interface */}
      <Dialog open={showCallInterface} onOpenChange={() => setShowCallInterface(false)}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white rounded-3xl overflow-hidden max-w-xl p-0">
          <div className="p-4 bg-slate-900/60 backdrop-blur border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <DialogTitle className="text-sm font-bold text-white">
                {activeCall?.type === "video" ? "Video Call" : "Audio Call"} —{" "}
                {
                  getUserDetails((activeCall?.callerId === user?.id ? activeCall?.receiverId : activeCall?.callerId) || "")?.name || "VartaSetu User"
                }
              </DialogTitle>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">WebRTC Peer Connection</span>
          </div>
          
          <div className="relative w-full h-[360px] bg-slate-900 flex items-center justify-center overflow-hidden">
            {activeCall?.type !== "video" && (
              <div className="flex flex-col items-center gap-4 text-center">
                <Avatar className="h-24 w-24 border-4 border-slate-850 shadow-2xl">
                  <AvatarFallback className="bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-2xl">
                    {getInitials(getUserDetails((activeCall?.callerId === user?.id ? activeCall?.receiverId : activeCall?.callerId) || "")?.name || "Call")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-slate-400 text-xs animate-pulse">Audio stream connected...</div>
              </div>
            )}

            {/* Remote Video */}
            {activeCall?.type === "video" && remoteStream && (
              <video
                ref={(el) => {
                  if (el) {
                    el.srcObject = remoteStream
                  }
                }}
                autoPlay
                className="w-full h-full object-cover"
              />
            )}

            {activeCall?.type === "video" && !remoteStream && (
              <div className="flex flex-col items-center gap-2 text-center text-slate-500 text-xs">
                <Video className="h-8 w-8 animate-pulse text-indigo-500" />
                <span>Waiting for remote camera...</span>
              </div>
            )}

            {/* Local Video Overlay */}
            {activeCall?.type === "video" && localStream && (
              <video
                ref={(el) => {
                  if (el) {
                    el.srcObject = localStream
                  }
                }}
                autoPlay
                muted
                className="absolute bottom-4 right-4 w-36 h-28 border border-slate-800 rounded-xl object-cover bg-slate-950 shadow-2xl z-20"
              />
            )}
          </div>
          
          <div className="p-4 bg-slate-900/60 border-t border-slate-800/80 flex justify-center items-center">
            <Button variant="destructive" className="rounded-xl font-bold px-6 shadow-lg shadow-red-950/20 text-xs" onClick={handleEndCall}>
              <Phone className="h-4 w-4 mr-2 rotate-[135deg]" />
              Disconnect Call
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
