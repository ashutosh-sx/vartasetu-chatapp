"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShieldCheck, Mail, Sun, Moon, Lock, Info, Sparkles, Heart } from "lucide-react"
import Image from "next/image"

export default function PrivacyPolicyPage() {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light")

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setThemeMode(isDark ? "dark" : "light")
  }, [])

  const toggleGlobalTheme = () => {
    const root = document.documentElement
    if (themeMode === "light") {
      root.classList.add("dark")
      setThemeMode("dark")
    } else {
      root.classList.remove("dark")
      setThemeMode("light")
    }
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-[#1e293b] dark:bg-[#0b0f19] dark:text-[#f8fafc] transition-colors duration-300 relative overflow-hidden flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/20 dark:bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-200/20 dark:bg-violet-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-md dark:border-slate-800/40 dark:bg-[#0b0f19]/70 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-gradient-to-tr from-indigo-650 to-violet-500 shadow-md flex items-center justify-center text-white">
              <Image
                src="/vartasetu-logo-icon.jpeg"
                alt="VartaSetu Logo"
                width={36}
                height={36}
                className="object-contain opacity-95 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 dark:from-white dark:via-indigo-100 dark:to-indigo-300 bg-clip-text text-transparent">
                VartaSetu
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-405 font-medium tracking-widest uppercase">
                Privacy
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleGlobalTheme}
              className="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all text-slate-500 dark:text-slate-400"
              title="Toggle theme"
            >
              {themeMode === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>
            <Link href="/login">
              <Button variant="ghost" className="rounded-xl font-medium text-slate-655 dark:text-slate-350 hover:text-indigo-650">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-xl font-semibold bg-indigo-650 hover:bg-indigo-700 text-white shadow-sm transition-all px-5">
                Launch App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20 relative z-10 space-y-12 flex-1 w-full animate-fade-in">
        
        {/* Back Link */}
        <div className="flex justify-start">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-sm hover:bg-slate-50 dark:border-slate-800/50 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-355 transition-all hover:-translate-x-0.5 shadow-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Heading */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Lock className="h-3.5 w-3.5" />
            <span>Your privacy is our top priority</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">
            Last Updated: April 12, 2025
          </p>
        </div>

        {/* Document Flow */}
        <div className="space-y-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/30 p-6 md:p-10 shadow-lg backdrop-blur-sm">
          
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              Our Commitment to Privacy
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              At VartaSetu, we take your privacy seriously. Our platform is designed with privacy and security as core principles. We believe that your conversations should remain private and secure at all times.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              End-to-End Encryption
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              All messages sent through VartaSetu are protected with end-to-end encryption. This means that only you and the person you're communicating with can read what is sent, and nobody in between, not even VartaSetu, has access.
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Your messages are secured with locks, and only the recipient has the special keys needed to unlock and read them. Even better, the keys change with every single message you send.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              Message Deletion
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              You have complete control over your messages. You can delete messages for everyone in the conversation, not just for yourself. Once deleted, messages are permanently removed from our servers and local cache records.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              Data Collection
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              We collect minimal information necessary to provide our service. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300 text-sm">
              <li>Your email address (for account creation and contact discovery)</li>
              <li>Basic usage statistics to improve our service</li>
              <li>Device information for security and troubleshooting</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-2">
              We do NOT read or store the content of your messages on our servers after they've been delivered. All chat histories are stored locally on your own machine.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              Third-Party Access
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              We do not sell, rent, or monetize your personal information or data. Period.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              Security Measures
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              In addition to end-to-end encryption, we implement several security measures:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300 text-sm">
              <li>Two-factor authentication</li>
              <li>Secure data storage with encryption at rest</li>
              <li>Regular security audits and penetration testing</li>
              <li>Automatic detection of suspicious login attempts</li>
            </ul>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-600" />
              Contact Privacy Officer
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              If you have any questions about this Privacy Policy or data preservation, please contact us at <span className="font-semibold text-indigo-600 dark:text-indigo-400">vartasetu@outlook.com</span>.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/40 bg-white/20 dark:bg-slate-950/20 py-8 text-slate-500 dark:text-slate-450 relative z-10 transition-colors text-center text-xs space-y-3">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} VartaSetu. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-indigo-500 transition-colors">Terms of Service</Link>
            <Link href="/privacy-policy" className="hover:text-indigo-500 transition-colors text-indigo-600 dark:text-indigo-400">Privacy Policy</Link>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
          Developed for secure, private web communication.
        </p>
      </footer>
    </div>
  )
}
