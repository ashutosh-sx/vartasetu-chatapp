"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface GoogleAuthButtonProps {
  onSuccess: (response: any) => void
  text?: string
}

export function GoogleAuthButton({ onSuccess, text = "Sign in with Google" }: GoogleAuthButtonProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const [isButtonRendered, setIsButtonRendered] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if the Google API script is already loaded
    if (document.getElementById("google-auth-script")) {
      setIsScriptLoaded(true)
      return
    }

    // Load the Google API script
    const script = document.createElement("script")
    script.id = "google-auth-script"
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => setIsScriptLoaded(true)
    script.onerror = (error) => console.error("Error loading Google auth script:", error)
    document.head.appendChild(script)

    return () => {
      // Clean up if component unmounts before script loads
      const loadedScript = document.getElementById("google-auth-script")
      if (loadedScript && loadedScript.parentNode) {
        loadedScript.parentNode.removeChild(loadedScript)
      }
    }
  }, [])

  useEffect(() => {
    // Initialize Google Sign-In when script is loaded
    if (isScriptLoaded && buttonRef.current && !isButtonRendered && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: "199094145797-uuugbmg4klhhedg54f0uhve5aggoilv3.apps.googleusercontent.com",
          callback: onSuccess,
        })

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: 280,
        })

        setIsButtonRendered(true)
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error)
      }
    }
  }, [isScriptLoaded, onSuccess, isButtonRendered])

  // Fallback button in case Google button doesn't render
  if (!isScriptLoaded) {
    return (
      <Button disabled className="w-full flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  return (
    <div className="w-full">
      <div ref={buttonRef} className="flex justify-center w-full"></div>
      {!isButtonRendered && (
        <Button variant="outline" className="w-full mt-4" onClick={() => window.google?.accounts.id.prompt()}>
          {text}
        </Button>
      )}
    </div>
  )
}
