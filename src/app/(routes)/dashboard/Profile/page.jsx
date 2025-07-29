'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Card from '../_components/Card';
import { DownloadIcon, UploadIcon, PhoneIcon, MailIcon, MapPinIcon } from 'lucide-react';

export default function StudentInfoPage() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setLoading(true);
          // Corrected the collection name to 'users' (plural) and added proper error handling
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Ensure we have all required fields with fallbacks
            setStudentData({
              photoURL: data.photoURL || '/default-avatar.png',
              displayName: data.displayName || 'Not provided',
              course: data.course || 'Not provided',
              yearLevel: data.yearLevel || 'Not provided',
              phoneNumber: data.phoneNumber || 'Not provided',
              email: data.email || user.email || 'Not provided',
              address: data.address || 'Not provided',
              resumeUrl: data.resumeUrl || null,
              resumeLastUpdated: data.resumeLastUpdated || 'Never',
              emergencyContactName: data.emergencyContactName || 'Not provided',
              emergencyContactRelation: data.emergencyContactRelation || 'Not provided',
              emergencyContactPhone: data.emergencyContactPhone || 'Not provided',
              // Add any additional fields you need here
            });
          } else {
            console.log('No student data found');
            // Set default data if document doesn't exist
            setStudentData({
              photoURL: '/default-avatar.png',
              displayName: 'Not provided',
              course: 'Not provided',
              yearLevel: 'Not provided',
              phoneNumber: 'Not provided',
              email: user.email || 'Not provided',
              address: 'Not provided',
              resumeUrl: null,
              resumeLastUpdated: 'Never',
              emergencyContactName: 'Not provided',
              emergencyContactRelation: 'Not provided',
              emergencyContactPhone: 'Not provided'
            });
          }
        } catch (error) {
          console.error('Error fetching student data:', error);
          router.push('/error');
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/sign-in');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center" style={{ backgroundColor: '#22201a' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3ae973] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4" style={{ color: '#fefffe' }}>Loading student information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#22201a' }}>
      <Card 
        title="My Information"
        titleStyle={{ color: '#fefffe' }}
        style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973' }}
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full mb-4 overflow-hidden border-2" style={{ borderColor: '#3ae973' }}>
            <img 
              src={studentData?.photoURL} 
              alt="Student" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
          </div>
          <h3 className="font-medium text-lg" style={{ color: '#fefffe' }}>
            {studentData?.displayName}
          </h3>
          <p style={{ color: '#fefffe' }}>
            {studentData?.course}, {studentData?.yearLevel}
          </p>
        </div>

        <div className="space-y-4 text-sm mb-6">
          <div className="flex items-start">
            <PhoneIcon size={16} className="mr-2 mt-0.5" style={{ color: '#3ae973' }} />
            <div>
              <div style={{ color: '#fefffe' }}>Phone</div>
              <div style={{ color: '#fefffe' }}>{studentData?.phoneNumber}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <MailIcon size={16} className="mr-2 mt-0.5" style={{ color: '#3ae973' }} />
            <div>
              <div style={{ color: '#fefffe' }}>Email</div>
              <div style={{ color: '#fefffe' }}>{studentData?.email}</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <MapPinIcon size={16} className="mr-2 mt-0.5" style={{ color: '#3ae973' }} />
            <div>
              <div style={{ color: '#fefffe' }}>Address</div>
              <div style={{ color: '#fefffe' }}>{studentData?.address}</div>
            </div>
          </div>
        </div>

        <div className="py-4 border-t" style={{ borderColor: '#3ae973' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium" style={{ color: '#fefffe' }}>Resume/CV</span>
            <div className="flex space-x-2">
              <button 
                className="text-xs flex items-center"
                style={{ color: '#3ae973' }}
                disabled={!studentData?.resumeUrl}
              >
                <DownloadIcon size={12} className="mr-1" />
                Download
              </button>
              <button 
                className="text-xs flex items-center"
                style={{ color: '#3ae973' }}
              >
                <UploadIcon size={12} className="mr-1" />
                Update
              </button>
            </div>
          </div>
          <div className="text-xs" style={{ color: '#fefffe' }}>
            Last updated: {studentData?.resumeLastUpdated}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-medium mb-2" style={{ color: '#fefffe' }}>Emergency Contact</div>
          <div className="text-sm" style={{ color: '#fefffe' }}>
            <div>{studentData?.emergencyContactName} ({studentData?.emergencyContactRelation})</div>
            <div>{studentData?.emergencyContactPhone}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}