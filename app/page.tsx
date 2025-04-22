import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white px-4 py-3 dark:bg-gray-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white">
              <Image
                src="/vartasetu-logo-icon.jpeg"
                alt="VartaSetu Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-gray-700">VartaSetu</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8 md:py-16 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:gap-12 md:grid-cols-2 md:items-center">
            <div className="space-y-4 md:space-y-6 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              A Bridge Beyond Boundaries
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
                VartaSetu is a modern messaging platform that lets you stay connected with the people who matter most.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full">
                    Get Started
                  </Button>
                </Link>
                <Link href="/about" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-md md:max-w-lg overflow-hidden rounded-lg shadow-xl">
              <Image
                src="/vartasetu-landing.png"
                alt="VartaSetu App Screenshot"
                width={600}
                height={400}
                className="object-cover w-full"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white px-4 py-16 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold">Key Features</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-6 shadow-sm">
              <h3 className="mb-3 text-xl font-semibold">Real-time Messaging</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Send and receive messages instantly with friends and family.
              </p>
            </div>
            <div className="rounded-lg border p-6 shadow-sm">
              <h3 className="mb-3 text-xl font-semibold">Audio & Video Calls</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect face-to-face with high-quality audio and video calls.
              </p>
            </div>
            <div className="rounded-lg border p-6 shadow-sm">
              <h3 className="mb-3 text-xl font-semibold">Media Sharing</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Share photos, videos, and files seamlessly within your conversations.
              </p>
            </div>
            <div className="rounded-lg border p-6 shadow-sm">
              <h3 className="mb-3 text-xl font-semibold">Contact Management</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Easily add, organize, and manage your contacts in one place.
              </p>
            </div>
            <div className="rounded-lg border p-6 shadow-sm">
              <h3 className="mb-3 text-xl font-semibold">Message Reactions</h3>
              <p className="text-gray-600 dark:text-gray-300">
                React to messages with emojis to express yourself quickly.
              </p>
            </div>
            <div className="rounded-lg border p-6 shadow-sm">
              <h3 className="mb-3 text-xl font-semibold">Dark Mode</h3>
              <p className="text-gray-600 dark:text-gray-300">Customize your experience with light and dark themes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 px-4 py-16 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to get started?</h2>
          <p className="mb-8 text-xl">Join thousands of users already connecting on VartaSetu.</p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 px-4 py-8 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-white">
                  <Image
                    src="/vartasetu-logo-icon.jpeg"
                    alt="VartaSetu Logo"
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-bold text-gray-700">VartaSetu</span>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                Connecting people through seamless communication.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-gray-600 hover:underline dark:text-gray-300">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:underline dark:text-gray-300">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:underline dark:text-gray-300">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy-policy" className="text-gray-600 hover:underline dark:text-gray-300">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-600 hover:underline dark:text-gray-300">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:underline dark:text-gray-300">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-600 hover:underline dark:text-gray-300">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:underline dark:text-gray-300">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:underline dark:text-gray-300">
                    Facebook
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
            <p>&copy; {new Date().getFullYear()} VartaSetu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
