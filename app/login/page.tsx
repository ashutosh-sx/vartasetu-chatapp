"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
// Add import for ArrowLeft icon
import { Loader2, ArrowLeft } from "lucide-react"
import {
  loadGoogleScript,
  initGoogleOneTap,
  showGoogleOneTap,
  processGoogleCredential,
  saveUserToLocalStorage,
} from "@/utils/auth-utils"
import { GoogleAuthButton } from "@/components/google-auth-button"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)
  const [isLoading, setIsLoading] = useState(true)
  const [scriptError, setScriptError] = useState<string | null>(null)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      router.push("/chat")
      return
    }

    // Load Google script and initialize
    const initializeGoogleAuth = async () => {
      try {
        setIsLoading(true)
        await loadGoogleScript()

        // Initialize Google One Tap
        initGoogleOneTap((response) => {
          handleGoogleLogin(response)
        })

        // Render the Google button
        if (googleButtonRef.current && !isInitializedRef.current) {
          showGoogleOneTap("google-login-button")
          isInitializedRef.current = true
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Error initializing Google auth:", error)
        setScriptError("Failed to load Google authentication. Please try again later.")
        setIsLoading(false)
        setUseFallback(true)
        toast({
          title: "Authentication Error",
          description: "Failed to initialize Google authentication. Trying alternative method...",
          variant: "destructive",
        })
      }
    }

    initializeGoogleAuth()

    // Set a timeout to switch to fallback if Google button doesn't render
    const timeoutId = setTimeout(() => {
      if (!isInitializedRef.current) {
        setUseFallback(true)
      }
    }, 3000)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [router, toast])

  // Re-render Google button if the ref changes
  useEffect(() => {
    if (googleButtonRef.current && !isLoading && !scriptError && window.google && !useFallback) {
      showGoogleOneTap("google-login-button")
    }
  }, [googleButtonRef.current, isLoading, scriptError, useFallback])

  const handleGoogleLogin = (response: any) => {
    try {
      // Process the credential
      const userData = processGoogleCredential(response)

      // Save user to localStorage
      saveUserToLocalStorage(userData)

      // Show success message
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.name}!`,
      })

      // Redirect to chat page
      setTimeout(() => {
        router.push("/chat")
      }, 1000)
    } catch (error) {
      console.error("Error processing Google login:", error)
      toast({
        title: "Login Failed",
        description: "There was an error logging in with Google. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleManualGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt()
    } else {
      toast({
        title: "Google Sign-In Unavailable",
        description: "Please try refreshing the page or use another browser.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        {/* Find the header section in the login page and add a back button */}
        {/* Look for the div with className="mb-8 text-center" and add this before it: */}
        <div className="w-full flex justify-start mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-white">
              <Image
                src="/vartasetu-logo-icon.jpeg"
                alt="VartaSetu Logo"
                width={96}
                height={96}
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">VartaSetu</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Connect with friends in real-time</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription>Continue with Google to access your account</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {isLoading && !useFallback ? (
              <div className="flex flex-col items-center justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="mt-2 text-sm text-gray-500">Loading authentication...</p>
              </div>
            ) : scriptError && !useFallback ? (
              <div className="text-center py-4">
                <p className="text-red-500">{scriptError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-blue-600 hover:underline dark:text-blue-400"
                >
                  Retry
                </button>
              </div>
            ) : useFallback ? (
              <GoogleAuthButton onSuccess={handleGoogleLogin} text="Sign in with Google" />
            ) : (
              <>
                <div id="google-login-button" ref={googleButtonRef} className="w-full flex justify-center my-4"></div>
                <Button variant="outline" className="w-full mt-4" onClick={handleManualGoogleLogin}>
                  Sign in with Google
                </Button>
              </>
            )}

            <div className="mt-4 text-center text-sm text-gray-500">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:underline dark:text-blue-400">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-blue-600 hover:underline dark:text-blue-400">
                Privacy Policy
              </Link>
              .
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
