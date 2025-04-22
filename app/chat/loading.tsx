import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <h2 className="mt-4 text-xl font-semibold">Loading VartaSetu...</h2>
      <p className="mt-2 text-gray-500 dark:text-gray-400">Preparing your conversations</p>
    </div>
  )
}
