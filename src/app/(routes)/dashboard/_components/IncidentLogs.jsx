'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Card from '../_components/Card';
import { AlertTriangleIcon, CheckCircleIcon, XCircleIcon, CalendarIcon } from 'lucide-react';

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        fetchIncidents(user.uid);
      } else {
        router.push('/sign-in');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchIncidents = async (userId) => {
    try {
      setLoading(true);
      // Query the user's incidents subcollection, ordered by createdAt, limited to 5
      const incidentsRef = collection(db, 'users', userId, 'incidents');
      let q = query(incidentsRef, orderBy('createdAt', 'desc'), limit(5));

      const querySnapshot = await getDocs(q);
      const incidentsData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        incidentsData.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          date: data.createdAt?.toDate() || new Date(),
          status: data.status || 'pending',
          type: data.type || 'general',
          resolution: data.resolution || ''
        });
      });

      setIncidents(incidentsData);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center" style={{ backgroundColor: '#22201a' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3ae973] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4" style={{ color: '#fefffe' }}>Loading incidents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#22201a' }}>
      <Card 
        title="Incidents"
        titleStyle={{ color: '#fefffe' }}
        style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973' }}
        action={
          <button 
            className="text-sm flex items-center"
            style={{ color: '#3ae973' }}
            onClick={() => router.push('/dashboard/Incident/create')}
          >
            + Report New Incident
          </button>
        }
      >
        {/* Incidents List */}
        <div className="space-y-4">
          {incidents.length > 0 ? (
            incidents.map((incident) => (
              <div 
                key={incident.id}
                className="p-4 rounded-lg"
                style={{ 
                  backgroundColor: '#2d2b26',
                  border: '1px solid #3ae973'
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-3">
                      {incident.status === 'pending' && (
                        <AlertTriangleIcon size={20} className="text-yellow-500" />
                      )}
                      {incident.status === 'resolved' && (
                        <CheckCircleIcon size={20} className="text-green-500" />
                      )}
                      {incident.status === 'rejected' && (
                        <XCircleIcon size={20} className="text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium" style={{ color: '#fefffe' }}>
                        {incident.title}
                      </h3>
                      <p className="text-sm mt-1" style={{ color: '#fefffe' }}>
                        {incident.description}
                      </p>
                      <div className="flex items-center mt-2 text-xs" style={{ color: '#fefffe' }}>
                        <CalendarIcon size={14} className="mr-1" />
                        {incident.date.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      {incident.resolution && (
                        <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#22201a' }}>
                          <p className="text-xs" style={{ color: '#fefffe' }}>
                            <span className="font-medium">Resolution:</span> {incident.resolution}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <span 
                    className="text-xs px-2 py-1 rounded-full capitalize"
                    style={{ 
                      backgroundColor: 
                        incident.status === 'pending' ? '#3ae97320' :
                        incident.status === 'resolved' ? '#10b98120' :
                        '#ef444420',
                      color: 
                        incident.status === 'pending' ? '#3ae973' :
                        incident.status === 'resolved' ? '#10b981' :
                        '#ef4444'
                    }}
                  >
                    {incident.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8" style={{ color: '#fefffe' }}>
              No incidents reported yet
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}