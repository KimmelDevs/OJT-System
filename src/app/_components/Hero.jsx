'use client'

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

function Hero() {
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(!!user)
    })
    return () => unsubscribe()
  }, [])

  return (
    <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center">
      {/* Background image with overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/ojt-background.jpg"
          alt="OJT Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#2c3e50]/80 backdrop-blur-sm"></div>
      </div>

      <div className="container px-4 md:px-6 text-center">
        <div className="flex flex-col items-center space-y-8">
          {/* Title + description */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-white">
              OJT Progress Tracker
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
              Streamline your On-the-Job Training experience with our journal system. 
              Students can submit weekly reports and advisors can monitor progress in real-time.
            </p>
          </div>

          {/* Login / Sign Up / Dashboard Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!isSignedIn ? (
              <>
                <Link href="/sign-in">
                  <Button className="px-8 h-12 text-lg bg-[#2ecc71] hover:bg-[#27ae60] text-white">
                    Login
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="px-8 h-12 text-lg bg-[#3498db] hover:bg-[#2980b9] text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/dashboard">
                <Button className="px-8 h-12 text-lg bg-[#2ecc71] hover:bg-[#27ae60] text-white">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 text-white">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold">Weekly Reports</h3>
              <p className="text-sm">Track your progress weekly</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold">Advisor Feedback</h3>
              <p className="text-sm">Get timely responses</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold">Progress Analytics</h3>
              <p className="text-sm">Visualize your growth</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom-right DCODE logo */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <Link href="https://dcode-khaki.vercel.app/" target="_blank">
          <Image
            src="/a.png" // DCODE logo image
            alt="Created by DCODE"
            width={140}
            height={70}
            className="hover:opacity-80 transition-opacity cursor-pointer"
            priority
          />
        </Link>
      </div>
    </section>
  )
}

export default Hero
