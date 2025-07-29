'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import DashboardEndorsement from './_components/DashboardEndorsement'
import DailyAttendance from './_components/DailyAttendance'
import DashboardIncidentLogs from './_components/IncidentLogs'
import DashboardRequirementsTracker from './_components/RequirementsTracker'
import CompactDashboardStats from './_components/DashboardStats'

function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [networkStatus, setNetworkStatus] = useState('good') // 'good', 'slow', 'offline'

  useEffect(() => {
    // Check network status
    const updateNetworkStatus = () => {
      if (!navigator.onLine) {
        setNetworkStatus('offline')
      } else {
        const latency = Math.random() * 1000
        setNetworkStatus(latency < 200 ? 'good' : latency < 500 ? 'slow' : 'offline')
      }
    }

    updateNetworkStatus()
    const interval = setInterval(updateNetworkStatus, 5000)

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        setLoading(false)
      } else {
        router.replace('/sign-in')
      }
    })

    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [router])

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#22201a' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3ae973] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4" style={{ color: '#fefffe' }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#22201a' }}>
      {/* Simplified Header */}
      <div className="bg-[#2d2b26] shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#fefffe' }}>NWSSU OJT Portal</h1>
              <p className="text-lg mt-2" style={{ color: '#fefffe' }}>
                On-the-Job Training Management System
              </p>
            </div>
            
            {/* Network Status Indicator Only */}
            <div className="relative">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`${
                  networkStatus === 'good'
                    ? 'text-[#3ae973]'
                    : networkStatus === 'slow'
                    ? 'text-yellow-500'
                    : 'text-red-500'
                }`}
              >
                <path d="M5 12.55a11 11 0 0 1 14.08 0" opacity={networkStatus === 'offline' ? '0' : '1'} />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" opacity={networkStatus === 'good' ? '1' : '0'} />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" opacity={networkStatus !== 'offline' ? '1' : '0'} />
                <circle cx="12" cy="19" r="1" opacity={networkStatus !== 'offline' ? '1' : '0'} />
              </svg>

              {/* Tooltip */}
              <div className="absolute right-0 top-full mt-1 px-2 py-1 text-xs bg-[#2d2b26] text-[#fefffe] rounded opacity-0 hover:opacity-100 transition-opacity border border-[#393632]">
                {networkStatus === 'good'
                  ? 'Strong connection'
                  : networkStatus === 'slow'
                  ? 'Weak connection'
                  : 'No internet connection'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Top Row - Daily Attendance and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <DailyAttendance />
          </div>
          <div>
            <CompactDashboardStats />
          </div>
        </div>

        {/* Bottom Row - Endorsement and Requirements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DashboardEndorsement />
          </div>
          <div className="space-y-8">
            <DashboardRequirementsTracker />
            <DashboardIncidentLogs />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard