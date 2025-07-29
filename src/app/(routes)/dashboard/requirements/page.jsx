'use client';

import React from 'react';
import Card from '../_components/Card';
import { CheckIcon, FileIcon, UploadIcon, ChevronDownIcon, ChevronUpIcon, DownloadIcon } from 'lucide-react';

export default function OJTRequirementsPage() {
  // Expanded list of all OJT requirements
  const allRequirements = [
    {
      id: 1,
      name: 'Resume/CV',
      description: 'Updated resume highlighting relevant skills and experience',
      status: 'completed',
      date: 'June 28, 2023',
      file: 'resume_john_doe.pdf',
      category: 'Pre-employment'
    },
    {
      id: 2,
      name: 'Endorsement Letter',
      description: 'Official letter from your educational institution',
      status: 'completed',
      date: 'June 30, 2023',
      file: 'endorsement_letter.pdf',
      category: 'Pre-employment'
    },
    {
      id: 3,
      name: 'Daily Time Record',
      description: 'Monthly submission of logged hours',
      status: 'pending',
      dueDate: 'August 5, 2023',
      category: 'Monthly'
    },
    {
      id: 4,
      name: 'Evaluation Form',
      description: 'Supervisor evaluation of your performance',
      status: 'missing',
      category: 'Mid-term'
    },
    {
      id: 5,
      name: 'Training Agreement',
      description: 'Signed contract with the company',
      status: 'completed',
      date: 'July 2, 2023',
      file: 'training_agreement.pdf',
      category: 'Pre-employment'
    },
    {
      id: 6,
      name: 'Weekly Report',
      description: 'Summary of weekly activities and learnings',
      status: 'pending',
      dueDate: 'July 28, 2023',
      category: 'Weekly'
    },
    {
      id: 7,
      name: 'Final Presentation',
      description: 'Capstone presentation of your OJT experience',
      status: 'upcoming',
      category: 'Final'
    }
  ];

  // Group requirements by category
  const requirementsByCategory = allRequirements.reduce((acc, req) => {
    if (!acc[req.category]) {
      acc[req.category] = [];
    }
    acc[req.category].push(req);
    return acc;
  }, {});

  // Calculate overall completion
  const completedCount = allRequirements.filter(req => req.status === 'completed').length;
  const completionPercentage = Math.round(completedCount / allRequirements.length * 100);

  // State for expanded categories
  const [expandedCategories, setExpandedCategories] = React.useState({
    'Pre-employment': true,
    'Monthly': true,
    'Weekly': false,
    'Mid-term': false,
    'Final': false
  });

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="space-y-6">
      <Card 
        title="OJT Requirements Overview" 
        titleStyle={{ color: '#fefffe' }}
        style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973' }}
        action={
          <span className="text-sm" style={{ color: '#3ae973' }}>
            {completionPercentage}% Complete ({completedCount}/{allRequirements.length})
          </span>
        }
      >
        <div className="mb-4">
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full" 
              style={{
                width: `${completionPercentage}%`,
                backgroundColor: '#3ae973'
              }}
            ></div>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(requirementsByCategory).map(([category, requirements]) => (
            <div key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center justify-between w-full p-2 rounded-lg"
                style={{ 
                  backgroundColor: '#2d2b26',
                  border: '1px solid #3ae973'
                }}
              >
                <div className="flex items-center">
                  <span className="font-medium" style={{ color: '#fefffe' }}>
                    {category} ({requirements.length})
                  </span>
                </div>
                {expandedCategories[category] ? (
                  <ChevronUpIcon size={16} style={{ color: '#3ae973' }} />
                ) : (
                  <ChevronDownIcon size={16} style={{ color: '#3ae973' }} />
                )}
              </button>

              {expandedCategories[category] && (
                <ul className="mt-2 space-y-2">
                  {requirements.map((req) => (
                    <li 
                      key={req.id} 
                      className="flex items-start justify-between p-3 rounded-lg"
                      style={{ 
                        backgroundColor: '#2d2b26',
                        border: '1px solid #3ae973'
                      }}
                    >
                      <div className="flex items-start">
                        <div 
                          className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-1 ${
                            req.status === 'completed' ? 'bg-green-900/20 text-green-500' : 
                            req.status === 'pending' ? 'bg-yellow-900/20 text-yellow-500' : 
                            req.status === 'upcoming' ? 'bg-blue-900/20 text-blue-500' :
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
                          <div className="font-medium" style={{ color: '#fefffe' }}>
                            {req.name}
                          </div>
                          <div className="text-sm mt-1" style={{ color: '#fefffe' }}>
                            {req.description}
                          </div>
                          <div className="text-xs mt-1" style={{ color: '#fefffe' }}>
                            {req.date && `Submitted: ${req.date}`}
                            {req.dueDate && `Due: ${req.dueDate}`}
                            {req.status === 'missing' && 'Not submitted'}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {req.status === 'completed' && req.file && (
                          <button 
                            className="text-xs flex items-center"
                            style={{ color: '#3ae973' }}
                            onClick={() => alert(`Downloading ${req.file}`)}
                          >
                            <DownloadIcon size={14} className="mr-1" />
                          </button>
                        )}
                        {req.status !== 'completed' && (
                          <button 
                            className="text-xs flex items-center px-2 py-1 rounded"
                            style={{ 
                              backgroundColor: '#3ae973',
                              color: '#010100'
                            }}
                            onClick={() => alert(`Upload ${req.name}`)}
                          >
                            <UploadIcon size={14} className="mr-1" />
                            Upload
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          title="Completed" 
          titleStyle={{ color: '#fefffe' }}
          style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973' }}
        >
          <div className="text-2xl font-bold" style={{ color: '#3ae973' }}>
            {completedCount}
          </div>
          <div className="text-sm" style={{ color: '#fefffe' }}>
            Requirements fulfilled
          </div>
        </Card>

        <Card 
          title="Pending" 
          titleStyle={{ color: '#fefffe' }}
          style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973' }}
        >
          <div className="text-2xl font-bold" style={{ color: '#fbbf24' }}>
            {allRequirements.filter(req => req.status === 'pending').length}
          </div>
          <div className="text-sm" style={{ color: '#fefffe' }}>
            Requirements in progress
          </div>
        </Card>

        <Card 
          title="Missing" 
          titleStyle={{ color: '#fefffe' }}
          style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973' }}
        >
          <div className="text-2xl font-bold" style={{ color: '#ef4444' }}>
            {allRequirements.filter(req => req.status === 'missing').length}
          </div>
          <div className="text-sm" style={{ color: '#fefffe' }}>
            Requirements not started
          </div>
        </Card>
      </div>
    </div>
  );
}