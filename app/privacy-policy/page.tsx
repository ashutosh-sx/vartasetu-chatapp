import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-white">
                <Image
                  src="/vartasetu-logo-icon.jpeg"
                  alt="VartaSetu Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-xl text-gray-700">VartaSetu</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <Link href="/" className="inline-flex items-center">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Privacy Policy</h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Your privacy is our top priority
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl space-y-8 py-12">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Our Commitment to Privacy</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  At VartaSetu, we take your privacy seriously. Our platform is designed with privacy and security as
                  core principles. We believe that your conversations should remain private and secure at all times.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">End-to-End Encryption</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  All messages sent through VartaSetu are protected with end-to-end encryption. This means that only you
                  and the person you're communicating with can read what is sent, and nobody in between, not even
                  VartaSetu.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Your messages are secured with locks, and only the recipient has the special keys needed to unlock and
                  read them. Even better, the keys change with every single message you send.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Message Deletion</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  You have complete control over your messages. You can delete messages for everyone in the
                  conversation, not just for yourself. Once deleted, messages are permanently removed from our servers.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Data Collection</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  We collect minimal information necessary to provide our service. This includes:
                </p>
                <ul className="list-disc pl-6 text-gray-500 dark:text-gray-400">
                  <li>Your email address (for account creation and contact discovery)</li>
                  <li>Basic usage statistics to improve our service</li>
                  <li>Device information for security and troubleshooting</li>
                </ul>
                <p className="text-gray-500 dark:text-gray-400">
                  We do NOT read or store the content of your messages on our servers after they've been delivered.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Third-Party Access</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  We do not sell, rent, or monetize your personal information or data. Period.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Security Measures</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  In addition to end-to-end encryption, we implement several security measures:
                </p>
                <ul className="list-disc pl-6 text-gray-500 dark:text-gray-400">
                  <li>Two-factor authentication</li>
                  <li>Secure data storage with encryption at rest</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Automatic detection of suspicious login attempts</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Changes to This Policy</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
                  new Privacy Policy on this page and updating the "Last Updated" date.
                </p>
                <p className="text-gray-500 dark:text-gray-400">Last Updated: April 12, 2025</p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Contact Us</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  If you have any questions about our Privacy Policy, please contact us at
                  privacy@vartasetu.example.com.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">© 2025 VartaSetu. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
