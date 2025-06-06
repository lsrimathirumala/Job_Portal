import React, { useContext, useEffect, useState } from 'react';
import api from '../api';
import { AuthContext } from '../App';

export default function ApplicationListPage() {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, [user]);

  async function fetchApplications() {
    try {
      let params = {};
      if (user.role === 'candidate') {
        params.candidateId = user.id;
      }
      // For employer, ideally filter applications by jobs posted - not implemented in frontend here
      const res = await api.get('/applications', { params });
      setApplications(res.data.applications);
    } catch {
      alert('Failed to load applications');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Applications</h2>
      {applications.length === 0 ? (
        <p>No applications found</p>
      ) : (
        <ul>
          {applications.map(({ _id, jobId, status, appliedAt }) => (
            <li key={_id}>
              <strong>{jobId?.jobTitle}</strong> at {jobId?.company} - Status: {status} - Applied:{' '}
              {new Date(appliedAt).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}