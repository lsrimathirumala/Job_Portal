import React, { useState, useContext } from 'react';
import api from '../api';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';

export default function LoginPage() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user, data.token);
      navigate(from, { replace: true });
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
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
        <button type="submit" style={{ padding: 10, width: '100%' }}>
          Login
        </button>
      </form>
    </div>
  );
}