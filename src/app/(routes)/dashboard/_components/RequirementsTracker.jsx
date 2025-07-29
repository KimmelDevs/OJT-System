'use client';

import React from 'react';
import Card from './Card';
import { CheckIcon, FileIcon, UploadIcon } from 'lucide-react';

export default function DashboardRequirementsTracker() {
  const requirements = [
    {
      name: 'Resume/CV',
      status: 'completed',
      date: 'June 28, 2023'
    },
    {
      name: 'Endorsement Letter',
      status: 'completed',
      date: 'June 30, 2023'
    },
    {
      name: 'Daily Time Record',
      status: 'pending'
    },
    {
      name: 'Evaluation Form',
      status: 'missing'
    }
  ];

  // Calculate completion percentage
  const completedCount = requirements.filter(req => req.status === 'completed').length;
  const completionPercentage = Math.round(completedCount / requirements.length * 100);

  return (
    <Card 
      title="Requirements" 
      titleStyle={{ color: '#fefffe' }}
      style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973' }}
      action={
        <span className="text-sm" style={{ color: '#3ae973' }}>
          {completionPercentage}% Complete
        </span>
      }
    >
      <div className="mb-4">
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div 
            className="h-1.5 rounded-full" 
            style={{
              width: `${completionPercentage}%`,
              backgroundColor: '#3ae973'
            }}
          ></div>
        </div>
      </div>
      
      <ul className="space-y-2">
        {requirements.slice(0, 3).map((req, i) => (
          <li 
            key={i} 
            className="flex items-center justify-between p-2 rounded-lg"
            style={{ 
              backgroundColor: '#2d2b26',
              border: '1px solid #3ae973'
            }}
          >
            <div className="flex items-center">
              <div 
                className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                  req.status === 'completed' ? 'bg-green-900/20 text-green-500' : 
                  req.status === 'pending' ? 'bg-yellow-900/20 text-yellow-500' : 
                  'bg-gray-700 text-gray-400'
                }`}
              >
                {req.status === 'completed' ? (
                  <CheckIcon size={12} />
                ) : (
                  <FileIcon size={12} />
                )}
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: '#fefffe' }}>
                  {req.name}
                </div>
                {req.date && (
                  <div className="text-xs" style={{ color: '#fefffe' }}>
                    {req.date}
                  </div>
                )}
              </div>
            </div>
            {req.status !== 'completed' && (
              <button 
                className="text-xs flex items-center"
                style={{ color: '#3ae973' }}
              >
                <UploadIcon size={12} className="mr-1" />
                Upload
              </button>
            )}
          </li>
        ))}
      </ul>
      
      {requirements.length > 3 && (
        <div className="mt-2 text-center">
          <button 
            className="text-xs"
            style={{ color: '#3ae973' }}
          >
            View All Requirements
          </button>
        </div>
      )}
    </Card>
  );
}