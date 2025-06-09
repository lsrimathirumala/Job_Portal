import React, { useContext, useEffect, useState, useCallback } from 'react';
import api from '../api';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';

export default function ApplicationListPage() {
  const { user } = useContext(AuthContext);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    const colors = {
      'Applied': '#3b82f6',
      'Under Review': '#f59e0b',
      'Interview': '#8b5cf6',
      'Hired': '#10b981',
      'Rejected': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setWarning(null);
      
      let response;
      
      if (user.role === 'candidate') {
        response = await api.get('/applications/my-applications');
      } else {
        response = await api.get('/applications/employer');
        
        if (response.data?.message === "No jobs posted") {
          setWarning('You have no active job postings.');
          setFilteredApplications([]);
          return;
        }
      }
      
      // Validate and filter the received data
      const validatedApplications = (response.data || []).filter(app => {
        if (!app?._id) return false;
        if (user.role === 'employer' && (!app.jobId || !app.candidateId)) return false;
        if (user.role === 'candidate' && !app.jobId) return false;
        return true;
      });

      if (validatedApplications.length < (response.data?.length || 0)) {
        setWarning('Some applications could not be displayed due to data issues.');
      }

      setFilteredApplications(validatedApplications);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      
      let errorMessage = 'Failed to load applications. Please try again.';
      
      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = err.response.data?.error || 'Invalid request data';
            break;
          case 401:
            navigate('/login');
            return;
          case 403:
            errorMessage = 'You are not authorized to view these applications';
            break;
          case 404:
            errorMessage = 'No applications found';
            break;
          default:
            errorMessage = err.response.data?.error || errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user.role, navigate]);

  const renderApplicationDetails = (application) => {
    const jobTitle = application.jobId?.title || 'Position no longer available';
    const companyName = application.jobId?.company?.name || 'Company not specified';
    const candidateName = application.candidateId?.fullName || 'Applicant no longer available';
    const location = application.jobId?.location || 'Location not specified';
    const appliedDate = application.appliedAt 
      ? new Date(application.appliedAt).toLocaleDateString() 
      : 'Date not available';

    return (
      <div 
        key={application._id}
        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition cursor-pointer"
        onClick={() => navigate(`/applications/${application._id}`)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{jobTitle}</h3>
            <p className="text-gray-600 mt-1">
              {user.role === 'employer' 
                ? `Applicant: ${candidateName}` 
                : `Company: ${companyName}`}
            </p>
          </div>
          <span 
            className="px-3 py-1 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: getStatusColor(application.status) }}
          >
            {application.status || 'Status unknown'}
          </span>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Applied On</p>
            <p>{appliedDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p>{location}</p>
          </div>
        </div>
        
        {user.role === 'employer' && application.coverLetter && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Cover Letter Excerpt</p>
            <p className="text-gray-700 line-clamp-2">
              {application.coverLetter.substring(0, 100)}...
            </p>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">
        {user.role === 'employer' ? 'Job Applications Received' : 'Your Applications'}
      </h2>
      
      {warning && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {warning}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading applications...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={fetchApplications}
            className="ml-2 text-red-800 font-medium hover:underline"
          >
            Retry
          </button>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">
            {user.role === 'employer' 
              ? 'No applications received yet' 
              : 'You haven\'t applied to any jobs yet'}
          </p>
          <button 
            onClick={() => navigate(user.role === 'candidate' ? '/jobs' : '/post-job')}
            className={`${
              user.role === 'candidate' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
            } text-white font-medium py-2 px-6 rounded-md transition`}
          >
            {user.role === 'candidate' ? 'Browse Jobs' : 'Post a New Job'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(renderApplicationDetails)}
        </div>
      )}
    </div>
  );
}