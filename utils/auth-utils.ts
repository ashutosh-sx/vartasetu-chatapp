// Google Auth utilities

// Google OAuth configuration
const GOOGLE_CLIENT_ID = "199094145797-uuugbmg4klhhedg54f0uhve5aggoilv3.apps.googleusercontent.com"
const GOOGLE_REDIRECT_URI = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : ""

// Load the Google API script
export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.getElementById("google-auth-script")) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.id = "google-auth-script"
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = (error) => reject(error)
    document.head.appendChild(script)
  })
}

// Initialize Google One Tap
export function initGoogleOneTap(callback: (response: any) => void): void {
  if (!window.google) return

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: callback,
    auto_select: false,
    cancel_on_tap_outside: true,
  })
}

// Display Google One Tap
export function showGoogleOneTap(buttonId?: string): void {
  if (!window.google) return

  if (buttonId) {
    const buttonElement = document.getElementById(buttonId)
    if (buttonElement) {
      window.google.accounts.id.renderButton(buttonElement, {
        theme: "outline",
        size: "large",
        width: 280,
        text: "continue_with",
        logo_alignment: "center",
      })
    }
  } else {
    window.google.accounts.id.prompt()
  }
}

// Process Google credential response
export function processGoogleCredential(response: any): any {
  try {
    // Decode the JWT token to get user information
    const token = response.credential
    const payload = JSON.parse(atob(token.split(".")[1]))

    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture || "/default-avatar.png",
    }
  } catch (error) {
    console.error("Error processing Google credential:", error)
    throw new Error("Failed to process Google authentication response")
  }
}

// Save user to localStorage
export function saveUserToLocalStorage(user: any): void {
  // Create a user object with the required fields
  const userToSave = {
    id: `google_${user.id}`,
    name: user.name,
    email: user.email,
    avatar: user.picture || "/default-avatar.png",
    online: true,
    lastSeen: Date.now(),
    darkMode: false,
    notifications: true,
    status: "available",
    typing: {},
  }

  // Check if user already exists
  const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
  const existingUserIndex = allUsers.findIndex((u: any) => u.id === userToSave.id)

  if (existingUserIndex >= 0) {
    // Update existing user
    allUsers[existingUserIndex] = {
      ...allUsers[existingUserIndex],
      online: true,
      lastSeen: Date.now(),
    }
  } else {
    // Add new user
    allUsers.push(userToSave)
  }

  // Save to localStorage
  localStorage.setItem("allUsers", JSON.stringify(allUsers))
  localStorage.setItem("user", JSON.stringify(userToSave))

  // Initialize empty contacts and messages arrays if they don't exist
  if (!localStorage.getItem("allContacts")) {
    localStorage.setItem("allContacts", JSON.stringify([]))
  }

  if (!localStorage.getItem("allMessages")) {
    localStorage.setItem("allMessages", JSON.stringify([]))
  }
}

// Add TypeScript interface for window to include google
declare global {
  interface Window {
    google: any
  }
}
