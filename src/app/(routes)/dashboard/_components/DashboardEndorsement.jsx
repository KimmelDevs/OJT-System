'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ExternalLinkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Card from '../_components/Card';

export default function DashboardEndorsement() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const companiesRef = collection(db, 'companies');
        const q = query(companiesRef, limit(3));
        
        const querySnapshot = await getDocs(q);
        const companiesData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          companiesData.push({
            id: doc.id,
            name: data.name,
            logo: data.logoBase64 ? `data:image/jpeg;base64,${data.logoBase64}` : '',
            description: data.description
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
  }, []);

  const handleViewDetails = () => {
    router.push('/dashboard/endorsement');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-8 h-8 border-4 border-[#3ae973] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Card 
      title="Partner Companies" 
      titleStyle={{ color: '#fefffe' }}
      style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973' }}
      action={
        <button 
          onClick={handleViewDetails}
          className="text-sm flex items-center"
          style={{ color: '#3ae973' }}
        >
          View All
          <ExternalLinkIcon size={14} className="ml-1" />
        </button>
      }
    >
      <div className="space-y-4">
        {companies.length > 0 ? (
          companies.map(company => (
            <div 
              key={company.id} 
              className="flex items-center p-3 rounded-lg"
              style={{ 
                backgroundColor: '#2d2b26',
                border: '1px solid #3ae973'
              }}
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                {company.logo ? (
                  <img 
                    src={company.logo} 
                    alt={company.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-xs" style={{ color: '#fefffe' }}>No Logo</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 
                  className="font-medium truncate" 
                  style={{ color: '#fefffe' }}
                  title={company.name}
                >
                  {company.name}
                </h4>
                <p 
                  className="text-xs truncate" 
                  style={{ color: '#fefffe' }}
                  title={company.description}
                >
                  {company.description}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4" style={{ color: '#fefffe' }}>
            No partner companies found
          </div>
        )}
      </div>
    </Card>
  );
}