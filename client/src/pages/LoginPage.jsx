import { useState } from 'react';
import api from '../api';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      alert('Login success');
      localStorage.setItem('token', res.data.payload.token);
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto space-y-4">
      <input type="email" placeholder="Email" className="w-full p-2 border" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" className="w-full p-2 border" onChange={e => setForm({ ...form, password: e.target.value })} />
      <button type="submit" className="w-full bg-blue-700 text-white p-2">Login</button>
    </form>
  );
}
