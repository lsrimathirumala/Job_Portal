import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function PostJobPage() {
  const navigate = useNavigate();
  const [job, setJob] = useState({
    jobTitle: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salaryMin: '',
    salaryMax: '',
    industry: '',
    skills: '',
  });

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await api.post('/jobs', {
        jobTitle: job.jobTitle,
        company: job.company,
        location: job.location,
        description: job.description,
        requirements: job.requirements.split(',').map((r) => r.trim()),
        salary: { min: Number(job.salaryMin), max: Number(job.salaryMax) },
        industry: job.industry,
        skills: job.skills.split(',').map((s) => s.trim()),
      });
      alert('Job posted successfully');
      navigate('/', { replace: true });
    } catch (err) {
      alert('Failed to post job');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Post a New Job</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <label>Job Title:</label>
        <input
          type="text"
          required
          value={job.jobTitle}
          onChange={(e) => setJob({ ...job, jobTitle: e.target.value })}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />

        <label>Company:</label>
        <input
          type="text"
          required
          value={job.company}
          onChange={(e) => setJob({ ...job, company: e.target.value })}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />

        <label>Location:</label>
        <input
          type="text"
          required
          value={job.location}
          onChange={(e) => setJob({ ...job, location: e.target.value })}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />

        <label>Description:</label>
        <textarea
          value={job.description}
          onChange={(e) => setJob({ ...job, description: e.target.value })}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
          rows={4}
        />

        <label>Requirements (comma separated):</label>
        <input
          type="text"
          value={job.requirements}
          onChange={(e) => setJob({ ...job, requirements: e.target.value })}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />

        <label>Salary Min:</label>
        <input
          type="number"
          min="0"
          value={job.salaryMin}
          onChange={(e) => setJob({ ...job, salaryMin: e.target.value })}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />

        <label>Salary Max:</label>
        <input
          type="number"
          min="0"
          value={job.salaryMax}
          onChange={(e) => setJob({ ...job, salaryMax: e.target.value })}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />

        <label>Industry:</label>
        <input
          type="text"
          value={job.industry}
          onChange={(e) => setJob({ ...job, industry: e.target.value })}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />

        <label>Skills (comma separated):</label>
        <input
          type="text"
          value={job.skills}
          onChange={(e) => setJob({ ...job, skills: e.target.value })}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />

        <button type="submit" style={{ padding: 10 }}>
          Post Job
        </button>
      </form>
    </div>
  );
}