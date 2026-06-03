"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  MessageSquare, 
  Phone, 
  Video, 
  Shield, 
  CheckCheck, 
  Search, 
  ArrowRight, 
  Lock, 
  Moon, 
  Sun,
  LockKeyhole
} from "lucide-react"

// Types for Mockup Chat
type MockMessage = {
  id: string
  sender: "me" | "them"
  text: string
  time: string
}

export default function LandingPage() {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light")
  const [activeContact, setActiveContact] = useState<string>("priya")
  const [mockMessageInput, setMockMessageInput] = useState("")
  const [typingState, setTypingState] = useState(false)

  // Priya's mock messages
  const [priyaMessages, setPriyaMessages] = useState<MockMessage[]>([
    { id: "1", sender: "them", text: "Hey! Did you check out the new VartaSetu updates?", time: "10:30 AM" },
    { id: "2", sender: "me", text: "Not yet! What's new?", time: "10:31 AM" },
    { id: "3", sender: "them", text: "The entire interface has been redesigned. It's incredibly clean now!", time: "10:32 AM" },
  ])

  // Aarav's mock messages
  const [aaravMessages, setAaravMessages] = useState<MockMessage[]>([
    { id: "1", sender: "them", text: "Are we still connecting over video call tonight?", time: "9:15 AM" },
    { id: "2", sender: "me", text: "Yes, absolutely! Around 8 PM?", time: "9:20 AM" },
    { id: "3", sender: "them", text: "Perfect, see you then!", time: "9:21 AM" },
  ])

  // Initialize theme mode based on document class
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

  const QUICK_SUGGESTIONS = [
    "This interface feels extremely smooth! 🚀",
    "Is it end-to-end encrypted?",
    "Let's test the interactive mockup!"
  ]

  const handleSendMockMessage = (textToSend: string) => {
    if (!textToSend.trim()) return

    const newMsg: MockMessage = {
      id: String(Date.now()),
      sender: "me",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    if (activeContact === "priya") {
      setPriyaMessages(prev => [...prev, newMsg])
      setMockMessageInput("")
      simulateReply("priya")
    } else {
      setAaravMessages(prev => [...prev, newMsg])
      setMockMessageInput("")
      simulateReply("aarav")
    }
  }

  const simulateReply = (contact: string) => {
    setTypingState(true)
    setTimeout(() => {
      setTypingState(false)
      const replyMsg: MockMessage = {
        id: String(Date.now() + 1),
        sender: "them",
        text: contact === "priya" 
          ? "Yes! All messaging states are preserved strictly in your local storage. Try launching the app to see it in action."
          : "Absolutely! I love how fluid the custom WebRTC video calls feel. Let's try it out.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
      if (contact === "priya") {
        setPriyaMessages(prev => [...prev, replyMsg])
      } else {
        setAaravMessages(prev => [...prev, replyMsg])
      }
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#07090e] dark:text-[#f8fafc] transition-colors duration-300 relative overflow-hidden selection:bg-indigo-500 selection:text-white font-sans font-normal">
      {/* Decorative clean radial gradients for depth */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 dark:bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none translate-y-1/2" />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/40 bg-slate-50/80 backdrop-blur-md dark:border-slate-900/60 dark:bg-[#07090e]/80 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Image
                src="/vartasetu-logo-icon.jpeg"
                alt="VartaSetu"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="text-base font-semibold tracking-tight">
              VartaSetu
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleGlobalTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
              title="Toggle theme"
            >
              {themeMode === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all px-4">
                Launch App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-20 relative z-10 space-y-24 md:space-y-32">
        <section className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
            <LockKeyhole className="h-3 w-3" />
            <span>Local-First &amp; P2P Messaging Client</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] text-slate-950 dark:text-white">
            Private conversations, <br />
            <span className="text-indigo-600 dark:text-indigo-450 font-medium">crafted for clarity.</span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-light">
            VartaSetu runs directly in your browser. With serverless WebRTC audio/video call pipelines and local database synchronization, your chats remain strictly yours.
          </p>
          
          <div className="flex items-center gap-4 pt-2">
            <Link href="/register">
              <Button size="lg" className="rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 px-6 py-5 text-sm">
                Get Started Free
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="rounded-lg font-medium border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 px-6 py-5 text-sm">
                Learn More
              </Button>
            </Link>
          </div>
        </section>

        {/* Live Mockup App Preview */}
        <section className="flex justify-center w-full">
          <div className="w-full max-w-[840px] rounded-2xl border border-slate-200/80 bg-white/60 dark:border-slate-800/80 dark:bg-slate-950/40 p-2 shadow-2xl backdrop-blur-md relative">
            
            {/* Window control bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200/40 dark:border-slate-900/60 bg-white/80 dark:bg-slate-950/60 rounded-t-xl">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-250 dark:bg-slate-800" />
                <span className="w-3 h-3 rounded-full bg-slate-250 dark:bg-slate-800" />
                <span className="w-3 h-3 rounded-full bg-slate-250 dark:bg-slate-800" />
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-3 py-0.5 rounded-md border border-slate-200/20 dark:border-slate-800/30">
                <Lock className="h-2.5 w-2.5" />
                <span>Sandbox Live Demo</span>
              </div>
              <div className="w-12" />
            </div>

            {/* Chat UI Sandbox */}
            <div className="grid grid-cols-12 h-[440px] bg-white dark:bg-[#090b11] rounded-b-xl overflow-hidden border-t border-slate-200/30 dark:border-slate-900/30">
              
              {/* Sidebar */}
              <div className="col-span-4 border-r border-slate-200/40 dark:border-slate-900/60 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20">
                <div className="p-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search conversations..." 
                      disabled
                      className="w-full bg-white dark:bg-slate-900 pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-200/60 dark:border-slate-800 focus:outline-none opacity-80 cursor-not-allowed" 
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-1 font-sans">
                  {/* Contact Priya */}
                  <button 
                    onClick={() => setActiveContact("priya")}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${activeContact === "priya" ? "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white" : "hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-500 dark:text-slate-400"}`}
                  >
                    <div className="relative w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium text-xs">
                      PS
                      <span className="absolute right-0 top-0 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-slate-950" />
                    </div>
                    <div className="hidden sm:block flex-1 overflow-hidden">
                      <div className="text-xs font-medium truncate flex items-center justify-between">
                        <span>Priya Sharma</span>
                        <span className="text-[9px] text-slate-400 font-normal">Active</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">The entire interface has...</div>
                    </div>
                  </button>

                  {/* Contact Aarav */}
                  <button 
                    onClick={() => setActiveContact("aarav")}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${activeContact === "aarav" ? "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white" : "hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-500 dark:text-slate-400"}`}
                  >
                    <div className="relative w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-755 dark:text-emerald-400 font-medium text-xs">
                      AM
                      <span className="absolute right-0 top-0 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-slate-950" />
                    </div>
                    <div className="hidden sm:block flex-1 overflow-hidden">
                      <div className="text-xs font-medium truncate flex items-center justify-between">
                        <span>Aarav Mehta</span>
                        <span className="text-[9px] text-slate-455 font-normal">Active</span>
                      </div>
                      <div className="text-[10px] text-slate-455 truncate">Perfect, see you then!</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Chat View */}
              <div className="col-span-8 flex flex-col h-full bg-white dark:bg-slate-950/10">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-200/40 dark:border-slate-900/60 flex items-center justify-between bg-white dark:bg-slate-950">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${activeContact === "priya" ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"}`}>
                      {activeContact === "priya" ? "PS" : "AM"}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{activeContact === "priya" ? "Priya Sharma" : "Aarav Mehta"}</div>
                      <div className="text-[9px] text-emerald-500 flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                        <span>Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"><Phone className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"><Video className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {(activeContact === "priya" ? priyaMessages : aaravMessages).map(msg => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col max-w-[85%] ${msg.sender === "me" ? "ml-auto items-end" : "mr-auto items-start"}`}
                    >
                      <div className={`px-3 py-2 text-xs rounded-2xl ${msg.sender === "me" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none"}`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                        {msg.time}
                        {msg.sender === "me" && <CheckCheck className="h-2.5 w-2.5 text-indigo-500" />}
                      </span>
                    </div>
                  ))}

                  {typingState && (
                    <div className="flex flex-col items-start mr-auto max-w-[85%]">
                      <div className="px-3 py-2.5 text-xs rounded-2xl bg-slate-100 dark:bg-slate-900 rounded-tl-none flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick suggestions */}
                <div className="px-3 py-1.5 bg-slate-50 dark:bg-[#090b11]/80 border-t border-slate-200/30 dark:border-slate-900/30 overflow-x-auto whitespace-nowrap flex gap-1.5 custom-scrollbar">
                  {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMockMessage(suggestion)}
                      className="text-[10px] bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 px-2 py-1 rounded-md transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                {/* Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMockMessage(mockMessageInput)
                  }}
                  className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200/40 dark:border-slate-900/60 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type a preview message..."
                    value={mockMessageInput}
                    onChange={(e) => setMockMessageInput(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs rounded-lg border border-slate-200/60 dark:border-slate-800 focus:outline-none focus:border-slate-300 dark:focus:border-slate-700 transition-colors dark:text-slate-100"
                  />
                  <button 
                    type="submit"
                    disabled={!mockMessageInput.trim()}
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Features Column Layout */}
        <section className="space-y-12 max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Fully Local, Exceptionally Quick
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-light">
              We skipped the cloud servers. VartaSetu connects users directly through standard browser-native architectures.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-900 pt-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <MessageSquare className="h-4.5 w-4.5 text-indigo-500" />
                <h3 className="text-sm font-semibold">Instant Local Chats</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                Send messages with reaction emojis, edit inline text, and utilize soft deletions. Data stores directly inside local database partitions.
              </p>
            </div>

            <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-900 pt-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Video className="h-4.5 w-4.5 text-indigo-500" />
                <h3 className="text-sm font-semibold">WebRTC VoIP Calling</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                Connect peer-to-peer using high-performance audio and video call streams. Free of routing servers or centralized storage networks.
              </p>
            </div>

            <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-900 pt-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Shield className="h-4.5 w-4.5 text-indigo-500" />
                <h3 className="text-sm font-semibold">Complete Privacy</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                Block and unblock contacts, toggle dark mode settings, and manage presence states without tracking trackers or telemetry.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center max-w-xl mx-auto space-y-4 pb-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-950 dark:text-white tracking-tight">
            Ready to try it out?
          </h2>
          <p className="text-sm text-slate-550 dark:text-slate-400 font-light leading-relaxed">
            Create an instant profile. No accounts setup limits, no credit checks, fully private local environments.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-lg font-medium bg-indigo-600 hover:bg-indigo-750 text-white shadow-sm px-6 text-sm">
                Get Started Free
              </Button>
            </Link>
            <span className="text-xs text-slate-400 font-light">Free, private, and instant.</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/40 dark:border-slate-900/60 bg-white/20 dark:bg-slate-950/10 py-12 text-slate-500 dark:text-slate-400 relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative h-6 w-6 overflow-hidden rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Image
                  src="/vartasetu-logo-icon.jpeg"
                  alt="VartaSetu"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">VartaSetu</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Connecting people through private, client-side web communication pipelines.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-wider text-slate-800 dark:text-slate-200 mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-indigo-500 transition-colors">About Story</Link></li>
              <li><Link href="/register" className="hover:text-indigo-500 transition-colors">Create Account</Link></li>
              <li><Link href="/login" className="hover:text-indigo-500 transition-colors">Login Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-wider text-slate-800 dark:text-slate-200 mb-3">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/privacy-policy" className="hover:text-indigo-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-500 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-8 pt-8 border-t border-slate-200/20 dark:border-slate-900/40 text-center text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} VartaSetu. All rights reserved.</p>
          <p className="flex items-center gap-1 font-light">Developed for secure web communication.</p>
        </div>
      </footer>
    </div>
  )
}
