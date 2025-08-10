'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Card from '../_components/Card';
import { DownloadIcon, UploadIcon, PhoneIcon, MailIcon, MapPinIcon, EditIcon, SaveIcon, XIcon } from 'lucide-react';

export default function StudentInfoPage() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchStudentData(user);
      } else {
        router.push('/sign-in');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchStudentData = async (user) => {
    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
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
        });
        setEditData({
          displayName: data.displayName || '',
          course: data.course || '',
          yearLevel: data.yearLevel || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
          emergencyContactName: data.emergencyContactName || '',
          emergencyContactRelation: data.emergencyContactRelation || '',
          emergencyContactPhone: data.emergencyContactPhone || '',
        });
      } else {
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
  };

  const handleEdit = () => {
    setEditing(true);
    setShowHint(true);
    // Hide hint after 5 seconds
    setTimeout(() => setShowHint(false), 5000);
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset edit data to current student data
    setEditData({
      displayName: studentData.displayName || '',
      course: studentData.course || '',
      yearLevel: studentData.yearLevel || '',
      phoneNumber: studentData.phoneNumber || '',
      address: studentData.address || '',
      emergencyContactName: studentData.emergencyContactName || '',
      emergencyContactRelation: studentData.emergencyContactRelation || '',
      emergencyContactPhone: studentData.emergencyContactPhone || '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        router.push('/sign-in');
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...editData,
        updatedAt: new Date()
      });

      // Refresh the data
      await fetchStudentData(user);
      setEditing(false);
    } catch (error) {
      console.error('Error updating student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      // Here you would implement your file upload logic to Firebase Storage
      // For example:
      // const storageRef = ref(storage, `resumes/${auth.currentUser.uid}/${file.name}`);
      // const uploadTask = uploadBytesResumable(storageRef, file);
      // await uploadTask;
      // const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      
      // For now, we'll simulate a successful upload
      const downloadURL = 'https://example.com/resume.pdf'; // Replace with actual URL
      const updatedAt = new Date().toLocaleDateString();

      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        resumeUrl: downloadURL,
        resumeLastUpdated: updatedAt
      });

      // Refresh the data
      await fetchStudentData(auth.currentUser);
    } catch (error) {
      console.error('Error uploading resume:', error);
    } finally {
      setUploading(false);
    }
  };

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
        {showHint && (
          <div className="mb-4 p-3 rounded bg-[#393632] border border-[#3ae973] text-sm" style={{ color: '#fefffe' }}>
            <p>You're in edit mode. Update your information and click "Save" when done.</p>
            <p className="mt-1 text-xs opacity-80">Tip: Make sure all fields are accurate before saving.</p>
          </div>
        )}

        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col items-center mb-6 w-full">
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
            {editing ? (
              <>
                <input
                  type="text"
                  name="displayName"
                  value={editData.displayName}
                  onChange={handleChange}
                  className="mb-2 p-2 rounded bg-[#393632] text-[#fefffe] border border-[#3ae973] w-full max-w-xs"
                  placeholder="Your full name"
                />
                <div className="text-xs mb-1 w-full max-w-xs text-left" style={{ color: '#fefffe', opacity: 0.7 }}>
                  This will be displayed as your profile name
                </div>
              </>
            ) : (
              <h3 className="font-medium text-lg" style={{ color: '#fefffe' }}>
                {studentData?.displayName}
              </h3>
            )}
            {editing ? (
              <div className="flex space-x-2 w-full max-w-xs">
                <div className="flex-1">
                  <input
                    type="text"
                    name="course"
                    value={editData.course}
                    onChange={handleChange}
                    className="mb-1 p-2 rounded bg-[#393632] text-[#fefffe] border border-[#3ae973] w-full"
                    placeholder="e.g. Computer Science"
                  />
                  <div className="text-xs text-left" style={{ color: '#fefffe', opacity: 0.7 }}>
                    Your degree program
                  </div>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    name="yearLevel"
                    value={editData.yearLevel}
                    onChange={handleChange}
                    className="mb-1 p-2 rounded bg-[#393632] text-[#fefffe] border border-[#3ae973] w-full"
                    placeholder="e.g. 3rd Year"
                  />
                  <div className="text-xs text-left" style={{ color: '#fefffe', opacity: 0.7 }}>
                    Current year
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#fefffe' }}>
                {studentData?.course}, {studentData?.yearLevel}
              </p>
            )}
          </div>
          {!editing ? (
            <button 
              onClick={handleEdit}
              className="flex items-center text-sm hover:underline"
              style={{ color: '#3ae973' }}
            >
              <EditIcon size={16} className="mr-1" />
              Edit
            </button>
          ) : (
            <div className="flex space-x-2">
              <button 
                onClick={handleSave}
                className="flex items-center text-sm hover:underline"
                style={{ color: '#3ae973' }}
                disabled={loading}
              >
                <SaveIcon size={16} className="mr-1" />
                Save
              </button>
              <button 
                onClick={handleCancel}
                className="flex items-center text-sm hover:underline"
                style={{ color: '#ff6b6b' }}
              >
                <XIcon size={16} className="mr-1" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4 text-sm mb-6">
          <div className="flex items-start">
            <PhoneIcon size={16} className="mr-2 mt-0.5" style={{ color: '#3ae973' }} />
            <div className="w-full">
              <div style={{ color: '#fefffe' }}>Phone</div>
              {editing ? (
                <>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={editData.phoneNumber}
                    onChange={handleChange}
                    className="p-2 rounded bg-[#393632] text-[#fefffe] border border-[#3ae973] w-full"
                    placeholder="e.g. +1 (123) 456-7890"
                  />
                  <div className="text-xs mt-1" style={{ color: '#fefffe', opacity: 0.7 }}>
                    Include country code if applicable
                  </div>
                </>
              ) : (
                <div style={{ color: '#fefffe' }}>{studentData?.phoneNumber}</div>
              )}
            </div>
          </div>
          
          <div className="flex items-start">
            <MailIcon size={16} className="mr-2 mt-0.5" style={{ color: '#3ae973' }} />
            <div>
              <div style={{ color: '#fefffe' }}>Email</div>
              <div style={{ color: '#fefffe' }}>{studentData?.email}</div>
              {editing && (
                <div className="text-xs mt-1" style={{ color: '#fefffe', opacity: 0.7 }}>
                  Contact admin to change your email
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-start">
            <MapPinIcon size={16} className="mr-2 mt-0.5" style={{ color: '#3ae973' }} />
            <div className="w-full">
              <div style={{ color: '#fefffe' }}>Address</div>
              {editing ? (
                <>
                  <textarea
                    name="address"
                    value={editData.address}
                    onChange={handleChange}
                    className="p-2 rounded bg-[#393632] text-[#fefffe] border border-[#3ae973] w-full"
                    rows={3}
                    placeholder="Full mailing address including city and postal code"
                  />
                  <div className="text-xs mt-1" style={{ color: '#fefffe', opacity: 0.7 }}>
                    Used for official communications
                  </div>
                </>
              ) : (
                <div style={{ color: '#fefffe' }}>{studentData?.address}</div>
              )}
            </div>
          </div>
        </div>

        <div className="py-4 border-t" style={{ borderColor: '#3ae973' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium" style={{ color: '#fefffe' }}>Resume/CV</span>
            <div className="flex space-x-2">
              <button 
                className={`text-xs flex items-center hover:underline ${!studentData?.resumeUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ color: '#3ae973' }}
                disabled={!studentData?.resumeUrl}
                onClick={() => studentData?.resumeUrl && window.open(studentData.resumeUrl, '_blank')}
              >
                <DownloadIcon size={12} className="mr-1" />
                Download
              </button>
              <label className={`text-xs flex items-center hover:underline cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ color: '#3ae973' }}>
                <UploadIcon size={12} className="mr-1" />
                Update
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
          <div className="text-xs" style={{ color: '#fefffe' }}>
            Last updated: {studentData?.resumeLastUpdated}
            {uploading && <span className="ml-2">Uploading...</span>}
          </div>
          {editing && (
            <div className="text-xs mt-2" style={{ color: '#fefffe', opacity: 0.7 }}>
              Upload your most recent resume (PDF or Word document)
            </div>
          )}
        </div>

        <div className="mt-6">
          <div className="text-sm font-medium mb-2" style={{ color: '#fefffe' }}>Emergency Contact</div>
          {editing ? (
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={editData.emergencyContactName}
                  onChange={handleChange}
                  className="p-2 rounded bg-[#393632] text-[#fefffe] border border-[#3ae973] w-full"
                  placeholder="Full name"
                />
                <div className="text-xs mt-1" style={{ color: '#fefffe', opacity: 0.7 }}>
                  Person to contact in case of emergency
                </div>
              </div>
              <div>
                <input
                  type="text"
                  name="emergencyContactRelation"
                  value={editData.emergencyContactRelation}
                  onChange={handleChange}
                  className="p-2 rounded bg-[#393632] text-[#fefffe] border border-[#3ae973] w-full"
                  placeholder="Relationship (e.g. Parent, Guardian)"
                />
                <div className="text-xs mt-1" style={{ color: '#fefffe', opacity: 0.7 }}>
                  How this person is related to you
                </div>
              </div>
              <div>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={editData.emergencyContactPhone}
                  onChange={handleChange}
                  className="p-2 rounded bg-[#393632] text-[#fefffe] border border-[#3ae973] w-full"
                  placeholder="Phone number with country code"
                />
                <div className="text-xs mt-1" style={{ color: '#fefffe', opacity: 0.7 }}>
                  Must be reachable at all times
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm" style={{ color: '#fefffe' }}>
              <div>{studentData?.emergencyContactName} ({studentData?.emergencyContactRelation})</div>
              <div>{studentData?.emergencyContactPhone}</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}