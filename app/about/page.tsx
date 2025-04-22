import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
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
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  This website is developed by Ashutosh Saxena - Information Science student.
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Made in India 🇮🇳
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Our Story</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  VartaSetu was founded on 12th April 2025 with a simple goal: to make communication easier and more enjoyable. 
                  I believe that staying connected should be effortless, regardless of where you are in the world.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  As the sole developer and designer, I have worked tirelessly to create a messaging experience that's both powerful and intuitive.
                  VartaSetu was developed as a major project by me, Ashutosh Saxena, during the 3rd year of my Information Science Engineering degree. 
                  I am constantly innovating and improving this platform based on user feedback and emerging technologies.
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Our Values</h2>
                <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-500 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <strong>Privacy First:</strong> I believe your conversations should remain private and secure.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-500 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <strong>Simplicity:</strong> Technology should make life easier, not more complicated.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-500 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <strong>Reliability:</strong> Communication tools should work flawlessly, every time.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-blue-500 p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <strong>Inclusivity:</strong> My platform is designed for everyone, regardless of technical ability.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 VartaSetu. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
