"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  loadGoogleScript,
  initGoogleOneTap,
  showGoogleOneTap,
  processGoogleCredential,
  saveUserToLocalStorage,
} from "@/utils/auth-utils"
// Add import for ArrowLeft icon
import { Loader2, ArrowLeft } from "lucide-react"
import { GoogleAuthButton } from "@/components/google-auth-button"

export default function RegisterPage() {
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
          handleGoogleSignup(response)
        })

        // Render the Google button
        if (googleButtonRef.current && !isInitializedRef.current) {
          showGoogleOneTap("google-signup-button")
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
      showGoogleOneTap("google-signup-button")
    }
  }, [googleButtonRef.current, isLoading, scriptError, useFallback])

  const handleGoogleSignup = async (response: any) => {
    try {
      setIsLoading(true)
      // Process the credential
      const userData = processGoogleCredential(response)

      // Sync user with PostgreSQL database
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.picture || "/default-avatar.png",
        }),
      })

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to authenticate with database")
      }

      // Save user to localStorage for active session
      localStorage.setItem("user", JSON.stringify(data.user))

      // Show success message
      toast({
        title: "Account Created / Logged In",
        description: `Welcome to VartaSetu, ${data.user.name}!`,
      })

      // Redirect to chat page
      setTimeout(() => {
        router.push("/chat")
      }, 1000)
    } catch (error: any) {
      console.error("Error processing Google signup:", error)
      setIsLoading(false)
      toast({
        title: "Sign Up Failed",
        description: error.message || "There was an error signing up with Google. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleManualGoogleSignup = () => {
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafbfc] dark:bg-[#0b0f19] p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-br from-indigo-500/10 to-violet-500/5 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Back Button */}
        <div className="w-full flex justify-start">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-sm hover:bg-slate-50 dark:border-slate-800/50 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 transition-all hover:-translate-x-0.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Logo and Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-md dark:border-slate-805 dark:bg-slate-950 flex items-center justify-center">
              <Image
                src="/vartasetu-logo-icon.jpeg"
                alt="VartaSetu Logo"
                width={80}
                height={80}
                className="object-contain p-1"
              />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 dark:from-white dark:via-indigo-100 dark:to-indigo-300 bg-clip-text text-transparent">
              VartaSetu
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Join the conversation today</p>
          </div>
        </div>

        {/* Authentication Card */}
        <Card className="border border-slate-200/60 bg-white/80 dark:border-slate-800/60 dark:bg-slate-900/40 shadow-xl backdrop-blur-md rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold">Create an account</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Sign up with Google to get started</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-2">
            {isLoading && !useFallback ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
                <p className="mt-3 text-xs text-slate-400">Loading secure authenticator...</p>
              </div>
            ) : scriptError && !useFallback ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-red-500 font-medium">{scriptError}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="rounded-xl border-slate-200 dark:border-slate-800"
                >
                  Retry Connection
                </Button>
              </div>
            ) : useFallback ? (
              <div className="w-full py-2">
                <GoogleAuthButton onSuccess={handleGoogleSignup} text="Sign up with Google" />
              </div>
            ) : (
              <div className="w-full space-y-3">
                <div id="google-signup-button" ref={googleButtonRef} className="w-full flex justify-center py-1"></div>
                <Button 
                  variant="outline" 
                  className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold" 
                  onClick={handleManualGoogleSignup}
                >
                  Sign up with Google
                </Button>
              </div>
            )}

            <div className="mt-6 text-center text-[11px] text-slate-400 leading-relaxed max-w-[280px]">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-indigo-600 hover:underline dark:text-indigo-450 font-semibold">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-indigo-600 hover:underline dark:text-indigo-450 font-semibold">
                Privacy Policy
              </Link>
              .
            </div>
          </CardContent>
          <CardFooter className="flex flex-col bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-900 py-4">
            <div className="text-center text-sm text-slate-550 dark:text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
