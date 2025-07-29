'use client';

import React from 'react';
import Card from './Card';
import { ClockIcon, CalendarIcon, CheckSquareIcon, FileTextIcon } from 'lucide-react';

export default function CompactDashboardStats() {
  const stats = [
    {
      icon: <ClockIcon size={16} className="text-blue-400" />,
      label: 'Hours',
      value: '312',
      total: '500',
      percentage: 62
    },
    {
      icon: <CalendarIcon size={16} className="text-green-400" />,
      label: 'Weeks',
      value: '6',
      total: '10',
      percentage: 60
    },
    {
      icon: <CheckSquareIcon size={16} className="text-purple-400" />,
      label: 'Requirements',
      value: '2',
      total: '4',
      percentage: 50
    },
    {
      icon: <FileTextIcon size={16} className="text-orange-400" />,
      label: 'Journals',
      value: '12',
      total: '20',
      percentage: 60
    }
  ];

  return (
    <Card 
      title="OJT Progress" 
      titleStyle={{ color: '#fefffe' }}
      style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973' }}
    >
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="p-3 rounded-lg"
            style={{ 
              backgroundColor: '#2d2b26',
              border: '1px solid #3ae973'
            }}
          >
            <div className="flex items-center mb-1">
              <div className="mr-2">{stat.icon}</div>
              <div className="text-xs font-medium" style={{ color: '#fefffe' }}>
                {stat.label}
              </div>
            </div>
            <div className="text-lg font-semibold" style={{ color: '#fefffe' }}>
              {stat.value}
              <span className="text-xs ml-1" style={{ color: '#fefffe' }}>
                /{stat.total}
              </span>
            </div>
            <div className="mt-1">
              <div className="w-full rounded-full h-1" style={{ backgroundColor: '#22201a' }}>
                <div 
                  className="h-1 rounded-full" 
                  style={{
                    width: `${stat.percentage}%`,
                    backgroundColor: 
                      i === 0 ? '#3b82f6' : 
                      i === 1 ? '#10b981' : 
                      i === 2 ? '#8b5cf6' : '#f97316'
                  }}
                ></div>
              </div>
              <div className="text-xs text-right mt-0.5" style={{ color: '#fefffe' }}>
                {stat.percentage}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}