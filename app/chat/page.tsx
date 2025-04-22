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

    // Load contacts from localStorage
    loadContacts(parsedUser.id)

    // Set up message polling
    const intervalId = setInterval(() => {
      if (parsedUser) {
        // Use the stored user ID directly instead of relying on state
        const allMessages = JSON.parse(localStorage.getItem("allMessages") || "[]")
        const userMessages = allMessages.filter(
          (msg: Message) => msg.senderId === parsedUser.id || msg.receiverId === parsedUser.id,
        )

        // Only update if there are new messages
        if (userMessages.length !== messages.length) {
          setMessages(userMessages)

          // Update contacts with unread counts
          const allContacts = JSON.parse(localStorage.getItem("allContacts") || "[]")
          const userContacts = allContacts.filter(
            (contact: Contact) => contact.userId === parsedUser.id && contact.status === "accepted",
          )

          // Calculate unread messages for each contact
          const updatedContacts = userContacts.map((contact: Contact) => {
            const contactMessages = allMessages.filter(
              (msg: Message) => msg.senderId === contact.contactId && msg.receiverId === parsedUser.id && !msg.read,
            )

            // Get the last message
            const conversationMessages = allMessages.filter(
              (msg: Message) =>
                (msg.senderId === contact.contactId && msg.receiverId === parsedUser.id) ||
                (msg.senderId === parsedUser.id && msg.receiverId === contact.contactId),
            )

            const lastMsg =
              conversationMessages.length > 0
                ? conversationMessages.sort((a: Message, b: Message) => b.timestamp - a.timestamp)[0]
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
        }

        // Check for new contact requests separately
        loadContacts(parsedUser.id)

        // Check for incoming calls
        checkForIncomingCalls(parsedUser.id)
      }
    }, 3000)

    return () => clearInterval(intervalId)
  }, [router, messages])

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Save preference only if user exists and only when darkMode changes
    if (user) {
      const updatedUser = { ...user, darkMode }
      localStorage.setItem("user", JSON.stringify(updatedUser))

      // Update in all users
      const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
      const updatedAllUsers = allUsers.map((u: UserType) => (u.id === user.id ? { ...u, darkMode } : u))
      localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers))
    }
  }, [darkMode, user])

  // Save notification preference
  useEffect(() => {
    if (user) {
      const updatedUser = { ...user, notifications }
      localStorage.setItem("user", JSON.stringify(updatedUser))

      // Update in all users
      const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
      const updatedAllUsers = allUsers.map((u: UserType) => (u.id === user.id ? { ...u, notifications } : u))
      localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers))
    }
  }, [notifications, user])

  // Save user status
  useEffect(() => {
    if (user) {
      const updatedUser = { ...user, status: userStatus }
      localStorage.setItem("user", JSON.stringify(updatedUser))

      // Update in all users
      const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
      const updatedAllUsers = allUsers.map((u: UserType) => (u.id === user.id ? { ...u, status: userStatus } : u))
      localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers))
    }
  }, [userStatus, user])

  // Check for incoming calls
  const checkForIncomingCalls = (userId: string) => {
    const allCalls = JSON.parse(localStorage.getItem("allCalls") || "[]") as Call[]

    // Find any incoming calls for this user that are still ringing
    const incomingCall = allCalls.find((call) => call.receiverId === userId && call.status === "ringing")

    if (incomingCall && !activeCall) {
      setActiveCall(incomingCall)
      setShowIncomingCall(true)

      // Play ringtone
      const audio = new Audio("/ringtone.mp3")
      audio.loop = true
      audio.play().catch((err) => console.error("Could not play ringtone:", err))

      // Store audio element to stop it later
      const audioRef = { current: audio }

      // Auto-decline call after 30 seconds if not answered
      const timeoutId = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }

        handleDeclineCall(incomingCall.id)
        setShowIncomingCall(false)
      }, 30000)

      // Clean up function
      return () => {
        clearTimeout(timeoutId)
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }
      }
    }
  }

  // Load contacts for the current user
  const loadContacts = (userId: string) => {
    const allContacts = JSON.parse(localStorage.getItem("allContacts") || "[]")

    // Accepted contacts
    const acceptedContacts = allContacts.filter(
      (contact: Contact) => contact.userId === userId && contact.status === "accepted",
    )
    setContacts(acceptedContacts)

    // Sent requests (requests sent by the current user)
    const sentPendingContacts = allContacts.filter(
      (contact: Contact) => contact.userId === userId && contact.status === "sent",
    )
    setSentRequests(sentPendingContacts)

    // Received requests (requests received by the current user)
    const receivedPendingContacts = allContacts.filter(
      (contact: Contact) => contact.userId === userId && contact.status === "pending",
    )
    setReceivedRequests(receivedPendingContacts)

    // Blocked contacts
    const blockedContacts = allContacts.filter(
      (contact: Contact) => contact.userId === userId && contact.status === "blocked",
    )
    setBlockedContacts(blockedContacts)
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
      // Create a unique key for this conversation to track if we've already marked it as read
      const conversationKey = `${user.id}_${selectedContact.contactId}_read`
      const alreadyMarkedAsRead = sessionStorage.getItem(conversationKey)

      // Only proceed if we haven't marked this conversation as read in this session
      if (!alreadyMarkedAsRead) {
        const allMessages = JSON.parse(localStorage.getItem("allMessages") || "[]")
        let hasUnread = false

        const updatedMessages = allMessages.map((msg: Message) => {
          if (msg.senderId === selectedContact.contactId && msg.receiverId === user.id && !msg.read) {
            hasUnread = true
            return { ...msg, read: true }
          }
          return msg
        })

        if (hasUnread) {
          localStorage.setItem("allMessages", JSON.stringify(updatedMessages))
          setMessages(updatedMessages)

          // Update contact unread count
          const allContacts = JSON.parse(localStorage.getItem("allContacts") || "[]")
          const updatedContacts = allContacts.map((contact: Contact) => {
            if (contact.userId === user.id && contact.contactId === selectedContact.contactId) {
              return { ...contact, unread: 0 }
            }
            return contact
          })

          localStorage.setItem("allContacts", JSON.stringify(updatedContacts))

          // Update local contacts state
          setContacts((prevContacts) =>
            prevContacts.map((contact) =>
              contact.contactId === selectedContact.contactId ? { ...contact, unread: 0 } : contact,
            ),
          )

          // Mark this conversation as read in this session
          sessionStorage.setItem(conversationKey, "true")
        }
      }
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
        text: type === "text" ? file.name : `Sent ${type}`,
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
        // In a real app, we would send this to the other user via a signaling server
        // For this demo, we'll store it in localStorage
        const allCalls = JSON.parse(localStorage.getItem("allCalls") || "[]") as Call[]
        const updatedCalls = allCalls.map((call) => {
          if (call.id === newCall.id) {
            return {
              ...call,
              iceCandidates: [...(call.iceCandidates || []), candidate],
            }
          }
          return call
        })
        localStorage.setItem("allCalls", JSON.stringify(updatedCalls))
      }

      // Store call in localStorage
      const allCalls = JSON.parse(localStorage.getItem("allCalls") || "[]")
      localStorage.setItem("allCalls", JSON.stringify([...allCalls, newCall]))

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
    callPollingIntervalRef.current = setInterval(() => {
      const allCalls = JSON.parse(localStorage.getItem("allCalls") || "[]") as Call[]
      const call = allCalls.find((c) => c.id === callId)

      if (!call) {
        // Call no longer exists
        clearInterval(callPollingIntervalRef.current)
        callPollingIntervalRef.current = null
        return
      }

      // Check if call status has changed
      if (call.status !== activeCall?.status) {
        setActiveCall(call)

        // If call was rejected or ended, clean up
        if (call.status === "rejected" || call.status === "ended" || call.status === "missed") {
          handleEndCall()
        }
      }

      // If we're the caller, check for answer
      if (call.callerId === user?.id && call.answer && rtcConnectionRef.current) {
        // Set remote answer
        rtcConnectionRef.current.setRemoteAnswer(call.answer)

        // Process any ICE candidates from the other user
        if (call.iceCandidates) {
          call.iceCandidates.forEach((candidate) => {
            rtcConnectionRef.current?.addIceCandidate(candidate)
          })
        }
      }

      // If we're the receiver, check for ICE candidates
      if (call.receiverId === user?.id && rtcConnectionRef.current) {
        // Process any ICE candidates from the other user
        if (call.iceCandidates) {
          call.iceCandidates.forEach((candidate) => {
            rtcConnectionRef.current?.addIceCandidate(candidate)
          })
        }
      }
    }, 1000)
  }

  // Handle accepting a call
  const handleAcceptCall = async () => {
    if (!activeCall || !user) return

    try {
      // Request permissions with a clear message to the user
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

      // Set up ICE candidate handler
      rtcConnection.onIceCandidate = (candidate) => {
        // In a real app, we would send this to the other user via a signaling server
        // For this demo, we'll store it in localStorage
        const allCalls = JSON.parse(localStorage.getItem("allCalls") || "[]") as Call[]
        const updatedCalls = allCalls.map((call) => {
          if (call.id === activeCall.id) {
            return {
              ...call,
              iceCandidates: [...(call.iceCandidates || []), candidate],
            }
          }
          return call
        })
        localStorage.setItem("allCalls", JSON.stringify(updatedCalls))
      }

      // Create answer
      const answer = await rtcConnection.createAnswer(activeCall.offer)

      if (!answer) {
        throw new Error("Could not create answer")
      }

      // Update call in localStorage
      const allCalls = JSON.parse(localStorage.getItem("allCalls") || "[]") as Call[]
      const updatedCalls = allCalls.map((call) => {
        if (call.id === activeCall.id) {
          return {
            ...call,
            status: "ongoing",
            answer,
          }
        }
        return call
      })
      localStorage.setItem("allCalls", JSON.stringify(updatedCalls))

      // Update active call
      setActiveCall({
        ...activeCall,
        status: "ongoing",
        answer,
      })

      // Hide incoming call notification and show call interface
      setShowIncomingCall(false)
      setShowCallInterface(true)

      // Start polling for updates
      startCallPolling(activeCall.id)
    } catch (error) {
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

      // Clean up
      handleDeclineCall(activeCall.id)
    }
  }

  // Handle declining a call
  const handleDeclineCall = (callId: string) => {
    // Update call in localStorage
    const allCalls = JSON.parse(localStorage.getItem("allCalls") || "[]") as Call[]
    const updatedCalls = allCalls.map((call) => {
      if (call.id === callId) {
        return {
          ...call,
          status: "rejected",
          endTime: Date.now(),
        }
      }
      return call
    })
    localStorage.setItem("allCalls", JSON.stringify(updatedCalls))

    // Hide incoming call notification
    setShowIncomingCall(false)
    setActiveCall(null)

    // Clean up
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      setLocalStream(null)
    }

    if (rtcConnectionRef.current) {
      rtcConnectionRef.current.closeConnection()
      rtcConnectionRef.current = null
    }

    // Clear polling interval
    if (callPollingIntervalRef.current) {
      clearInterval(callPollingIntervalRef.current)
      callPollingIntervalRef.current = null
    }
  }

  // Handle ending a call
  const handleEndCall = () => {
    if (!activeCall) return

    // Update call in localStorage
    const allCalls = JSON.parse(localStorage.getItem("allCalls") || "[]") as Call[]
    const updatedCalls = allCalls.map((call) => {
      if (call.id === activeCall.id) {
        return {
          ...call,
          status: "ended",
          endTime: Date.now(),
        }
      }
      return call
    })
    localStorage.setItem("allCalls", JSON.stringify(updatedCalls))

    // Hide call interface
    setShowCallInterface(false)
    setActiveCall(null)

    // Clean up
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

    // Clear polling interval
    if (callPollingIntervalRef.current) {
      clearInterval(callPollingIntervalRef.current)
      callPollingIntervalRef.current = null
    }
  }

  // Update the handleLogout function in the chat page
  const handleLogout = () => {
    // Set user as offline
    if (user) {
      const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
      const updatedUsers = allUsers.map((u: UserType) =>
        u.id === user.id ? { ...u, online: false, lastSeen: Date.now() } : u,
      )
      localStorage.setItem("allUsers", JSON.stringify(updatedUsers))
    }

    // Clear user from localStorage
    localStorage.removeItem("user")

    // Redirect to login page
    router.push("/login")
  }

  const handleAddContact = () => {
    if (!newContactEmail.trim() || !newContactEmail.includes("@") || !user) return

    // Check if contact already exists
    if (
      contacts.some((contact) => contact.email === newContactEmail) ||
      sentRequests.some((contact) => contact.email === newContactEmail) ||
      receivedRequests.some((contact) => contact.email === newContactEmail) ||
      blockedContacts.some((contact) => contact.email === newContactEmail)
    ) {
      toast({
        title: "Contact already exists",
        description: "This contact is already in your list",
        variant: "destructive",
      })
      return
    }

    // Check if user exists in the system
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
    const contactUser = allUsers.find((u: UserType) => u.email === newContactEmail)

    if (!contactUser) {
      toast({
        title: "User not found",
        description: "No user with this email address exists. Invite them to join VartaSetu!",
        variant: "destructive",
      })
      return
    }

    // Don't allow adding yourself
    if (contactUser.id === user.id) {
      toast({
        title: "Invalid contact",
        description: "You cannot add yourself as a contact",
        variant: "destructive",
      })
      return
    }

    // Create new contact request for current user (sender)
    const newContact: Contact = {
      id: `contact_${Date.now()}`,
      userId: user.id,
      contactId: contactUser.id,
      name: contactUser.name,
      email: newContactEmail,
      status: "sent", // Sent by current user
      lastMessage: "",
      time: "New",
      unread: 0,
      online: contactUser.online || false,
      avatar: contactUser.avatar || "/default-avatar.png",
    }

    // Create reciprocal contact for the other user (receiver)
    const reciprocalContact: Contact = {
      id: `contact_${Date.now() + 1}`,
      userId: contactUser.id,
      contactId: user.id,
      name: user.name,
      email: user.email,
      status: "pending", // Pending for the receiver
      lastMessage: "Sent you a contact request",
      time: "Just now",
      unread: 1, // Notification for new request
      online: user.online || false,
      avatar: user.avatar || "/default-avatar.png",
    }

    // Add to contacts in localStorage
    const allContacts = JSON.parse(localStorage.getItem("allContacts") || "[]")
    const updatedContacts = [...allContacts, newContact, reciprocalContact]
    localStorage.setItem("allContacts", JSON.stringify(updatedContacts))

    // Update local state
    setSentRequests([...sentRequests, newContact])
    setNewContactEmail("")
    setShowAddContact(false)

    toast({
      title: "Contact request sent",
      description: `A request has been sent to ${contactUser.name}`,
    })
  }

  const handleAcceptContact = (contactId: string) => {
    if (!user) return

    const allContacts = JSON.parse(localStorage.getItem("allContacts") || "[]")

    // Find the pending contact
    const pendingContact = receivedRequests.find((c) => c.contactId === contactId)
    if (!pendingContact) return

    // Update status to accepted for both users
    const updatedAllContacts = allContacts.map((contact: Contact) => {
      // Update current user's contact (receiver)
      if (contact.userId === user.id && contact.contactId === contactId) {
        return { ...contact, status: "accepted" }
      }

      // Update the other user's reciprocal contact (sender)
      if (contact.userId === contactId && contact.contactId === user.id) {
        return { ...contact, status: "accepted" }
      }

      return contact
    })

    localStorage.setItem("allContacts", JSON.stringify(updatedAllContacts))

    // Update local state
    const acceptedContact = { ...pendingContact, status: "accepted" }
    setContacts([...contacts, acceptedContact])
    setReceivedRequests(receivedRequests.filter((c) => c.contactId !== contactId))

    toast({
      title: "Contact accepted",
      description: `${pendingContact.name} has been added to your contacts`,
    })
  }

  const handleRejectContact = (contactId: string) => {
    if (!user) return

    const allContacts = JSON.parse(localStorage.getItem("allContacts") || "[]")

    // Find the pending contact
    const pendingContact = receivedRequests.find((c) => c.contactId === contactId)
    if (!pendingContact) return

    // Remove contact requests for both users
    const updatedAllContacts = allContacts.filter(
      (contact: Contact) =>
        !(contact.userId === user.id && contact.contactId === contactId) &&
        !(contact.userId === contactId && contact.contactId === user.id),
    )

    localStorage.setItem("allContacts", JSON.stringify(updatedAllContacts))

    // Update local state
    setReceivedRequests(receivedRequests.filter((c) => c.contactId !== contactId))

    toast({
      title: "Contact rejected",
      description: `Request from ${pendingContact.name} has been rejected`,
    })
  }

  const handleCancelRequest = (contactId: string) => {
    if (!user) return

    const allContacts = JSON.parse(localStorage.getItem("allContacts") || "[]")

    // Find the sent request
    const sentRequest = sentRequests.find((c) => c.contactId === contactId)
    if (!sentRequest) return

    // Remove contact requests for both users
    const updatedAllContacts = allContacts.filter(
      (contact: Contact) =>
        !(contact.userId === user.id && contact.contactId === contactId) &&
        !(contact.userId === contactId && contact.contactId === user.id),
    )

    localStorage.setItem("allContacts", JSON.stringify(updatedAllContacts))

    // Update local state
    setSentRequests(sentRequests.filter((c) => c.contactId !== contactId))

    toast({
      title: "Request canceled",
      description: `Your request to ${sentRequest.name} has been canceled`,
    })
  }

  const handleBlockContact = (contactId: string) => {
    if (!user) return

    const allContacts = JSON.parse(localStorage.getItem("allContacts") || "[]")

    // Find the contact in any list
    const contactToBlock =
      contacts.find((c) => c.contactId === contactId) ||
      receivedRequests.find((c) => c.contactId === contactId) ||
      sentRequests.find((c) => c.contactId === contactId)

    if (!contactToBlock) return

    // Update status to blocked for current user
    const updatedAllContacts = allContacts.map((contact: Contact) => {
      if (contact.userId === user.id && contact.contactId === contactId) {
        return { ...contact, status: "blocked" }
      }
      return contact
    })

    localStorage.setItem("allContacts", JSON.stringify(updatedAllContacts))

    // Update local state
    const blockedContact = { ...contactToBlock, status: "blocked" }
    setBlockedContacts([...blockedContacts, blockedContact])

    // Remove from other lists
    setContacts(contacts.filter((c) => c.contactId !== contactId))
    setReceivedRequests(receivedRequests.filter((c) => c.contactId !== contactId))
    setSentRequests(sentRequests.filter((c) => c.contactId !== contactId))

    // If this contact was selected, deselect it
    if (selectedContact && selectedContact.contactId === contactId) {
      setSelectedContact(null)
    }

    toast({
      title: "Contact blocked",
      description: `${contactToBlock.name} has been blocked`,
    })
  }

  const handleUnblockContact = (contactId: string) => {
    if (!user) return

    const allContacts = JSON.parse(localStorage.getItem("allContacts") || "[]")

    // Find the blocked contact
    const blockedContact = blockedContacts.find((c) => c.contactId === contactId)
    if (!blockedContact) return

    // Update status to accepted
    const updatedAllContacts = allContacts.map((contact: Contact) => {
      if (contact.userId === user.id && contact.contactId === contactId) {
        return { ...contact, status: "accepted" }
      }
      return contact
    })

    localStorage.setItem("allContacts", JSON.stringify(updatedAllContacts))

    // Update local state
    const unblockedContact = { ...blockedContact, status: "accepted" }
    setContacts([...contacts, unblockedContact])
    setBlockedContacts(blockedContacts.filter((c) => c.contactId !== contactId))

    toast({
      title: "Contact unblocked",
      description: `${blockedContact.name} has been unblocked`,
    })
  }

  const handleDeleteContact = () => {
    if (!user || !selectedContact) return

    const allContacts = JSON.parse(localStorage.getItem("allContacts") || "[]")

    // Remove contact for current user only
    const updatedAllContacts = allContacts.filter(
      (contact: Contact) => !(contact.userId === user.id && contact.contactId === selectedContact.contactId),
    )

    localStorage.setItem("allContacts", JSON.stringify(updatedAllContacts))

    // Update local state
    setContacts(contacts.filter((c) => c.contactId !== selectedContact.contactId))

    // Deselect contact
    setSelectedContact(null)
    setShowDeleteContact(false)

    toast({
      title: "Contact deleted",
      description: `${selectedContact.name} has been removed from your contacts`,
    })
  }

  const handleDeleteChat = () => {
    if (!user || !selectedContact) return

    const allMessages = JSON.parse(localStorage.getItem("allMessages") || "[]")
    const conversationId = getConversationId(user.id, selectedContact.contactId)

    // Remove all messages in this conversation
    const updatedAllMessages = allMessages.filter((msg: Message) => msg.conversationId !== conversationId)

    localStorage.setItem("allMessages", JSON.stringify(updatedAllMessages))

    // Update local state
    setMessages(updatedAllMessages)

    // Update contact's last message
    const allContacts = JSON.parse(localStorage.getItem("allContacts") || "[]")
    const updatedAllContacts = allContacts.map((contact: Contact) => {
      if (contact.userId === user.id && contact.contactId === selectedContact.contactId) {
        return { ...contact, lastMessage: "", time: "No messages" }
      }
      return contact
    })

    localStorage.setItem("allContacts", JSON.stringify(updatedAllContacts))

    // Update local contacts state
    setContacts(
      contacts.map((contact) =>
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

  const handleEditMessage = (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId)
    if (message && message.senderId === user?.id) {
      setEditingMessage(messageId)
      setEditedText(message.text)
    }
  }

  const saveEditedMessage = () => {
    if (!editingMessage || !editedText.trim() || !user) return

    const allMessages = JSON.parse(localStorage.getItem("allMessages") || "[]")
    const updatedAllMessages = allMessages.map((msg: Message) =>
      msg.id === editingMessage ? { ...msg, text: editedText, edited: true } : msg,
    )

    localStorage.setItem("allMessages", JSON.stringify(updatedAllMessages))

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

  const handleDeleteMessage = (messageId: string) => {
    setShowDeleteConfirm(messageId)
  }

  const confirmDeleteMessage = (messageId: string) => {
    if (!user) return

    // Remove from localStorage
    const allMessages = JSON.parse(localStorage.getItem("allMessages") || "[]")
    const messageToDelete = allMessages.find((msg: Message) => msg.id === messageId)
    const updatedAllMessages = allMessages.filter((msg) => msg.id !== messageId)
    localStorage.setItem("allMessages", JSON.stringify(updatedAllMessages))

    // Update local state
    const updatedMessages = messages.filter((msg) => msg.id !== messageId)
    setMessages(updatedMessages)

    // Update contact's last message if this was the last message
    if (selectedContact && messageToDelete) {
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

  const handleReactToMessage = (messageId: string, reaction: string) => {
    if (!user) return

    const allMessages = JSON.parse(localStorage.getItem("allMessages") || "[]")
    const messageToUpdate = allMessages.find((msg: Message) => msg.id === messageId)

    if (!messageToUpdate) return

    // Initialize reactions if they don't exist
    const currentReactions = messageToUpdate.reactions || {}

    // Toggle reaction
    if (currentReactions[user.id] === reaction) {
      delete currentReactions[user.id]
    } else {
      currentReactions[user.id] = reaction
    }

    // Update message with new reactions
    const updatedAllMessages = allMessages.map((msg: Message) =>
      msg.id === messageId ? { ...msg, reactions: currentReactions } : msg,
    )

    localStorage.setItem("allMessages", JSON.stringify(updatedAllMessages))

    // Update local state
    const updatedMessages = messages.map((msg) =>
      msg.id === messageId ? { ...msg, reactions: currentReactions } : msg,
    )
    setMessages(updatedMessages)

    setShowReactions(null)
  }

  const handleSendMessage = () => {
    if (!message.trim() || !selectedContact || !user) return

    const conversationId = getConversationId(user.id, selectedContact.contactId)

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      receiverId: selectedContact.contactId,
      text: message,
      timestamp: Date.now(),
      conversationId,
      read: false,
      delivered: true,
      type: "text",
    }

    // Add to all messages in localStorage
    const allMessages = JSON.parse(localStorage.getItem("allMessages") || "[]")
    const updatedAllMessages = [...allMessages, newMessage]
    localStorage.setItem("allMessages", JSON.stringify(updatedAllMessages))

    // Update local state
    setMessages([...messages, newMessage])

    // Update contact's last message
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

  const updateContactLastMessage = (contactId: string, messageText: string) => {
    if (!user) return

    const allContacts = JSON.parse(localStorage.getItem("allContacts") || "[]")
    const updatedAllContacts = allContacts.map((contact: Contact) => {
      if (contact.userId === user.id && contact.contactId === contactId) {
        return {
          ...contact,
          lastMessage: messageText || "No messages",
          time: messageText ? "Just now" : "No messages",
        }
      }

      // Also update the reciprocal contact for the other user
      if (contact.userId === contactId && contact.contactId === user.id) {
        return {
          ...contact,
          lastMessage: messageText || "No messages",
          time: messageText ? "Just now" : "No messages",
          unread: contact.unread + (messageText ? 1 : 0), // Increment unread count
        }
      }

      return contact
    })

    localStorage.setItem("allContacts", JSON.stringify(updatedAllContacts))

    // Update local state
    setContacts(
      contacts.map((contact) =>
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

  const updateTypingStatus = (contactId: string, isTyping: boolean) => {
    if (!user) return

    // Update typing status in localStorage
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
    const updatedAllUsers = allUsers.map((u: UserType) => {
      if (u.id === user.id) {
        const typing = u.typing || {}
        return { ...u, typing: { ...typing, [contactId]: isTyping } }
      }
      return u
    })

    localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers))
  }

  const isContactTyping = (contactId: string) => {
    if (!user) return false

    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
    const contactUser = allUsers.find((u: UserType) => u.id === contactId)

    if (!contactUser || !contactUser.typing) return false

    return contactUser.typing[user.id] || false
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
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getContactStatus = (contactId: string) => {
    if (!user) return null

    // Check if user is online
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
    const contactUser = allUsers.find((u: UserType) => u.id === contactId)

    if (contactUser?.online) {
      return "Online"
    } else if (contactUser?.lastSeen) {
      return `Last seen ${formatTimeRelative(contactUser.lastSeen)}`
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
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <header className="flex h-16 items-center border-b bg-white px-4 dark:bg-gray-950">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <SheetHeader>
                    <SheetTitle className="sr-only">Sidebar Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center border-b px-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{user.name}</div>
                            {getStatusIcon(userStatus)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <Tabs defaultValue="chats" className="w-full" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="chats">Chats</TabsTrigger>
                          <TabsTrigger value="received" className="relative">
                            Received
                            {receivedRequests.length > 0 && (
                              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                {receivedRequests.length}
                              </span>
                            )}
                          </TabsTrigger>
                          <TabsTrigger value="sent">Sent</TabsTrigger>
                          <TabsTrigger value="blocked">Blocked</TabsTrigger>
                        </TabsList>

                        <TabsContent value="chats" className="flex flex-col h-full">
                          <div className="flex items-center gap-2 border-b p-4">
                            <div className="relative w-full">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <Input
                                placeholder="Search contacts..."
                                className="h-9 pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowFilterOptions(!showFilterOptions)}
                              className={cn(
                                "h-9 w-9",
                                (filterOptions.showOnlineOnly || filterOptions.sortBy !== "recent") &&
                                  "text-blue-600 dark:text-blue-400",
                              )}
                            >
                              <Filter className="h-4 w-4" />
                            </Button>
                          </div>
                          {showFilterOptions && (
                            <div className="border-b p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="online-only" className="text-sm">
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
                              <div className="space-y-1">
                                <Label className="text-sm">Sort by</Label>
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
                                    <RadioGroupItem value="recent" id="recent" />
                                    <Label htmlFor="recent" className="text-sm font-normal">
                                      Recent messages
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="name" id="name" />
                                    <Label htmlFor="name" className="text-sm font-normal">
                                      Name
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="unread" id="unread" />
                                    <Label htmlFor="unread" className="text-sm font-normal">
                                      Unread messages
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-end p-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowAddContact(true)}
                              className="text-xs"
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Add Contact
                            </Button>
                          </div>
                          <ScrollArea className="flex-1">
                            <div className="p-2">
                              {filteredContacts.length > 0 ? (
                                filteredContacts.map((contact) => (
                                  <button
                                    key={contact.id}
                                    className={cn(
                                      "flex w-full items-center gap-3 rounded-lg p-2 text-left",
                                      selectedContact?.contactId === contact.contactId
                                        ? "bg-gray-100 dark:bg-gray-800"
                                        : "hover:bg-gray-100 dark:hover:bg-gray-800",
                                    )}
                                    onClick={() => {
                                      setSelectedContact(contact)
                                      setSidebarOpen(false)
                                    }}
                                  >
                                    <div className="relative">
                                      <Avatar>
                                        {contact.avatar ? (
                                          <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                        ) : (
                                          <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                                        )}
                                      </Avatar>
                                      {contact.online && (
                                        <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-950" />
                                      )}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                      <div className="flex items-center justify-between">
                                        <div className="font-medium">{contact.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{contact.time}</div>
                                      </div>
                                      <div className="text-sm text-gray-500 truncate dark:text-gray-400">
                                        {isContactTyping(contact.contactId) ? (
                                          <span className="text-blue-600 dark:text-blue-400 italic">typing...</span>
                                        ) : (
                                          contact.lastMessage
                                        )}
                                      </div>
                                    </div>
                                    {contact.unread > 0 && (
                                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
                                        {contact.unread}
                                      </div>
                                    )}
                                  </button>
                                ))
                              ) : (
                                <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                  {searchQuery ? "No contacts found" : "No contacts yet"}
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="received" className="flex flex-col h-full">
                          <ScrollArea className="flex-1">
                            <div className="p-2">
                              {receivedRequests.length > 0 ? (
                                receivedRequests.map((contact) => (
                                  <div
                                    key={contact.id}
                                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left border-b"
                                  >
                                    <div className="relative">
                                      <Avatar>
                                        {contact.avatar ? (
                                          <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                        ) : (
                                          <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                                        )}
                                      </Avatar>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                      <div className="font-medium">{contact.name}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</div>
                                    </div>
                                    <div className="flex gap-1">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => handleAcceptContact(contact.contactId)}
                                              className="h-8 w-8 text-green-500"
                                            >
                                              <Check className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Accept</p>
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
                                              className="h-8 w-8 text-red-500"
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Reject</p>
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
                                              className="h-8 w-8 text-gray-500"
                                            >
                                              <Shield className="h-4 w-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Block</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                  No pending requests
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="sent" className="flex flex-col h-full">
                          <ScrollArea className="flex-1">
                            <div className="p-2">
                              {sentRequests.length > 0 ? (
                                sentRequests.map((contact) => (
                                  <div
                                    key={contact.id}
                                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left border-b"
                                  >
                                    <div className="relative">
                                      <Avatar>
                                        {contact.avatar ? (
                                          <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                        ) : (
                                          <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                                        )}
                                      </Avatar>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                      <div className="font-medium">{contact.name}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</div>
                                      <div className="text-xs text-blue-600 dark:text-blue-400">Request sent</div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCancelRequest(contact.contactId)}
                                      className="text-xs"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ))
                              ) : (
                                <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                  No sent requests
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="blocked" className="flex flex-col h-full">
                          <ScrollArea className="flex-1">
                            <div className="p-2">
                              {blockedContacts.length > 0 ? (
                                blockedContacts.map((contact) => (
                                  <div
                                    key={contact.id}
                                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left border-b"
                                  >
                                    <div className="relative">
                                      <Avatar>
                                        {contact.avatar ? (
                                          <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                        ) : (
                                          <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                                        )}
                                      </Avatar>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                      <div className="font-medium">{contact.name}</div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleUnblockContact(contact.contactId)}
                                    >
                                      Unblock
                                    </Button>
                                  </div>
                                ))
                              ) : (
                                <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
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
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white">
                <Image
                  src="/vartasetu-logo-icon.jpeg"
                  alt="VartaSetu Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="text-xl font-bold text-gray-700">VartaSetu</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowProfile(true)}>
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {!isMobile && (
          <aside className="h-full w-80 border-r bg-white dark:bg-gray-950">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center border-b px-4">
                <div className="flex items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{user.name}</div>
                      {getStatusIcon(userStatus)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col overflow-hidden">
                <Tabs defaultValue="chats" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="chats">Chats</TabsTrigger>
                    <TabsTrigger value="received" className="relative">
                      Received
                      {receivedRequests.length > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                          {receivedRequests.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="sent">Sent</TabsTrigger>
                    <TabsTrigger value="blocked">Blocked</TabsTrigger>
                  </TabsList>

                  <TabsContent value="chats" className="flex flex-col h-full">
                    <div className="flex items-center gap-2 border-b p-4">
                      <div className="relative w-full">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <Input
                          placeholder="Search contacts..."
                          className="h-9 pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowFilterOptions(!showFilterOptions)}
                        className={cn(
                          "h-9 w-9",
                          (filterOptions.showOnlineOnly || filterOptions.sortBy !== "recent") &&
                            "text-blue-600 dark:text-blue-400",
                        )}
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                    {showFilterOptions && (
                      <div className="border-b p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="online-only" className="text-sm">
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
                        <div className="space-y-1">
                          <Label className="text-sm">Sort by</Label>
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
                              <RadioGroupItem value="recent" id="recent" />
                              <Label htmlFor="recent" className="text-sm font-normal">
                                Recent messages
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="name" id="name" />
                              <Label htmlFor="name" className="text-sm font-normal">
                                Name
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="unread" id="unread" />
                              <Label htmlFor="unread" className="text-sm font-normal">
                                Unread messages
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end p-2">
                      <Button variant="outline" size="sm" onClick={() => setShowAddContact(true)} className="text-xs">
                        <UserPlus className="h-3 w-3 mr-1" />
                        Add Contact
                      </Button>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-2">
                        {filteredContacts.length > 0 ? (
                          filteredContacts.map((contact) => (
                            <button
                              key={contact.id}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-lg p-2 text-left",
                                selectedContact?.contactId === contact.contactId
                                  ? "bg-gray-100 dark:bg-gray-800"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-800",
                              )}
                              onClick={() => {
                                setSelectedContact(contact)
                              }}
                            >
                              <div className="relative">
                                <Avatar>
                                  {contact.avatar ? (
                                    <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                  ) : (
                                    <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                                  )}
                                </Avatar>
                                {contact.online && (
                                  <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-950" />
                                )}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">{contact.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">{contact.time}</div>
                                </div>
                                <div className="text-sm text-gray-500 truncate dark:text-gray-400">
                                  {isContactTyping(contact.contactId) ? (
                                    <span className="text-blue-600 dark:text-blue-400 italic">typing...</span>
                                  ) : (
                                    contact.lastMessage
                                  )}
                                </div>
                              </div>
                              {contact.unread > 0 && (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
                                  {contact.unread}
                                </div>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            {searchQuery ? "No contacts found" : "No contacts yet"}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="received" className="flex flex-col h-full">
                    <ScrollArea className="flex-1">
                      <div className="p-2">
                        {receivedRequests.length > 0 ? (
                          receivedRequests.map((contact) => (
                            <div
                              key={contact.id}
                              className="flex w-full items-center gap-3 rounded-lg p-2 text-left border-b"
                            >
                              <div className="relative">
                                <Avatar>
                                  {contact.avatar ? (
                                    <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                  ) : (
                                    <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                                  )}
                                </Avatar>
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div className="font-medium">{contact.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</div>
                              </div>
                              <div className="flex gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleAcceptContact(contact.contactId)}
                                        className="h-8 w-8 text-green-500"
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Accept</p>
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
                                        className="h-8 w-8 text-red-500"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Reject</p>
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
                                        className="h-8 w-8 text-gray-500"
                                      >
                                        <Shield className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Block</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            No pending requests
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="sent" className="flex flex-col h-full">
                    <ScrollArea className="flex-1">
                      <div className="p-2">
                        {sentRequests.length > 0 ? (
                          sentRequests.map((contact) => (
                            <div
                              key={contact.id}
                              className="flex w-full items-center gap-3 rounded-lg p-2 text-left border-b"
                            >
                              <div className="relative">
                                <Avatar>
                                  {contact.avatar ? (
                                    <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                  ) : (
                                    <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                                  )}
                                </Avatar>
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div className="font-medium">{contact.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</div>
                                <div className="text-xs text-blue-600 dark:text-blue-400">Request sent</div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelRequest(contact.contactId)}
                                className="text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            No sent requests
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="blocked" className="flex flex-col h-full">
                    <ScrollArea className="flex-1">
                      <div className="p-2">
                        {blockedContacts.length > 0 ? (
                          blockedContacts.map((contact) => (
                            <div
                              key={contact.id}
                              className="flex w-full items-center gap-3 rounded-lg p-2 text-left border-b"
                            >
                              <div className="relative">
                                <Avatar>
                                  {contact.avatar ? (
                                    <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                                  ) : (
                                    <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                                  )}
                                </Avatar>
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div className="font-medium">{contact.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnblockContact(contact.contactId)}
                              >
                                Unblock
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
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
          <div className="flex flex-1 flex-col">
            <div className="flex h-16 items-center border-b px-4">
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="mr-2">
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Back</span>
                </Button>
              )}
              <div className="flex items-center gap-3">
                <Avatar className="cursor-pointer" onClick={() => setShowContactInfo(true)}>
                  {selectedContact.avatar ? (
                    <AvatarImage src={selectedContact.avatar || "/placeholder.svg"} alt={selectedContact.name} />
                  ) : (
                    <AvatarFallback>{getInitials(selectedContact.name)}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium">{selectedContact.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getContactStatus(selectedContact.contactId)}
                  </div>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => initializeCall(false)}>
                        <Phone className="h-5 w-5" />
                        <span className="sr-only">Start audio call</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Start audio call</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => initializeCall(true)}>
                        <Video className="h-5 w-5" />
                        <span className="sr-only">Start video call</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Start video call</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                      <span className="sr-only">More</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowContactInfo(true)}>
                      <Info className="h-4 w-4 mr-2" />
                      Contact Info
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowDeleteChat(true)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDeleteContact(true)}>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Delete Contact
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBlockContact(selectedContact.contactId)}>
                      <Shield className="h-4 w-4 mr-2" />
                      Block Contact
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <ScrollArea className="flex-1 p-2 sm:p-4">
              <div className="flex flex-col gap-2 sm:gap-4">
                {getConversationMessages().map((msg) => (
                  <div
                    key={msg.id}
                    className={cn("flex w-full flex-col", msg.senderId === user.id ? "items-end" : "items-start")}
                  >
                    <div className="flex items-center gap-2">
                      {msg.senderId !== user.id && (
                        <Avatar className="h-6 w-6">
                          {selectedContact.avatar ? (
                            <AvatarImage
                              src={selectedContact.avatar || "/placeholder.svg"}
                              alt={selectedContact.name}
                            />
                          ) : (
                            <AvatarFallback>{getInitials(selectedContact.name)}</AvatarFallback>
                          )}
                        </Avatar>
                      )}
                      <div className="flex flex-col">
                        <div
                          className={cn(
                            "relative rounded-md px-2 sm:px-3 py-2 text-sm shadow-sm max-w-[85vw] sm:max-w-md md:max-w-lg break-words",
                            msg.senderId === user.id
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 dark:text-white",
                          )}
                        >
                          {editingMessage === msg.id ? (
                            <div className="flex flex-col gap-2">
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
                                className="bg-white dark:bg-gray-700"
                              />
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={saveEditedMessage}>
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
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
                                <span className="ml-1 text-[0.7rem] italic text-gray-400 dark:text-gray-500">
                                  (edited)
                                </span>
                              )}
                            </>
                          )}
                          <div className="absolute -top-1 right-2 flex items-center gap-1">
                            {msg.reactions &&
                              Object.entries(msg.reactions).map(([userId, reaction]) => {
                                const reactedUser = JSON.parse(localStorage.getItem("allUsers") || "[]").find(
                                  (u: UserType) => u.id === userId,
                                )
                                return (
                                  <Badge
                                    key={userId}
                                    variant="secondary"
                                    className="cursor-pointer rounded-full border-none"
                                    onClick={() => {
                                      // Show user profile or something
                                    }}
                                  >
                                    {reaction}
                                  </Badge>
                                )
                              })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          {msg.senderId === user.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreVertical className="h-3 w-3" />
                                  <span className="sr-only">More</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditMessage(msg.id)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteMessage(msg.id)}>Delete</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setShowReactions(msg.id)}>React</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          <div className="text-right">{formatTime(msg.timestamp)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="flex h-16 items-center border-t px-2 sm:px-4">
              <div className="flex items-center gap-1 sm:gap-2 w-full">
                <div className="hidden sm:block">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Smile className="h-5 w-5" />
                        <span className="sr-only">Add emoji</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="p-2">
                        <h4 className="mb-2 text-sm font-medium">Emoji Picker</h4>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Coming soon!</div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <Button variant="ghost" size="icon" onClick={handleFileSelect} className="h-9 w-9 flex-shrink-0">
                  <Paperclip className="h-5 w-5" />
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
                  className="h-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="h-9 w-9 flex-shrink-0"
                >
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h2 className="ml-4 text-2xl font-semibold text-gray-400 dark:text-gray-500">
              Select a contact to start chatting
            </h2>
          </div>
        )}
      </main>

      {/* Media Preview Dialog */}
      <Dialog open={showMediaPreview} onOpenChange={setShowMediaPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Media</DialogTitle>
            <DialogDescription>Preview your selected media files before sending.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-80">
            <div className="flex flex-col gap-4">
              {selectedFiles.map((file, index) => {
                const fileUrl = createObjectURL(file)
                return (
                  <div key={index} className="flex items-center gap-4 border rounded-md p-4">
                    {file.type.startsWith("image/") && (
                      <Image
                        src={fileUrl || "/placeholder.svg"}
                        alt={file.name}
                        width={100}
                        height={100}
                        className="object-cover rounded-md"
                      />
                    )}
                    {file.type.startsWith("video/") && (
                      <video src={fileUrl} controls className="max-w-[100px] max-h-[100px]" />
                    )}
                    {file.type.startsWith("audio/") && <audio src={fileUrl} controls className="max-w-[100px]" />}
                    {!file.type.startsWith("image/") &&
                      !file.type.startsWith("video/") &&
                      !file.type.startsWith("audio/") && <File className="h-10 w-10" />}
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setShowMediaPreview(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSendMedia(selectedFiles)}>Send</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>Enter the email address of the user you want to add as a contact.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddContact(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Message Confirmation Dialog */}
      <Dialog open={showDeleteConfirm !== null} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => confirmDeleteMessage(showDeleteConfirm || "")}>
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
      />

      {/* Delete Chat Confirmation Dialog */}
      <Dialog open={showDeleteChat} onOpenChange={() => setShowDeleteChat(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This will remove all messages in this conversation. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setShowDeleteChat(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteChat}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Contact Confirmation Dialog */}
      <Dialog open={showDeleteContact} onOpenChange={() => setShowDeleteContact(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This will remove them from your contact list.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setShowDeleteContact(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteContact}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Sheet */}
      <Sheet open={showProfile} onOpenChange={setShowProfile}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Profile</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b px-4">
              <div className="flex items-center gap-2">
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Manage your personal information, including your name and email address.
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input type="text" id="name" value={user?.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" value={user?.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={false}
                        className="w-full justify-between"
                      >
                        {STATUS_OPTIONS.find((option) => option.value === userStatus)?.label}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <RadioGroup value={userStatus} onValueChange={setUserStatus} className="flex flex-col space-y-1">
                        {STATUS_OPTIONS.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2 px-3 py-1.5">
                            <RadioGroupItem value={option.value} id={option.value} className="h-4 w-4" />
                            <Label htmlFor={option.value} className="text-sm font-normal">
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
            <div className="border-t p-4">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Contact Info Sheet */}
      <Sheet open={showContactInfo} onOpenChange={setShowContactInfo}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Contact Info</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b px-4">
              <Button variant="ghost" size="icon" onClick={() => setShowContactInfo(false)} className="mr-2">
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
              <div className="flex items-center gap-2">
                <Avatar>
                  {selectedContact?.avatar ? (
                    <AvatarImage src={selectedContact?.avatar || "/placeholder.svg"} alt={selectedContact?.name} />
                  ) : (
                    <AvatarFallback>{getInitials(selectedContact?.name || "")}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium">{selectedContact?.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{selectedContact?.email}</div>
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    View and manage contact information for {selectedContact?.name}.
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input type="text" id="name" value={selectedContact?.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" value={selectedContact?.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Input type="text" id="status" value={getContactStatus(selectedContact?.contactId || "")} disabled />
                </div>
              </div>
            </ScrollArea>
            <div className="border-t p-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => handleBlockContact(selectedContact?.contactId || "")}
              >
                <Shield className="h-4 w-4" />
                Block Contact
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 mt-2"
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
        <PopoverContent className="w-80">
          <div className="p-2">
            <h4 className="mb-2 text-sm font-medium">Add Reaction</h4>
            <div className="grid grid-cols-6 gap-2">
              {REACTIONS.map((reaction) => (
                <Button
                  key={reaction}
                  variant="outline"
                  className="w-full justify-center"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Incoming {activeCall?.type} Call</DialogTitle>
            <DialogDescription>
              {
                JSON.parse(localStorage.getItem("allUsers") || "[]").find(
                  (u: UserType) => u.id === activeCall?.callerId,
                )?.name
              }{" "}
              is calling you...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-4 mt-4">
            <Button variant="ghost" onClick={handleAcceptCall} className="text-green-500">
              Accept
            </Button>
            <Button variant="ghost" onClick={() => handleDeclineCall(activeCall?.id || "")} className="text-red-500">
              Decline
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Call Interface */}
      <Dialog open={showCallInterface} onOpenChange={() => setShowCallInterface(false)} className="min-w-[640px]">
        <DialogContent className="bg-black">
          <DialogHeader>
            <DialogTitle className="text-white">
              {activeCall?.type === "video" ? "Video Call" : "Audio Call"} with{" "}
              {
                JSON.parse(localStorage.getItem("allUsers") || "[]").find(
                  (u: UserType) => u.id === activeCall?.receiverId,
                )?.name
              }
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[480px]">
            {/* Local Video */}
            {localStream && (
              <video
                ref={(el) => {
                  if (el) {
                    el.srcObject = localStream
                  }
                }}
                autoPlay
                muted
                className="absolute bottom-4 right-4 w-48 h-36 border border-white rounded-md object-cover"
              />
            )}

            {/* Remote Video */}
            {remoteStream && (
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
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button variant="destructive" onClick={handleEndCall}>
              End Call
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
