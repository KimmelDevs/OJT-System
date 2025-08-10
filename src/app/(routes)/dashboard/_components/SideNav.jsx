'use client'

import React, { useEffect, useState } from "react"
import Image from "next/image"
import {
  LayoutDashboard,
  UserRound,
  Briefcase,
  Clock,
  AlertTriangle,
  FileText,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"

function SideNav() {
  const [user, setUser] = useState(null)
  const path = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const menuList = [
    
    {
      id: 1,
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: 2,
      name: "OJT Company",
      icon: Briefcase,
      path: "/dashboard/Endorsement",
    },
    {
      id: 3,
      name: "Attendance",
      icon: Clock,
      path: "/dashboard/Attendance",
    },
    {
      id: 4,
      name: "Attendance Logs",
      icon: Clock,
      path: "/dashboard/AttendanceLogs",
    },
    {
      id: 5,
      name: "Incidents",
      icon: AlertTriangle,
      path: "/dashboard/Incident",
    },
    {
      id: 6,
      name: "Requirements",
      icon: FileText,
      path: "/dashboard/requirements",
    },
    {
      id: 7,
      name: "My Profile",
      icon: UserRound,
      path: "/dashboard/Profile",
    },
  ]

  return (
    <div className="h-screen p-5 bg-[#22201a] shadow-lg border-r flex flex-col">
      {/* Logo and App Name */}
      <div className="flex flex-row items-center mb-8">
        <h1 className="text-xl font-bold text-[#fefffe] ml-2">
          OJT Portal
        </h1>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1">
        {menuList.map((menu) => (
          <Link href={menu.path} key={menu.id}>
            <div
              className={`flex gap-3 items-center text-[#fefffe] font-medium mb-2 p-3 rounded-lg transition-colors
                hover:bg-[#2d2b26] hover:text-[#3ae973]
                ${path === menu.path ? "bg-[#2d2b26] text-[#3ae973]" : ""}`}
            >
              <menu.icon 
                size={20} 
                className={`${path === menu.path ? "text-[#3ae973]" : "text-[#fefffe]"}`} 
              />
              <span>{menu.name}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* User Info and Sign Out */}
      {user && (
        <div className="mt-auto">
          <div className="flex items-center justify-between p-3 bg-[#2d2b26] rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#3ae973] flex items-center justify-center text-[#010100]">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-[#fefffe] truncate max-w-[120px]">
                {user.email}
              </span>
            </div>
            <button 
              onClick={handleSignOut}
              className="text-[#fefffe] hover:text-[#3ae973] transition-colors p-1"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SideNav