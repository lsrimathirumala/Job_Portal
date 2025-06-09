import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const styles = {
  container: { padding: '20px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", maxWidth: 900, margin: 'auto' },
  heading: { fontSize: 28, marginBottom: 20, color: '#1a1a1a' },
  form: { marginBottom: 25, display: 'flex', gap: 12, flexWrap: 'wrap' },
  input: { flex: '1 1 200px', padding: '10px 12px', fontSize: 16, borderRadius: 6, border: '1px solid #ccc', outline: 'none', transition: 'border-color 0.3s' },
  inputFocus: { borderColor: '#007bff' },
  button: {
    padding: '10px 20px',
    fontSize: 16,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    transition: 'background-color 0.3s',
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  jobList: { listStyle: 'none', padding: 0, marginTop: 10 },
  jobItem: {
    padding: 20,
    marginBottom: 15,
    borderRadius: 8,
    border: '1px solid #ddd',
    boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)',
    backgroundColor: 'white',
    transition: 'box-shadow 0.3s',
  },
  jobItemHover: {
    boxShadow: '0 4px 8px rgb(0 0 0 / 0.15)',
  },
  jobTitle: { fontSize: 20, fontWeight: '600', marginBottom: 6, color: '#007bff' },
  jobDetails: { fontSize: 15, marginBottom: 3, color: '#444' },
  errorMsg: { color: 'red', fontWeight: '600' },
  loadingMsg: { fontStyle: 'italic' },
};

export default function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;

      const { data } = await api.get('/jobs', { params });
      setJobs(data.jobs);
    } catch (err) {
      setError('Failed to load jobs. Please try again later.');
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, location]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleReset = () => {
    setSearch('');
    setLocation('');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Job Listings</h2>
      
      <form onSubmit={handleSearch} style={styles.form}>
        <input
          placeholder="Search jobs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
          onFocus={e => e.target.style.borderColor = '#007bff'}
          onBlur={e => e.target.style.borderColor = '#ccc'}
        />
        <input
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={styles.input}
          onFocus={e => e.target.style.borderColor = '#007bff'}
          onBlur={e => e.target.style.borderColor = '#ccc'}
        />
        <button type="submit" style={styles.button}>Search</button>
        <button 
          type="button" 
          onClick={handleReset}
          style={{ ...styles.button, ...styles.buttonSecondary, marginLeft: 5 }}
        >
          Reset
        </button>
      </form>

      {isLoading ? (
        <p style={styles.loadingMsg}>Loading jobs...</p>
      ) : error ? (
        <p style={styles.errorMsg}>{error}</p>
      ) : jobs.length === 0 ? (
        <p>No job listings found.</p>
      ) : (
        <ul style={styles.jobList}>
          {jobs.map((job, idx) => (
            <li
              key={job._id}
              style={{ 
                ...styles.jobItem, 
                ...(hoverIndex === idx ? styles.jobItemHover : {}) 
              }}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <Link 
                to={`/job/${job._id}`} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={styles.jobTitle}>{job.jobTitle}</div>
                <div style={styles.jobDetails}>Company: {job.company}</div>
                <div style={styles.jobDetails}>Location: {job.location}</div>
                {job.salary && (
                  <div style={styles.jobDetails}>
                    Salary: {job.salary.min ?? 'N/A'} - {job.salary.max ?? 'N/A'}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
