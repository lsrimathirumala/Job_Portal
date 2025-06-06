import React, { useContext, useEffect, useState } from 'react';
import api from '../api';
import { AuthContext } from '../App';

export default function CandidateProfilePage() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    skills: [],
    education: [{
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: ''
    }],
    workHistory: [{
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    }],
    resumeText: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get(`/candidates/${user.id}`);
        const data = res.data;
        
        // Format dates for input fields (YYYY-MM-DD)
        const formatDate = (date) => {
          if (!date) return '';
          const d = new Date(date);
          return d.toISOString().split('T')[0];
        };

        setProfile({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          skills: data.skills || [],
          education: data.education?.length > 0 
            ? data.education.map(edu => ({
                ...edu,
                startDate: formatDate(edu.startDate),
                endDate: formatDate(edu.endDate)
              }))
            : [{
                institution: '',
                degree: '',
                fieldOfStudy: '',
                startDate: '',
                endDate: ''
              }],
          workHistory: data.workHistory?.length > 0 
            ? data.workHistory.map(job => ({
                ...job,
                startDate: formatDate(job.startDate),
                endDate: formatDate(job.endDate)
              }))
            : [{
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                description: ''
              }],
          resumeText: data.resumeText || ''
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user.id]);

  const handleFieldChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (field, index, subField, value) => {
    setProfile(prev => {
      const updatedArray = [...prev[field]];
      updatedArray[index] = { ...updatedArray[index], [subField]: value };
      return { ...prev, [field]: updatedArray };
    });
  };

  const addEducation = () => {
    setProfile(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: ''
        }
      ]
    }));
  };

  const addWorkHistory = () => {
    setProfile(prev => ({
      ...prev,
      workHistory: [
        ...prev.workHistory,
        {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          description: ''
        }
      ]
    }));
  };

  const removeEducation = (index) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const removeWorkHistory = (index) => {
    setProfile(prev => ({
      ...prev,
      workHistory: prev.workHistory.filter((_, i) => i !== index)
    }));
  };

  async function handleSave() {
    try {
      // Convert date strings to Date objects before sending
      const payload = {
        ...profile,
        education: profile.education.map(edu => ({
          ...edu,
          startDate: edu.startDate ? new Date(edu.startDate) : null,
          endDate: edu.endDate ? new Date(edu.endDate) : null
        })),
        workHistory: profile.workHistory.map(job => ({
          ...job,
          startDate: job.startDate ? new Date(job.startDate) : null,
          endDate: job.endDate ? new Date(job.endDate) : null
        }))
      };

      await api.patch(`/candidates/${user.id}`, payload);
      alert('Profile saved successfully');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile. Please check console for details.');
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading profile...</div>;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h2>Your Profile</h2>
      
      <section style={{ marginBottom: 30 }}>
        <h3>Basic Information</h3>
        <div style={{ marginBottom: 15 }}>
          <label>Full Name:</label>
          <input
            type="text"
            value={profile.fullName}
            onChange={(e) => handleFieldChange('fullName', e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 5 }}
          />
        </div>
        
        <div style={{ marginBottom: 15 }}>
          <label>Email:</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 5 }}
          />
        </div>
        
        <div style={{ marginBottom: 15 }}>
          <label>Phone:</label>
          <input
            type="text"
            value={profile.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 5 }}
          />
        </div>
        
        <div style={{ marginBottom: 15 }}>
          <label>Skills (comma separated):</label>
          <input
            type="text"
            value={profile.skills.join(', ')}
            onChange={(e) => handleFieldChange('skills', e.target.value.split(',').map(s => s.trim()))}
            style={{ width: '100%', padding: 8, marginTop: 5 }}
          />
        </div>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h3>Education</h3>
        {profile.education.map((edu, index) => (
          <div key={index} style={{ border: '1px solid #ddd', padding: 15, marginBottom: 15, borderRadius: 5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <h4>Education #{index + 1}</h4>
              <button onClick={() => removeEducation(index)} style={{ color: 'red' }}>Remove</button>
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label>Institution:</label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => handleArrayFieldChange('education', index, 'institution', e.target.value)}
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label>Degree:</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => handleArrayFieldChange('education', index, 'degree', e.target.value)}
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label>Field of Study:</label>
              <input
                type="text"
                value={edu.fieldOfStudy}
                onChange={(e) => handleArrayFieldChange('education', index, 'fieldOfStudy', e.target.value)}
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div>
                <label>Start Date:</label>
                <input
                  type="date"
                  value={edu.startDate}
                  onChange={(e) => handleArrayFieldChange('education', index, 'startDate', e.target.value)}
                  style={{ width: '100%', padding: 8, marginTop: 5 }}
                />
              </div>
              <div>
                <label>End Date:</label>
                <input
                  type="date"
                  value={edu.endDate}
                  onChange={(e) => handleArrayFieldChange('education', index, 'endDate', e.target.value)}
                  style={{ width: '100%', padding: 8, marginTop: 5 }}
                />
              </div>
            </div>
          </div>
        ))}
        <button onClick={addEducation} style={{ padding: '8px 15px', background: '#f0f0f0', border: '1px solid #ddd' }}>
          + Add Education
        </button>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h3>Work History</h3>
        {profile.workHistory.map((job, index) => (
          <div key={index} style={{ border: '1px solid #ddd', padding: 15, marginBottom: 15, borderRadius: 5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <h4>Job #{index + 1}</h4>
              <button onClick={() => removeWorkHistory(index)} style={{ color: 'red' }}>Remove</button>
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label>Company:</label>
              <input
                type="text"
                value={job.company}
                onChange={(e) => handleArrayFieldChange('workHistory', index, 'company', e.target.value)}
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label>Position:</label>
              <input
                type="text"
                value={job.position}
                onChange={(e) => handleArrayFieldChange('workHistory', index, 'position', e.target.value)}
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>
            
            <div style={{ marginBottom: 10 }}>
              <label>Description:</label>
              <textarea
                value={job.description}
                onChange={(e) => handleArrayFieldChange('workHistory', index, 'description', e.target.value)}
                style={{ width: '100%', padding: 8, marginTop: 5, minHeight: 80 }}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div>
                <label>Start Date:</label>
                <input
                  type="date"
                  value={job.startDate}
                  onChange={(e) => handleArrayFieldChange('workHistory', index, 'startDate', e.target.value)}
                  style={{ width: '100%', padding: 8, marginTop: 5 }}
                />
              </div>
              <div>
                <label>End Date:</label>
                <input
                  type="date"
                  value={job.endDate}
                  onChange={(e) => handleArrayFieldChange('workHistory', index, 'endDate', e.target.value)}
                  style={{ width: '100%', padding: 8, marginTop: 5 }}
                />
              </div>
            </div>
          </div>
        ))}
        <button onClick={addWorkHistory} style={{ padding: '8px 15px', background: '#f0f0f0', border: '1px solid #ddd' }}>
          + Add Work Experience
        </button>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h3>Resume Text</h3>
        <textarea
          value={profile.resumeText}
          onChange={(e) => handleFieldChange('resumeText', e.target.value)}
          style={{ width: '100%', padding: 8, minHeight: 150 }}
          placeholder="Paste your resume text here..."
        />
      </section>

      <button 
        onClick={handleSave} 
        style={{ 
          padding: '10px 20px', 
          background: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: 4,
          fontSize: 16,
          cursor: 'pointer'
        }}
      >
        Save Profile
      </button>
    </div>
  );
}