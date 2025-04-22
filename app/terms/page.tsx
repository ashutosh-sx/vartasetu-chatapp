import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

export default function TermsPage() {
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
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Terms of Service</h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Please read these terms carefully before using our service
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl space-y-8 py-12">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  By accessing or using VartaSetu, you agree to be bound by these Terms of Service and all applicable
                  laws and regulations. If you do not agree with any of these terms, you are prohibited from using or
                  accessing this service.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">2. Privacy Policy</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Your use of VartaSetu is also governed by our Privacy Policy, which is incorporated by reference into
                  these Terms of Service. Please review our Privacy Policy to understand our practices.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">3. User Responsibilities</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  You are responsible for maintaining the confidentiality of your account and password. You agree to
                  accept responsibility for all activities that occur under your account.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  You agree not to use VartaSetu for any illegal or unauthorized purpose. You must not transmit any
                  worms or viruses or any code of a destructive nature.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">4. Acceptable Use</h2>
                <p className="text-gray-500 dark:text-gray-400">You agree not to use VartaSetu to:</p>
                <ul className="list-disc pl-6 text-gray-500 dark:text-gray-400">
                  <li>Harass, abuse, or harm another person</li>
                  <li>Impersonate another user or person</li>
                  <li>Use the service for any illegal purposes</li>
                  <li>Interfere with or disrupt the service or servers</li>
                  <li>Collect or track personal information of other users</li>
                  <li>Spam, phish, or engage in any unauthorized advertising</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">5. Intellectual Property</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  The service and its original content, features, and functionality are owned by VartaSetu and are
                  protected by international copyright, trademark, patent, trade secret, and other intellectual property
                  laws.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">6. Termination</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  We may terminate or suspend your account and bar access to the service immediately, without prior
                  notice or liability, under our sole discretion, for any reason whatsoever, including without
                  limitation if you breach the Terms.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">7. Limitation of Liability</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  In no event shall VartaSetu, nor its directors, employees, partners, agents, suppliers, or affiliates,
                  be liable for any indirect, incidental, special, consequential or punitive damages, including without
                  limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your
                  access to or use of or inability to access or use the service.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">8. Changes to Terms</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a
                  revision is material we will provide at least 30 days' notice prior to any new terms taking effect.
                </p>
                <p className="text-gray-500 dark:text-gray-400">Last Updated: April 12, 2025</p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">9. Contact Us</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  If you have any questions about these Terms, please contact us at vartasetu@outlook.com.
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
        <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
          Made in India 🇮🇳
        </div>
      </footer>
    </div>
  )
}
