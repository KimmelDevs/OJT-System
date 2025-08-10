'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '../_components/Card';
import { UserRound, SearchIcon } from 'lucide-react';

export default function StudentAttendance() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        fetchStudents();
      } else {
        router.push('/sign-in');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'user'));
      const querySnapshot = await getDocs(q);

      const studentsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        studentsData.push({
          id: doc.id,
          name: data.displayName || 'No Name',
          email: data.email,
          studentId: data.studentId || 'N/A',
          program: data.program || 'N/A'
        });
      });

      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#22201a' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3ae973] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4" style={{ color: '#fefffe' }}>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#22201a' }}>
      <Card 
        title="Student Attendance" 
        titleStyle={{ color: '#fefffe' }}
        style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973' }}
        action={
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2" size={16} style={{ color: '#fefffe' }} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded text-sm"
              style={{ 
                backgroundColor: '#2d2b26',
                color: '#fefffe',
                borderColor: '#3ae973',
                width: '250px'
              }}
            />
          </div>
        }
      >
        <div className="overflow-x-auto -mx-6 -mb-6">
          <table className="min-w-full">
            <thead>
              <tr style={{ backgroundColor: '#2d2b26' }}>
                <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#fefffe' }}>
                  Student
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#fefffe' }}>
                  Student ID
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#fefffe' }}>
                  Program
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#fefffe' }}>
                  Email
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#fefffe' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#3ae973' }}>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, i) => (
                  <tr 
                    key={student.id} 
                    style={{ 
                      backgroundColor: i % 2 === 0 ? '#2d2b26' : '#22201a' 
                    }}
                  >
                    <td className="py-4 px-6 text-sm" style={{ color: '#fefffe' }}>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[#3ae973] flex items-center justify-center text-[#010100] mr-3">
                          <UserRound size={16} />
                        </div>
                        {student.name}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm" style={{ color: '#fefffe' }}>
                      {student.studentId}
                    </td>
                    <td className="py-4 px-6 text-sm" style={{ color: '#fefffe' }}>
                      {student.program}
                    </td>
                    <td className="py-4 px-6 text-sm" style={{ color: '#fefffe' }}>
                      {student.email}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <Link 
                        href={{
                          pathname: '/admindashboard/studentattendance/dailylogs',
                          query: { id: student.id }
                        }}
                        className="text-[#3ae973] hover:underline"
                      >
                        View Logs
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center" style={{ color: '#fefffe' }}>
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}