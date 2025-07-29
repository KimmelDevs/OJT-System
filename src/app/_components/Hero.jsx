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
      {/* Full background image with overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/ojt-background.jpg"  // Consider using an image of students in workplace or meeting with advisor
          alt="OJT Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#2c3e50]/80 backdrop-blur-sm"></div>
      </div>

      <div className="container px-4 md:px-6 text-center">
        <div className="flex flex-col items-center space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-white">
              OJT Progress Tracker
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
              Streamline your On-the-Job Training experience with our journal system. Students can submit weekly reports and advisors can monitor progress in real-time.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 min-[400px]:flex-row">
            {!isSignedIn ? (
              <>
                <Link href="/sign-in?role=student">
                  <Button className="px-8 h-12 text-lg bg-[#2ecc71] hover:bg-[#27ae60] text-white">
                    I'm a Student
                  </Button>
                </Link>
                <Link href="/sign-in?role=advisor">
                  <Button 
                    variant="outline" 
                    className="px-8 h-12 text-lg border-white bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    I'm an Advisor
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

          {/* Additional features preview */}
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
    </section>
  )
}

export default Hero