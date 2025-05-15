import { useState } from 'react';
import api from '../api';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const res = await api.post('/auth/register', form);
      alert('Registration successful');
      localStorage.setItem('token', res.data.payload.token);
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto space-y-4">
      <input 
        type="text" 
        placeholder="Full Name" 
        className="w-full p-2 border"
        onChange={e => setForm({ ...form, name: e.target.value })}
      />
      <input 
        type="email" 
        placeholder="Email" 
        className="w-full p-2 border"
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <input 
        type="password" 
        placeholder="Password" 
        className="w-full p-2 border"
        onChange={e => setForm({ ...form, password: e.target.value })}
      />
      <input 
        type="password" 
        placeholder="Confirm Password" 
        className="w-full p-2 border"
        onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
      />
      <button 
        type="submit" 
        className="w-full bg-blue-700 text-white p-2 hover:bg-blue-800"
      >
        Register
      </button>
    </form>
  );
}
