'use client';

import React, { useState, useEffect } from 'react';
import { ClockIcon, CheckIcon, AlertCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Card from './Card';

export default function DailyAttendance() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [status, setStatus] = useState('missing'); // 'present' | 'missing' | 'complete'
  const [checkoutNote, setCheckoutNote] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Current date
  const today = new Date();
  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);
  const dateId = today.toISOString().split('T')[0]; // YYYY-MM-DD format for document ID

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        loadAttendanceData(user.uid);
      } else {
        router.push('/sign-in');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadAttendanceData = async (userId) => {
    try {
      setLoading(true);
      const userAttendanceRef = doc(db, 'users', userId, 'attendance', dateId);
      const docSnap = await getDoc(userAttendanceRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.timeIn) {
          setTimeIn(data.timeIn.toDate().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }));
          setStatus(data.timeOut ? 'complete' : 'present');
        }
        if (data.timeOut) {
          setTimeOut(data.timeOut.toDate().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }));
        }
        if (data.checkoutNote) {
          setCheckoutNote(data.checkoutNote);
        }
      }
    } catch (error) {
      console.error("Error loading attendance data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeIn = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    setTimeIn(time);
    setStatus('present');
    saveAttendanceData({ timeIn: now });
  };

  const handleTimeOutClick = () => {
    setShowCheckoutModal(true);
  };

  const confirmTimeOut = async () => {
    if (!checkoutNote.trim()) return;
    
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    setTimeOut(time);
    setStatus('complete');
    setShowCheckoutModal(false);
    await saveAttendanceData({ 
      timeOut: now,
      checkoutNote: checkoutNote
    });
  };

  const saveAttendanceData = async (data) => {
    if (!currentUser) return;
    
    try {
      const userAttendanceRef = doc(db, 'users', currentUser.uid, 'attendance', dateId);
      await setDoc(userAttendanceRef, {
        ...data,
        date: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving attendance data: ", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center" style={{ backgroundColor: '#22201a' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3ae973] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4" style={{ color: '#fefffe' }}>Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card 
        title="Daily Attendance"
        titleStyle={{ color: '#fefffe' }}
        style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973' }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-medium" style={{ color: '#fefffe' }}>
              {formattedDate}
            </h2>
            <div className="mt-1 flex items-center">
              {status === 'missing' && (
                <span className="flex items-center" style={{ color: '#ff6b6b' }}>
                  <AlertCircleIcon size={16} className="mr-1" />
                  Missing Time In
                </span>
              )}
              {status === 'present' && (
                <span className="flex items-center" style={{ color: '#3ae973' }}>
                  <ClockIcon size={16} className="mr-1" />
                  Currently Working
                </span>
              )}
              {status === 'complete' && (
                <span className="flex items-center" style={{ color: '#3ae973' }}>
                  <CheckIcon size={16} className="mr-1" />
                  Completed
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" style={{ color: '#fefffe' }}>
                Time In
              </label>
              <div className="flex">
                <input 
                  type="text" 
                  value={timeIn} 
                  readOnly 
                  placeholder="--:--" 
                  style={{
                    backgroundColor: '#393632',
                    color: '#fefffe',
                    borderColor: '#3ae973'
                  }}
                  className="flex-1 px-3 py-2 rounded-l-lg focus:outline-none"
                />
                <button 
                  onClick={handleTimeIn} 
                  disabled={timeIn !== ''} 
                  style={{
                    backgroundColor: '#3ae973',
                    color: '#010100'
                  }}
                  className="px-3 py-2 rounded-r-lg disabled:opacity-50"
                >
                  Clock In
                </button>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" style={{ color: '#fefffe' }}>
                Time Out
              </label>
              <div className="flex">
                <input 
                  type="text" 
                  value={timeOut} 
                  readOnly 
                  placeholder="--:--" 
                  style={{
                    backgroundColor: '#393632',
                    color: '#fefffe',
                    borderColor: '#3ae973'
                  }}
                  className="flex-1 px-3 py-2 rounded-l-lg focus:outline-none"
                />
                <button 
                  onClick={handleTimeOutClick} 
                  disabled={timeIn === '' || timeOut !== ''} 
                  style={{
                    backgroundColor: '#3ae973',
                    color: '#010100'
                  }}
                  className="px-3 py-2 rounded-r-lg disabled:opacity-50"
                >
                  Clock Out
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-right">
          <button style={{ color: '#3ae973' }} className="text-sm hover:underline">
            Request Correction
          </button>
        </div>
      </Card>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            className="p-6 rounded-lg w-full max-w-md"
            style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973', borderWidth: '1px' }}
          >
            <h3 className="text-lg font-medium mb-4" style={{ color: '#fefffe' }}>
              Checkout Notes
            </h3>
            <p className="mb-4 text-sm" style={{ color: '#fefffe' }}>
              Please briefly describe what you worked on today:
            </p>
            <textarea
              value={checkoutNote}
              onChange={(e) => setCheckoutNote(e.target.value)}
              rows={4}
              required
              style={{
                backgroundColor: '#393632',
                color: '#fefffe',
                borderColor: '#3ae973'
              }}
              className="w-full px-3 py-2 rounded-lg mb-4 focus:outline-none"
              placeholder="Today I worked on..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCheckoutModal(false)}
                style={{
                  backgroundColor: '#393632',
                  color: '#fefffe'
                }}
                className="px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmTimeOut}
                disabled={!checkoutNote.trim()}
                style={{
                  backgroundColor: '#3ae973',
                  color: '#010100'
                }}
                className="px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Confirm Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}