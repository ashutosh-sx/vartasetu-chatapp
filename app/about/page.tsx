"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, Sparkles, Shield, Compass, ShieldCheck, Mail, Sun, Moon } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
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
            <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md flex items-center justify-center text-white">
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
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium tracking-widest uppercase">
                About
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleGlobalTheme}
              className="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-500 dark:text-slate-400"
              title="Toggle theme"
            >
              {themeMode === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>
            <Link href="/login">
              <Button variant="ghost" className="rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all px-5">
                Launch App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20 relative z-10 space-y-12 flex-1 w-full">
        
        {/* Back Link */}
        <div className="flex justify-start">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-sm hover:bg-slate-50 dark:border-slate-800/50 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all hover:-translate-x-0.5 shadow-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Heading */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Compass className="h-3.5 w-3.5" />
            <span>Connecting India beyond boundaries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
            Our Story & Values
          </h1>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase">
            Local-first. Secure. WebRTC communication.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-8 pt-6">
          <div className="space-y-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/30 p-6 shadow-md backdrop-blur-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              The VartaSetu Story
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              VartaSetu was launched on April 12th, 2025, out of a simple aspiration: to build a messaging framework that was secure, blazing-fast, and completely independent of third-party tracking locks.
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              VartaSetu uses modern WebRTC peer pathways for live media stream connections and leverages client-side storage structures to maintain complete user data confidentiality.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/30 p-6 shadow-md backdrop-blur-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Engineering Values
            </h2>
            <ul className="space-y-3.5">
              <li className="flex gap-3 items-start">
                <div className="h-5 w-5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">100% Privacy at Core</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">All message indices, credentials, and settings remain client-side, encrypted at rest inside local data storage.</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <div className="h-5 w-5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Zero-Latency WebRTC Pipelines</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">No routing through sluggish media proxy servers; video and voice call channels operate directly browser-to-browser.</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <div className="h-5 w-5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">3</div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Human-First Interfaces</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Carefully spaced elements, readable text hierarchies, responsive fluid panels, and a sleek integrated design system.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Support Info */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/50 p-6 md:p-8 space-y-4 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative h-16 w-16 rounded-2xl overflow-hidden border shadow-sm flex-shrink-0 bg-white">
              <Image
                src="/vartasetu-logo-icon.jpeg"
                alt="VartaSetu Logo Icon"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">VartaSetu Platform Support</h3>
              <p className="text-xs text-slate-400 dark:text-slate-400">Have questions, feedback, or need help? Contact support or browse resources.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center border-t border-slate-100 dark:border-slate-900 pt-4 gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-indigo-500" />
              <span>support@vartasetu.org</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-indigo-500" />
              <span>Decentralized signaling pipeline</span>
            </div>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full border border-indigo-100/50 dark:border-indigo-900/30">Stable 1.0.0</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/40 bg-white/20 dark:bg-slate-950/20 py-8 text-slate-500 dark:text-slate-400 relative z-10 transition-colors text-center text-xs space-y-3">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} VartaSetu. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-indigo-500 transition-colors">Terms of Service</Link>
            <Link href="/privacy-policy" className="hover:text-indigo-500 transition-colors">Privacy Policy</Link>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
          Developed for secure, private web communication.
        </p>
      </footer>
    </div>
  )
}
