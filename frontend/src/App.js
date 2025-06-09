import React, { useState, useEffect, createContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import JobListPage from './pages/JobListPage';
import JobDetailsPage from './pages/JobDetailsPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import PostJobPage from './pages/PostJobPage';
import ApplicationListPage from './pages/ApplicationListPage';
import LandingPage from './pages/LandingPage';

export const AuthContext = createContext();

function PrivateRoute({ children, roles }) {
  const { user } = React.useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(() => {
    const json = localStorage.getItem('user');
    return json ? JSON.parse(json) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        {/* Navigation bar - always visible */}
        <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">JobPortal</Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'employer' && (
                  <Link to="/post-job" className="hover:text-blue-600">Post Job</Link>
                )}
                {user.role === 'candidate' && (
                  <Link to="/profile" className="hover:text-blue-600">My Profile</Link>
                )}
                <Link to="/jobs" className="hover:text-blue-600">Jobs</Link>
                <Link to="/applications" className="hover:text-blue-600">Applications</Link>
                <button 
                  onClick={logout} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Logout ({user.email})
                </button>
              </>
            ) : (
              <>
                <Link to="/jobs" className="hover:text-blue-600">Browse Jobs</Link>
                <Link to="/login" className="hover:text-blue-600">Login</Link>
                <Link 
                  to="/signup" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/job/:id" element={<JobDetailsPage />} />
          <Route path="/login" element={user ? <Navigate to="/jobs" /> : <LoginPage />} />
          <Route path="/signup" element={user ? <Navigate to="/jobs" /> : <SignupPage />} />

          <Route
            path="/profile"
            element={
              <PrivateRoute roles={['candidate']}>
                <CandidateProfilePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/post-job"
            element={
              <PrivateRoute roles={['employer']}>
                <PostJobPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/applications"
            element={
              <PrivateRoute>
                <ApplicationListPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;