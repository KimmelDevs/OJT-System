'use client';

import React, { useState, useEffect } from 'react'; 
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import Card from '../../_components/Card';
import { AlertTriangleIcon, ArrowLeftIcon } from 'lucide-react';

export default function NewIncidentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'technical',
    urgency: 'medium'
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.push('/sign-in');
      }
    });

    return () => unsubscribe();
  }, [router]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length > 500) newErrors.description = 'Description too long (max 500 chars)';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Create a reference to the user's incidents subcollection
      const userIncidentsRef = collection(db, 'users', currentUser.uid, 'incidents');
      
      await addDoc(userIncidentsRef, {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // We don't need to store user info since it's already in the parent document
      });
      router.push('/dashboard/Incident');
    } catch (error) {
      console.error('Error submitting incident:', error);
      setErrors(prev => ({
        ...prev,
        form: 'Failed to submit incident. Please try again.'
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center" style={{ backgroundColor: '#22201a' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3ae973] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#22201a' }}>
      <Card 
        title="Report New Incident"
        titleStyle={{ color: '#fefffe' }}
        style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973' }}
        action={
          <button 
            onClick={() => router.push('/dashboard/Incident')}
            className="flex items-center text-sm"
            style={{ color: '#3ae973' }}
          >
            <ArrowLeftIcon size={16} className="mr-1" />
            Back to Incidents
          </button>
        }
      >
        {errors.form && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#ef444420', borderColor: '#ef4444' }}>
            <p className="text-sm" style={{ color: '#fefffe' }}>{errors.form}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Incident Title */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#fefffe' }}>
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-600'}`}
                style={{ 
                  backgroundColor: '#393632',
                  color: '#fefffe',
                  borderWidth: '1px'
                }}
                placeholder="Briefly describe the incident"
                maxLength={100}
              />
              {errors.title && (
                <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.title}</p>
              )}
            </div>

            {/* Incident Description */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#fefffe' }}>
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className={`w-full px-3 py-2 rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-600'}`}
                style={{ 
                  backgroundColor: '#393632',
                  color: '#fefffe',
                  borderWidth: '1px'
                }}
                placeholder="Provide detailed information about the incident..."
                maxLength={500}
              />
              <div className="flex justify-between mt-1">
                {errors.description ? (
                  <p className="text-xs" style={{ color: '#ef4444' }}>{errors.description}</p>
                ) : (
                  <div></div>
                )}
                <p className="text-xs" style={{ color: '#fefffe' }}>
                  {formData.description.length}/500 characters
                </p>
              </div>
            </div>

            {/* Incident Type */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#fefffe' }}>
                Incident Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['technical', 'attendance', 'equipment', 'other'].map((type) => (
                  <label 
                    key={type}
                    className={`flex items-center p-3 rounded-lg cursor-pointer ${formData.type === type ? 'border-2' : 'border'}`}
                    style={{ 
                      backgroundColor: '#2d2b26',
                      borderColor: formData.type === type ? '#3ae973' : '#393632'
                    }}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div 
                      className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${formData.type === type ? 'bg-[#3ae973]' : 'border border-gray-500'}`}
                    >
                      {formData.type === type && (
                        <div className="w-2 h-2 rounded-full bg-[#010100]"></div>
                      )}
                    </div>
                    <span className="capitalize" style={{ color: '#fefffe' }}>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#fefffe' }}>
                Urgency Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'low', label: 'Low', color: '#10b981' },
                  { value: 'medium', label: 'Medium', color: '#f59e0b' },
                  { value: 'high', label: 'High', color: '#ef4444' }
                ].map((level) => (
                  <label 
                    key={level.value}
                    className={`flex items-center justify-center p-2 rounded-lg cursor-pointer ${formData.urgency === level.value ? 'border-2' : 'border'}`}
                    style={{ 
                      backgroundColor: '#2d2b26',
                      borderColor: formData.urgency === level.value ? level.color : '#393632'
                    }}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={level.value}
                      checked={formData.urgency === level.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: level.color }}
                      ></div>
                      <span style={{ color: '#fefffe' }}>{level.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 rounded-lg font-medium flex items-center justify-center"
                style={{ 
                  backgroundColor: '#3ae973',
                  color: '#010100',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#010100]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <AlertTriangleIcon size={16} className="mr-2" />
                    Submit Incident Report
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}