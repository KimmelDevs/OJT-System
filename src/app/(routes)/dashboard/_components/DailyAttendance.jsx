'use client';

import React, { useState } from 'react';
import { ClockIcon, CheckIcon, AlertCircleIcon } from 'lucide-react';
import Card from './Card';

export default function DailyAttendance() {
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [status, setStatus] = useState('missing'); // 'present' | 'missing' | 'complete'

  // Current date
  const today = new Date();
  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);

  const handleTimeIn = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    setTimeIn(time);
    setStatus('present');
  };

  const handleTimeOut = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    setTimeOut(time);
    setStatus('complete');
  };

  return (
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
                onClick={handleTimeOut} 
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
  );
}