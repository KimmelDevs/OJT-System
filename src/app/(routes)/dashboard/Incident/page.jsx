'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Card from '../_components/Card';
import { SearchIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon, CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

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
      // Changed to query the user's incidents subcollection
      const incidentsRef = collection(db, 'users', userId, 'incidents');
      let q = query(incidentsRef, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      const incidentsData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        incidentsData.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          date: data.createdAt?.toDate() || new Date(), // Using createdAt instead of date
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

  const filteredIncidents = incidents.filter(incident => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    
    // Date range filter
    let matchesDate = true;
    if (startDate && endDate) {
      const incidentDate = new Date(incident.date);
      matchesDate = incidentDate >= startDate && incidentDate <= endDate;
    } else if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const incidentDate = new Date(incident.date);
      matchesDate = incidentDate >= today;
    } else if (dateFilter === 'thisWeek') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const incidentDate = new Date(incident.date);
      matchesDate = incidentDate >= oneWeekAgo;
    } else if (dateFilter === 'thisMonth') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const incidentDate = new Date(incident.date);
      matchesDate = incidentDate >= oneMonthAgo;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    setDateFilter(null);
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
        title="Incident Reports"
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
        {/* Search and Filter Section */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5" style={{ color: '#fefffe' }} />
            </div>
            <input
              type="text"
              placeholder="Search incidents..."
              className="block w-full pl-10 pr-4 py-2 rounded-lg"
              style={{ 
                backgroundColor: '#2d2b26',
                color: '#fefffe',
                borderColor: '#3ae973'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg px-4 py-2"
            style={{ 
              backgroundColor: '#2d2b26',
              color: '#fefffe',
              borderColor: '#3ae973'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <div className="flex items-center space-x-2">
            <select
              value={dateFilter || ''}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setStartDate(null);
                setEndDate(null);
              }}
              className="rounded-lg px-4 py-2 flex-1"
              style={{ 
                backgroundColor: '#2d2b26',
                color: '#fefffe',
                borderColor: '#3ae973'
              }}
            >
              <option value="">Date Filter</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="custom">Custom Range</option>
            </select>

            {dateFilter === 'custom' && (
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateRangeChange}
                placeholderText="Select range"
                className="rounded-lg px-4 py-2"
                style={{ 
                  backgroundColor: '#2d2b26',
                  color: '#fefffe',
                  borderColor: '#3ae973',
                  width: '100%'
                }}
              />
            )}
          </div>
        </div>

        {/* Incidents List */}
        <div className="space-y-4">
          {filteredIncidents.length > 0 ? (
            filteredIncidents.map((incident) => (
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
              {incidents.length === 0 ? 'No incidents reported yet' : 'No incidents match your filters'}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}