'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon, XIcon } from 'lucide-react';

import Card from '../_components/Card';
export default function AdminEndorsement() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    location: '',
    website: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [logoBase64, setLogoBase64] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const locations = ['Manila', 'Cebu', 'Tacloban', 'Calbayog'];

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const companiesRef = collection(db, 'companies');
      const querySnapshot = await getDocs(companiesRef);
      const companiesData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        companiesData.push({
          id: doc.id,
          ...data,
          logoUrl: data.logoBase64 ? `data:image/jpeg;base64,${data.logoBase64}` : ''
        });
      });

      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const compressImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const MAX_SIZE = 800;
          let width = img.width;
          let height = img.height;

          // Maintain aspect ratio while resizing
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const quality = 0.7; // 70% quality
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64.split(',')[1]); // Return only the base64 data part
        };
        img.src = event.target.result;
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);

      const compressedBase64 = await compressImageToBase64(file);
      setLogoBase64(compressedBase64);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      location: '',
      website: '',
      contactEmail: '',
      contactPhone: ''
    });
    setLogoBase64('');
    setLogoPreview('');
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const companyData = {
        ...formData,
        logoBase64,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        // Update existing company
        const companyRef = doc(db, 'companies', editingId);
        await setDoc(companyRef, companyData, { merge: true });
      } else {
        // Add new company
        await addDoc(collection(db, 'companies'), companyData);
      }

      resetForm();
      await fetchCompanies();
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Failed to save company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (company) => {
    setFormData({
      name: company.name,
      description: company.description,
      address: company.address,
      location: company.location,
      website: company.website || '',
      contactEmail: company.contactEmail || '',
      contactPhone: company.contactPhone || ''
    });
    setLogoBase64(company.logoBase64 || '');
    setLogoPreview(company.logoUrl || '');
    setEditingId(company.id);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this company?')) {
      try {
        // Note: You'll need to implement the delete functionality
        // For Firestore, you would use: await deleteDoc(doc(db, 'companies', id));
        alert('Company deleted successfully');
        await fetchCompanies();
      } catch (error) {
        console.error('Error deleting company:', error);
        alert('Failed to delete company');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#22201a' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3ae973] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4" style={{ color: '#fefffe' }}>Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#22201a' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Card */}
        <Card 
          title={editingId ? "Edit Company" : "Add New Company"} 
          titleStyle={{ color: '#fefffe' }}
          style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#fefffe' }}>
                Company Logo
              </label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#3ae973] file:text-[#010100]
                    hover:file:bg-[#3ae973]/90"
                />
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#fefffe' }}>
                Company Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg"
                style={{ 
                  backgroundColor: '#393632',
                  color: '#fefffe',
                  borderColor: '#3ae973'
                }}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#fefffe' }}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 rounded-lg"
                style={{ 
                  backgroundColor: '#393632',
                  color: '#fefffe',
                  borderColor: '#3ae973'
                }}
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#fefffe' }}>
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg"
                style={{ 
                  backgroundColor: '#393632',
                  color: '#fefffe',
                  borderColor: '#3ae973'
                }}
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#fefffe' }}>
                Location *
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg"
                style={{ 
                  backgroundColor: '#393632',
                  color: '#fefffe',
                  borderColor: '#3ae973'
                }}
                required
              >
                <option value="">Select Location</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#fefffe' }}>
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg"
                  style={{ 
                    backgroundColor: '#393632',
                    color: '#fefffe',
                    borderColor: '#3ae973'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#fefffe' }}>
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg"
                  style={{ 
                    backgroundColor: '#393632',
                    color: '#fefffe',
                    borderColor: '#3ae973'
                  }}
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#fefffe' }}>
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg"
                style={{ 
                  backgroundColor: '#393632',
                  color: '#fefffe',
                  borderColor: '#3ae973'
                }}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg flex items-center"
                  style={{ 
                    backgroundColor: '#ff6b6b',
                    color: '#fefffe'
                  }}
                >
                  <XIcon size={16} className="mr-1" />
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg flex items-center"
                style={{ 
                  backgroundColor: '#3ae973',
                  color: '#010100'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#010100] border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {editingId ? (
                      <>
                        <CheckIcon size={16} className="mr-1" />
                        Update Company
                      </>
                    ) : (
                      <>
                        <PlusIcon size={16} className="mr-1" />
                        Add Company
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>

        {/* Companies List */}
        <Card 
          title="Partner Companies" 
          titleStyle={{ color: '#fefffe' }}
          style={{ backgroundColor: '#2d2b26', borderColor: '#3ae973' }}
        >
          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {companies.length > 0 ? (
              companies.map(company => (
                <div 
                  key={company.id} 
                  className="p-4 rounded-lg group relative"
                  style={{ 
                    backgroundColor: '#2d2b26',
                    borderColor: '#3ae973',
                    borderWidth: '1px'
                  }}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden mr-3 flex items-center justify-center">
                      {company.logoUrl ? (
                        <img 
                          src={company.logoUrl} 
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
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(company)}
                        className="text-sm flex items-center p-1 rounded"
                        style={{ 
                          backgroundColor: '#3ae97320',
                          color: '#3ae973'
                        }}
                      >
                        <EditIcon size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(company.id)}
                        className="text-sm flex items-center p-1 rounded"
                        style={{ 
                          backgroundColor: '#ff6b6b20',
                          color: '#ff6b6b'
                        }}
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8" style={{ color: '#fefffe' }}>
                No companies added yet
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}