"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Process the authentication callback
    const processCallback = async () => {
      try {
        // In a real implementation, you would validate the token with your backend
        // For this demo, we'll just check if we have a token and redirect to the chat page

        // Check if user is already logged in
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          router.push("/chat")
          return
        }

        // Check for error parameter
        const errorParam = searchParams.get("error")
        if (errorParam) {
          setError(`Authentication error: ${errorParam}`)
          setTimeout(() => {
            router.push("/login")
          }, 3000)
          return
        }

        // If no token is found, redirect to login
        router.push("/login")
      } catch (error) {
        console.error("Error processing auth callback:", error)
        setError("There was an error processing your login. Please try again.")
        toast({
          title: "Authentication Error",
          description: "There was an error processing your login. Please try again.",
          variant: "destructive",
        })
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    }

    processCallback()
  }, [router, searchParams, toast])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {error ? (
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <p className="text-gray-500 dark:text-gray-400">Redirecting to login page...</p>
        </div>
      ) : (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <h2 className="mt-4 text-xl font-semibold">Processing your login...</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Please wait while we complete your authentication</p>
        </>
      )}
    </div>
  )
}
