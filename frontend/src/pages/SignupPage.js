import React, { useState, useContext } from 'react';
import api from '../api';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';

export default function SignupPage() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');

  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/signup', { email, password, role });
      login(data.user, data.token);
      navigate(from, { replace: true });
    } catch (err) {
      alert(err.response?.data?.error || 'Signup failed');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 320 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        >
          <option value="candidate">Candidate</option>
          <option value="employer">Employer</option>
        </select>
        <button type="submit" style={{ padding: 10, width: '100%' }}>
          Signup
        </button>
      </form>
    </div>
  );
}