'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { DownloadIcon, AlertCircleIcon, BookOpenIcon, ClockIcon, ArrowLeftIcon } from 'lucide-react';

import Card from '../../_components/Card';
import Link from 'next/link';

export default function DailyLogs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState('attendance');
  const [timeFilter, setTimeFilter] = useState('week');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        fetchStudentInfo();
        fetchRecords();
      } else {
        router.push('/sign-in');
      }
    });

    return () => unsubscribe();
  }, [router, studentId]);

  const fetchStudentInfo = async () => {
    try {
      const docRef = doc(db, 'users', studentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStudentInfo({
          name: data.displayName || 'No Name',
          email: data.email,
          studentId: data.studentId || 'N/A',
          program: data.program || 'N/A'
        });
      } else {
        console.log('No such student!');
        router.push('/admindashboard/studentattendance');
      }
    } catch (error) {
      console.error('Error fetching student info:', error);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      
      // Always fetch both attendance and journal data
      const [attendanceData, journalData] = await Promise.all([
        fetchAttendanceRecords(),
        fetchJournalEntries()
      ]);

      setAttendanceRecords(attendanceData);
      setJournalEntries(journalData);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    const attendanceRef = collection(db, 'users', studentId, 'attendance');
    let q = query(
      attendanceRef,
      orderBy('date', 'desc')
    );

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      let startDate = new Date();

      if (timeFilter === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeFilter === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }

      q = query(
        q,
        where('date', '>=', startDate)
      );
    }

    const querySnapshot = await getDocs(q);
    const recordsData = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      recordsData.push({
        id: doc.id,
        date: data.date?.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) || '--/--/----',
        timeIn: data.timeIn?.toDate().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }) || '--:--',
        timeOut: data.timeOut?.toDate().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }) || '--:--',
        totalHours: calculateTotalHours(data.timeIn?.toDate(), data.timeOut?.toDate()),
        status: data.timeOut ? 'complete' : 'pending',
        checkoutNote: data.checkoutNote || ''
      });
    });

    return recordsData;
  };

  const fetchJournalEntries = async () => {
    // First get all attendance records that might have journal entries
    const attendanceRef = collection(db, 'users', studentId, 'attendance');
    const attendanceSnapshot = await getDocs(attendanceRef);
    
    const allEntries = [];
    
    // For each attendance record, check if it has journal entries
    for (const doc of attendanceSnapshot.docs) {
      const journalRef = collection(db, 'users', studentId, 'attendance', doc.id, 'journal');
      const journalSnapshot = await getDocs(journalRef);
      
      journalSnapshot.forEach((journalDoc) => {
        const data = journalDoc.data();
        allEntries.push({
          id: journalDoc.id,
          date: data.createdAt?.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) || '--/--/----',
          title: data.title || 'No title',
          content: data.content,
          createdAt: data.createdAt?.toDate()
        });
      });
    }
    
    // Sort all entries by date (newest first)
    allEntries.sort((a, b) => b.createdAt - a.createdAt);
    
    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      let startDate = new Date();

      if (timeFilter === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeFilter === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }

      return allEntries.filter(entry => entry.createdAt >= startDate);
    }
    
    return allEntries;
  };

  const calculateTotalHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return '--';
    const diffMs = timeOut - timeIn;
    const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
    const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
    return `${diffHrs}h ${diffMins}m`;
  };

  useEffect(() => {
    if (currentUser && studentId) {
      fetchRecords();
    }
  }, [timeFilter, activeTab, currentUser, studentId]);

  if (loading || !studentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#22201a' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3ae973] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4" style={{ color: '#fefffe' }}>Loading student records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#22201a' }}>
      <Card 
        title={
          <div className="flex items-center">
            <Link href="/teacher/studentattendance" className="mr-4">
              <ArrowLeftIcon size={20} style={{ color: '#3ae973' }} />
            </Link>
            <div>
              <h2 style={{ color: '#fefffe' }}>{studentInfo.name}'s {activeTab === 'attendance' ? 'Attendance Logs' : 'Daily Journals'}</h2>
              <p className="text-xs" style={{ color: '#fefffe' }}>
                {studentInfo.studentId} | {studentInfo.program} | {studentInfo.email}
              </p>
            </div>
          </div>
        }
        titleStyle={{ color: '#fefffe' }}
        style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973' }}
        action={
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 rounded text-sm ${activeTab === 'attendance' ? 'bg-[#3ae973] text-[#010100]' : 'bg-[#2d2b26] text-[#fefffe]'}`}
                onClick={() => setActiveTab('attendance')}
              >
                <ClockIcon size={14} className="inline mr-1" />
                Attendance
              </button>
              <button
                className={`px-3 py-1 rounded text-sm ${activeTab === 'journal' ? 'bg-[#3ae973] text-[#010100]' : 'bg-[#2d2b26] text-[#fefffe]'}`}
                onClick={() => setActiveTab('journal')}
              >
                <BookOpenIcon size={14} className="inline mr-1" />
                Journal
              </button>
            </div>
            <div className="flex items-center">
              <label htmlFor="filter" className="mr-2 text-sm" style={{ color: '#fefffe' }}>
                Filter:
              </label>
              <select 
                id="filter" 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value)} 
                className="text-sm rounded py-1 px-2"
                style={{ 
                  backgroundColor: '#2d2b26',
                  color: '#fefffe',
                  borderColor: '#3ae973'
                }}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <button 
              className="flex items-center text-sm"
              style={{ color: '#3ae973' }}
            >
              <DownloadIcon size={16} className="mr-1" />
              Export
            </button>
          </div>
        }
      >
        {activeTab === 'attendance' ? (
          <div className="overflow-x-auto -mx-6 -mb-6">
            <table className="min-w-full">
              <thead>
                <tr style={{ backgroundColor: '#2d2b26' }}>
                  <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#fefffe' }}>
                    Date
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#fefffe' }}>
                    Time In
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#fefffe' }}>
                    Time Out
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#fefffe' }}>
                    Total Hours
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#fefffe' }}>
                    Status
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#fefffe' }}>
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#3ae973' }}>
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((record, i) => (
                    <tr 
                      key={record.id} 
                      style={{ 
                        backgroundColor: i % 2 === 0 ? '#2d2b26' : '#22201a' 
                      }}
                    >
                      <td className="py-4 px-6 text-sm" style={{ color: '#fefffe' }}>
                        {record.date}
                      </td>
                      <td className="py-4 px-6 text-sm" style={{ color: '#fefffe' }}>
                        {record.timeIn}
                      </td>
                      <td className="py-4 px-6 text-sm" style={{ color: '#fefffe' }}>
                        {record.timeOut}
                      </td>
                      <td className="py-4 px-6 text-sm" style={{ color: '#fefffe' }}>
                        {record.totalHours}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {record.status === 'pending' && (
                          <span className="flex items-center" style={{ color: '#ff6b6b' }}>
                            <AlertCircleIcon size={14} className="mr-1" />
                            Missing Time Out
                          </span>
                        )}
                        {record.status === 'complete' && (
                          <span style={{ color: '#3ae973' }}>Complete</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm" style={{ color: '#fefffe' }}>
                        {record.checkoutNote || '--'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center" style={{ color: '#fefffe' }}>
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4">
            {journalEntries.length > 0 ? (
              journalEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="p-4 rounded-lg"
                  style={{ 
                    backgroundColor: '#2d2b26',
                    border: '1px solid #3ae973'
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium" style={{ color: '#fefffe' }}>
                      {entry.title}
                    </h3>
                    <span className="text-xs" style={{ color: '#fefffe' }}>
                      {entry.date}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: '#fefffe' }}>
                    {entry.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8" style={{ color: '#fefffe' }}>
                No journal entries found
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}