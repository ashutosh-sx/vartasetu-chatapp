"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Sun, Moon, Info, Sparkles, Heart } from "lucide-react"
import Image from "next/image"

export default function TermsPage() {
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
                Terms
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
              <Button variant="ghost" className="rounded-xl font-medium text-slate-655 dark:text-slate-355 hover:text-indigo-650">
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
            <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-sm hover:bg-slate-50 dark:border-slate-800/50 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 transition-all hover:-translate-x-0.5 shadow-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Heading */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Info className="h-3.5 w-3.5" />
            <span>Please read these terms carefully before using VartaSetu</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
            Terms of Service
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
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              By accessing or using VartaSetu, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              2. Privacy Policy
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Your use of VartaSetu is also governed by our Privacy Policy, which is incorporated by reference into these Terms of Service. Please review our Privacy Policy to understand our practices.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              3. User Responsibilities
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and session records. You agree to accept responsibility for all activities that occur under your locally preserved user profile.
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              You agree not to use VartaSetu for any illegal or unauthorized purpose. You must not transmit any worms or viruses or any code of a destructive nature.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              4. Acceptable Use
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">You agree not to use VartaSetu to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300 text-sm">
              <li>Harass, abuse, or harm another person</li>
              <li>Impersonate another user or person</li>
              <li>Use the service for any illegal purposes</li>
              <li>Interfere with or disrupt the service or local networks</li>
              <li>Collect or track personal information of other users</li>
              <li>Spam, phish, or engage in any unauthorized advertising</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              5. Intellectual Property
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              The service and its original content, features, and functionality are owned by VartaSetu and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              6. Termination
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              We reserve the right to terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              7. Limitation of Liability
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              In no event shall VartaSetu, nor its developers or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              8. Changes to Terms
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide notice prior to any new terms taking effect.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-600" />
              Reach Out
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              If you have any questions about these Terms, please contact us at <span className="font-semibold text-indigo-600 dark:text-indigo-405 font-sans">vartasetu@outlook.com</span>.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/40 bg-white/20 dark:bg-slate-950/20 py-8 text-slate-500 dark:text-slate-455 relative z-10 transition-colors text-center text-xs space-y-3">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} VartaSetu. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-indigo-500 transition-colors text-indigo-600 dark:text-indigo-400">Terms of Service</Link>
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
