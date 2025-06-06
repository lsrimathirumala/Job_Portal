import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;

      const { data } = await api.get('/jobs', { params });
      setJobs(data.jobs);
    } catch (err) {
      alert('Failed to load jobs');
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchJobs();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Job Listings</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
        <input
          placeholder="Search jobs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: 10, padding: 8 }}
        />
        <input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ marginRight: 10, padding: 8 }}
        />
        <button type="submit" style={{ padding: 8 }}>
          Search
        </button>
      </form>

      {jobs.length === 0 ? (
        <p>No job listings found</p>
      ) : (
        <ul>
          {jobs.map((job) => (
            <li key={job._id} style={{ marginBottom: 10 }}>
              <Link to={`/job/${job._id}`}>
                <strong>{job.jobTitle}</strong> at {job.company} - {job.location}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}