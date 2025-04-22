// Media permissions and WebRTC utilities

// Request media permissions
export async function requestMediaPermissions(video = false, audio = true) {
  try {
    // First check if permissions are already granted
    try {
      const permissions = await navigator.permissions.query({ name: "microphone" as PermissionName })

      if (permissions.state === "denied") {
        return {
          success: false,
          error: "Microphone permission was denied. Please allow access in your browser settings.",
        }
      }

      // If video is requested, also check camera permissions
      if (video) {
        try {
          const videoPermissions = await navigator.permissions.query({ name: "camera" as PermissionName })
          if (videoPermissions.state === "denied") {
            return {
              success: false,
              error: "Camera permission was denied. Please allow access in your browser settings.",
            }
          }
        } catch (err) {
          // Some browsers might not support this query
          console.log("Could not query camera permissions:", err)
        }
      }
    } catch (err) {
      // Some browsers might not support permissions query API
      console.log("Could not query permissions:", err)
    }

    // Request the actual media stream
    const constraints = {
      audio,
      video: video ? { width: 640, height: 480 } : false,
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      return { success: true, stream }
    } catch (streamError: any) {
      console.error("Error getting media stream:", streamError)

      // Handle permission dismissal or denial
      if (streamError.name === "NotAllowedError" || streamError.name === "PermissionDeniedError") {
        return {
          success: false,
          error: `Permission ${streamError.message.includes("dismissed") ? "dismissed" : "denied"}. Please allow access to your ${video ? "camera and microphone" : "microphone"} in your browser settings.`,
        }
      } else if (streamError.name === "NotFoundError" || streamError.name === "DevicesNotFoundError") {
        return {
          success: false,
          error: `${video ? "Camera and/or microphone" : "Microphone"} not found. Please check your device connections.`,
        }
      } else if (streamError.name === "NotReadableError" || streamError.name === "TrackStartError") {
        return {
          success: false,
          error: `Could not access your ${video ? "camera and/or microphone" : "microphone"}. The device might be in use by another application.`,
        }
      }

      return {
        success: false,
        error: `Error accessing media devices: ${streamError.message || streamError}`,
      }
    }
  } catch (error: any) {
    console.error("Error in requestMediaPermissions:", error)
    return {
      success: false,
      error: `Error accessing media devices: ${error.message || error}`,
    }
  }
}

// Simple WebRTC peer connection implementation
export class RTCConnection {
  peerConnection: RTCPeerConnection | null = null
  localStream: MediaStream | null = null
  remoteStream: MediaStream | null = null
  onRemoteStreamChange: ((stream: MediaStream) => void) | null = null
  onConnectionStateChange: ((state: RTCPeerConnectionState) => void) | null = null
  onIceCandidate: ((candidate: RTCIceCandidate) => void) | null = null

  constructor() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
        },
      ],
    })

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate)
      }
    }

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0]
      if (this.onRemoteStreamChange) {
        this.onRemoteStreamChange(this.remoteStream)
      }
    }

    this.peerConnection.onconnectionstatechange = () => {
      if (this.onConnectionStateChange && this.peerConnection) {
        this.onConnectionStateChange(this.peerConnection.connectionState)
      }
    }
  }

  async addLocalStream(stream: MediaStream) {
    this.localStream = stream
    stream.getTracks().forEach((track) => {
      if (this.peerConnection && this.localStream) {
        this.peerConnection.addTrack(track, this.localStream)
      }
    })
  }

  async createOffer() {
    if (!this.peerConnection) return null
    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)
    return offer
  }

  async createAnswer(offer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return null
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    return answer
  }

  async setRemoteAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
  }

  async addIceCandidate(candidate: RTCIceCandidate) {
    if (!this.peerConnection) return
    await this.peerConnection.addIceCandidate(candidate)
  }

  closeConnection() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }

    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }
  }
}

// File handling utilities
export async function selectFiles(accept = "*/*", multiple = false): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = accept
    input.multiple = multiple

    input.onchange = () => {
      const files = Array.from(input.files || [])
      resolve(files)
    }

    input.click()
  })
}

export function getFileType(file: File): "image" | "video" | "audio" | "document" {
  if (file.type.startsWith("image/")) return "image"
  if (file.type.startsWith("video/")) return "video"
  if (file.type.startsWith("audio/")) return "audio"
  return "document"
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB"
}

export function createObjectURL(file: File): string {
  return URL.createObjectURL(file)
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url)
}
