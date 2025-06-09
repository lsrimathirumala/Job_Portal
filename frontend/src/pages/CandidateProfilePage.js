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
    education: [
      {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
      },
    ],
    workHistory: [
      {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
      },
    ],
    resumeText: '',
    resumeFileName: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get(`/candidates/user/${user.id}`);
        const data = res.data;

        // Format dates for input fields (YYYY-MM-DD)
        const formatDate = (date) => {
          if (!date) return '';
          const d = new Date(date);
          return d.toISOString().split('T')[0];
        };

        setProfile({
          fullName: data.fullName || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          skills: data.skills || [],
          education:
            data.education?.length > 0
              ? data.education.map((edu) => ({
                  ...edu,
                  startDate: formatDate(edu.startDate),
                  endDate: formatDate(edu.endDate),
                }))
              : [
                  {
                    institution: '',
                    degree: '',
                    fieldOfStudy: '',
                    startDate: '',
                    endDate: '',
                  },
                ],
          workHistory:
            data.workHistory?.length > 0
              ? data.workHistory.map((job) => ({
                  ...job,
                  startDate: formatDate(job.startDate),
                  endDate: formatDate(job.endDate),
                }))
              : [
                  {
                    company: '',
                    position: '',
                    startDate: '',
                    endDate: '',
                    description: '',
                  },
                ],
          resumeText: data.resumeText || '',
          resumeFileName: data.resumeFileName || '',
          _id: data._id || null,
        });
      } catch (err) {
        if (err.response?.status === 404) {
          // No profile yet: initialize with user email and empty fields
          setProfile((prev) => ({
            ...prev,
            email: user.email,
            _id: null,
          }));
        }
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user.id, user.email]);

  const handleFieldChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (field, index, subField, value) => {
    setProfile((prev) => {
      const updatedArray = [...prev[field]];
      updatedArray[index] = { ...updatedArray[index], [subField]: value };
      return { ...prev, [field]: updatedArray };
    });
  };

  const addEducation = () => {
    setProfile((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
        },
      ],
    }));
  };

  const addWorkHistory = () => {
    setProfile((prev) => ({
      ...prev,
      workHistory: [
        ...prev.workHistory,
        {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          description: '',
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    if (window.confirm('Are you sure you want to remove this education entry?')) {
      setProfile((prev) => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index),
      }));
    }
  };

  const removeWorkHistory = (index) => {
    if (window.confirm('Are you sure you want to remove this work history entry?')) {
      setProfile((prev) => ({
        ...prev,
        workHistory: prev.workHistory.filter((_, i) => i !== index),
      }));
    }
  };

  const handleResumeFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setProfile((prev) => ({
        ...prev,
        resumeFileName: file.name,
      }));
    }
  };

  async function handleSave() {
  setSaving(true);

  try {
    // Prepare payload with proper date formatting
    const payload = {
      ...profile,
      education: profile.education.map((edu) => ({
        ...edu,
        startDate: edu.startDate ? new Date(edu.startDate).toISOString() : null,
        endDate: edu.endDate ? new Date(edu.endDate).toISOString() : null,
      })),
      workHistory: profile.workHistory.map((job) => ({
        ...job,
        startDate: job.startDate ? new Date(job.startDate).toISOString() : null,
        endDate: job.endDate ? new Date(job.endDate).toISOString() : null,
      })),
      resumeFileUrl: profile.resumeFileUrl || null, // default if not changed
    };

    // Upload resume file if a new one is selected
    if (resumeFile) {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      let uploadRes;
      try {
        uploadRes = await api.post('/candidates/uploadResume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch (uploadErr) {
        alert('Failed to upload resume file. Please try again.');
        setSaving(false);
        return;
      }

      if (uploadRes.data?.resumeUrl) {
        payload.resumeFileName = resumeFile.name;
        payload.resumeFileUrl = uploadRes.data.resumeUrl;
      } else {
        alert('Resume upload response did not contain a URL. Please try again.');
        setSaving(false);
        return;
      }
    }

    // Save or update profile
    let res;
    if (profile._id) {
      res = await api.patch(`/candidates/${profile._id}`, payload);
    } else {
      res = await api.post('/candidates', payload);
      setProfile((prev) => ({ ...prev, _id: res.data._id }));
    }

    alert('Profile saved successfully');
    setResumeFile(null); // reset selected file after successful save

  } catch (err) {
    console.error('Error saving profile:', err);
    if (err.response) {
      const errorDetails = err.response.data?.details || err.response.data?.error || err.response.statusText;
      alert(`Failed to save profile: ${errorDetails}`);
    } else {
      alert('Failed to save profile. Check console for details.');
    }
  } finally {
    setSaving(false);
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
            onChange={(e) =>
              handleFieldChange(
                'skills',
                e.target.value.split(',').map((s) => s.trim())
              )
            }
            style={{ width: '100%', padding: 8, marginTop: 5 }}
          />
        </div>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h3>Education</h3>
        {profile.education.map((edu, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ddd',
              padding: 15,
              marginBottom: 15,
              borderRadius: 5,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <h4>Education #{index + 1}</h4>
              <button
                onClick={() => removeEducation(index)}
                style={{ color: 'red' }}
              >
                Remove
              </button>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Institution:</label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) =>
                  handleArrayFieldChange('education', index, 'institution', e.target.value)
                }
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Degree:</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) =>
                  handleArrayFieldChange('education', index, 'degree', e.target.value)
                }
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Field of Study:</label>
              <input
                type="text"
                value={edu.fieldOfStudy}
                onChange={(e) =>
                  handleArrayFieldChange('education', index, 'fieldOfStudy', e.target.value)
                }
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div>
                <label>Start Date:</label>
                <input
                  type="date"
                  value={edu.startDate}
                  onChange={(e) =>
                    handleArrayFieldChange('education', index, 'startDate', e.target.value)
                  }
                  style={{ width: '100%', padding: 8, marginTop: 5 }}
                />
              </div>
              <div>
                <label>End Date:</label>
                <input
                  type="date"
                  value={edu.endDate}
                  onChange={(e) =>
                    handleArrayFieldChange('education', index, 'endDate', e.target.value)
                  }
                  style={{ width: '100%', padding: 8, marginTop: 5 }}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addEducation}
          style={{
            padding: '8px 15px',
            background: '#f0f0f0',
            border: '1px solid #ddd',
            cursor: 'pointer',
          }}
        >
          + Add Education
        </button>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h3>Work History</h3>
        {profile.workHistory.map((job, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ddd',
              padding: 15,
              marginBottom: 15,
              borderRadius: 5,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <h4>Job #{index + 1}</h4>
              <button
                onClick={() => removeWorkHistory(index)}
                style={{ color: 'red' }}
              >
                Remove
              </button>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Company:</label>
              <input
                type="text"
                value={job.company}
                onChange={(e) =>
                  handleArrayFieldChange('workHistory', index, 'company', e.target.value)
                }
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Position:</label>
              <input
                type="text"
                value={job.position}
                onChange={(e) =>
                  handleArrayFieldChange('workHistory', index, 'position', e.target.value)
                }
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Description:</label>
              <textarea
                value={job.description}
                onChange={(e) =>
                  handleArrayFieldChange('workHistory', index, 'description', e.target.value)
                }
                style={{ width: '100%', padding: 8, marginTop: 5, minHeight: 80 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div>
                <label>Start Date:</label>
                <input
                  type="date"
                  value={job.startDate}
                  onChange={(e) =>
                    handleArrayFieldChange('workHistory', index, 'startDate', e.target.value)
                  }
                  style={{ width: '100%', padding: 8, marginTop: 5 }}
                />
              </div>
              <div>
                <label>End Date:</label>
                <input
                  type="date"
                  value={job.endDate}
                  onChange={(e) =>
                    handleArrayFieldChange('workHistory', index, 'endDate', e.target.value)
                  }
                  style={{ width: '100%', padding: 8, marginTop: 5 }}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addWorkHistory}
          style={{
            padding: '8px 15px',
            background: '#f0f0f0',
            border: '1px solid #ddd',
            cursor: 'pointer',
          }}
        >
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

      <section style={{ marginBottom: 30 }}>
        <h3>Upload Resume File</h3>
        <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleResumeFileChange} />
        {profile.resumeFileName && (
          <p style={{ marginTop: 5 }}>
            Current file: <strong>{profile.resumeFileName}</strong>
          </p>
        )}
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '10px 20px',
          background: saving ? '#888' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          fontSize: 16,
          cursor: saving ? 'not-allowed' : 'pointer',
        }}
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
}
