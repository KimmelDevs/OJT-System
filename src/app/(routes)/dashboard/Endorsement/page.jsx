'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ExternalLinkIcon, SearchIcon } from 'lucide-react';
import Card from '../_components/Card';

export default function Endorsement() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const locations = ['All', 'Manila', 'Cebu', 'Tacloban', 'Calbayog'];

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const companiesRef = collection(db, 'companies');
        let q = query(companiesRef);
        
        // Apply location filter if not 'All'
        if (locationFilter !== 'All') {
          q = query(companiesRef, where('address', 'array-contains', locationFilter));
        }

        const querySnapshot = await getDocs(q);
        const companiesData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          companiesData.push({
            id: doc.id,
            name: data.name,
            logo: data.logoBase64 ? `data:image/jpeg;base64,${data.logoBase64}` : '',
            address: data.address,
            description: data.description,
            location: data.location || ''
          });
        });

        setCompanies(companiesData);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [locationFilter]);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#22201a' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3ae973] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4" style={{ color: '#fefffe' }}>Loading partner companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#22201a' }}>
      <Card 
        title="Partner Companies" 
        titleStyle={{ color: '#fefffe' }}
        style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973' }}
        action={
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5" style={{ color: '#fefffe' }} />
              </div>
              <input
                type="text"
                placeholder="Search companies..."
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
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="rounded-lg px-4 py-2"
              style={{ 
                backgroundColor: '#2d2b26',
                color: '#fefffe',
                borderColor: '#3ae973'
              }}
            >
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        }
      >
        <div className="space-y-4">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map(company => (
              <div 
                key={company.id} 
                className="p-4 rounded-lg"
                style={{ 
                  backgroundColor: '#2d2b26',
                  borderColor: '#3ae973',
                  borderWidth: '1px'
                }}
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden mr-3 flex items-center justify-center">
                    {company.logo ? (
                      <img 
                        src={company.logo} 
                        alt={company.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <span style={{ color: '#fefffe' }}>No Logo</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium" style={{ color: '#fefffe' }}>{company.name}</h4>
                    <div className="text-xs" style={{ color: '#fefffe' }}>
                      {company.address}
                    </div>
                  </div>
                </div>
                <p className="text-sm mb-3" style={{ color: '#fefffe' }}>
                  {company.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs px-2 py-1 rounded-full" style={{ 
                    backgroundColor: '#3ae97320',
                    color: '#3ae973'
                  }}>
                    {company.location}
                  </span>
                  <button 
                    className="text-sm flex items-center"
                    style={{ color: '#3ae973' }}
                  >
                    View Details
                    <ExternalLinkIcon size={14} className="ml-1" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8" style={{ color: '#fefffe' }}>
              No companies found matching your criteria
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}