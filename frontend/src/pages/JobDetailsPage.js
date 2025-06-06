import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../App';

export default function JobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const { user } = useContext(AuthContext);
  const [coverLetter, setCoverLetter] = useState('');
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  async function fetchJob() {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data);
    } catch (err) {
      alert('Failed to fetch job details');
    }
  }

  async function handleApply() {
    if (!user || user.role !== 'candidate') {
      alert('You must be logged in as a candidate to apply');
      return;
    }
    try {
      await api.post('/applications', {
        jobId: id,
        coverLetter,
      });
      alert('Application submitted!');
      setApplied(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to apply');
    }
  }

  if (!job) return <p>Loading job details...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{job.jobTitle}</h2>
      <p>
        <strong>Company:</strong> {job.company}
      </p>
      <p>
        <strong>Location:</strong> {job.location}
      </p>
      <p>
        <strong>Description:</strong> <br />
        {job.description}
      </p>
      <p>
        <strong>Requirements:</strong> <br />
        <ul>
          {job.requirements?.map((r, idx) => (
            <li key={idx}>{r}</li>
          ))}
        </ul>
      </p>
      <p>
        <strong>Salary Range:</strong> ${job.salary?.min} - ${job.salary?.max}
      </p>

      {user && user.role === 'candidate' && !applied && (
        <div>
          <h3>Apply for this job</h3>
          <textarea
            placeholder="Your cover letter (optional)"
            rows={5}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
          <button onClick={handleApply} style={{ padding: 10 }}>
            Submit Application
          </button>
        </div>
      )}
      {applied && <p style={{ color: 'green' }}>You have successfully applied to this job.</p>}
    </div>
  );
}