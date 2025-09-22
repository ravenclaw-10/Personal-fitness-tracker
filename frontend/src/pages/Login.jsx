import React, { useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('admin@pft.local');
  const [password, setPassword] = useState('password');
  const { login } = useContext(AuthContext);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      login(data.token, data.user);
    } catch (err) {
      alert('login failed');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" /></div>
        <div><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" /></div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
