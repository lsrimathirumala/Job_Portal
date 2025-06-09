import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../App';

const styles = {
  container: {
    padding: 20,
    maxWidth: 800,
    margin: '0 auto',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#222',
  },
  heading: {
    marginBottom: 15,
    fontSize: 28,
    fontWeight: '700',
    color: '#007bff',
  },
  infoBlock: {
    marginBottom: 20,
    fontSize: 16,
    lineHeight: 1.5,
  },
  labelStrong: {
    fontWeight: '600',
    color: '#444',
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 22,
    fontWeight: '600',
    borderBottom: '2px solid #007bff',
    paddingBottom: 6,
    color: '#007bff',
  },
  description: {
    whiteSpace: 'pre-line',
    fontSize: 16,
    color: '#333',
  },
  list: {
    paddingLeft: 20,
    marginBottom: 10,
    color: '#444',
  },
  listItem: {
    marginBottom: 6,
    fontSize: 15,
  },
  applySection: {
    marginTop: 30,
    borderTop: '1px solid #eee',
    paddingTop: 20,
  },
  label: {
    display: 'block',
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  textarea: {
    width: '100%',
    padding: 12,
    border: '1px solid #ccc',
    borderRadius: 6,
    fontSize: 16,
    lineHeight: 1.5,
    resize: 'vertical',
    transition: 'border-color 0.3s',
    outline: 'none',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  textareaFocus: {
    borderColor: '#007bff',
  },
  button: {
    padding: '12px 28px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  successMsg: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: 6,
    color: '#155724',
    fontWeight: '600',
    fontSize: 16,
  },
  errorMsg: {
    padding: 20,
    color: 'red',
    fontWeight: '600',
  },
  loadingMsg: {
    padding: 20,
    fontStyle: 'italic',
  },
};

export default function JobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const [coverLetter, setCoverLetter] = useState('');
  const [applied, setApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data);

      if (user?.role === 'candidate') {
        try {
          const { data: application } = await api.get(`/applications/check?jobId=${id}`);
          setApplied(application.exists);
        } catch {
          // ignore check errors
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  async function handleApply() {
    if (!user || user.role !== 'candidate') {
      alert('You must be logged in as a candidate to apply');
      return;
    }

    try {
      setIsApplying(true);
      await api.post('/applications', {
        jobId: id,
        coverLetter,
      });
      setApplied(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to apply');
    } finally {
      setIsApplying(false);
    }
  }

  if (loading) return <div style={styles.loadingMsg}>Loading job details...</div>;
  if (error) return <div style={styles.errorMsg}>Error: {error}</div>;
  if (!job) return <div style={{ padding: 20 }}>Job not found</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>{job.jobTitle}</h2>

      <div style={styles.infoBlock}>
        <p><span style={styles.labelStrong}>Company:</span> {job.company}</p>
        <p><span style={styles.labelStrong}>Location:</span> {job.location}</p>
        <p>
          <span style={styles.labelStrong}>Salary Range:</span>{' '}
          {job.salary
            ? `$${job.salary.min?.toLocaleString() || 'N/A'} - $${job.salary.max?.toLocaleString() || 'N/A'}`
            : 'N/A'}
        </p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3 style={styles.sectionTitle}>Description</h3>
        <p style={styles.description}>{job.description}</p>
      </div>

      {job.requirements?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={styles.sectionTitle}>Requirements</h3>
          <ul style={styles.list}>
            {job.requirements.map((r, idx) => (
              <li key={idx} style={styles.listItem}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {job.benefits?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={styles.sectionTitle}>Benefits</h3>
          <ul style={styles.list}>
            {job.benefits.map((b, idx) => (
              <li key={idx} style={styles.listItem}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {user && user.role === 'candidate' && !applied && (
        <div style={styles.applySection}>
          <h3 style={{ marginBottom: 15 }}>Apply for this job</h3>
          <label htmlFor="coverLetter" style={styles.label}>Cover Letter (optional):</label>
          <textarea
            id="coverLetter"
            placeholder="Explain why you're a good fit for this position..."
            rows={6}
            style={styles.textarea}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            onFocus={(e) => (e.target.style.borderColor = '#007bff')}
            onBlur={(e) => (e.target.style.borderColor = '#ccc')}
          />
          <button
            onClick={handleApply}
            disabled={isApplying}
            style={{
              ...styles.button,
              ...(isApplying ? styles.buttonDisabled : {}),
              marginTop: 15,
            }}
          >
            {isApplying ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      )}

      {applied && (
        <div style={styles.successMsg}>
          <p>✅ You have successfully applied to this job.</p>
        </div>
      )}
    </div>
  );
}
