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
        <nav style={{ padding: 10, borderBottom: '1px solid #ccc' }}>
          <Link to="/" style={{ marginRight: 10 }}>Jobs</Link>
          {user ? (
            <>
              {user.role === 'employer' && <Link to="/post-job" style={{ marginRight: 10 }}>Post Job</Link>}
              {user.role === 'candidate' && (
                <Link to="/profile" style={{ marginRight: 10 }}>My Profile</Link>
              )}
              <Link to="/applications" style={{ marginRight: 10 }}>Applications</Link>
              <button onClick={logout} style={{ cursor: 'pointer' }}>
                Logout ({user.email})
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: 10 }}>Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </nav>

        <Routes>
          <Route path="/" element={<JobListPage />} />

          <Route path="/job/:id" element={<JobDetailsPage />} />

          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />

          <Route path="/signup" element={user ? <Navigate to="/" /> : <SignupPage />} />

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