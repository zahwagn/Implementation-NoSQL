import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: ''
  });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
        age: parseInt(form.age)
      });

      if (response.data.success) {
        const { token, user } = response.data.payload;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      console.error('Registration error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <input 
        type="text"
        placeholder="First Name"
        value={form.firstName}
        onChange={e => setForm({ ...form, firstName: e.target.value })}
        className="w-full p-2 border rounded"
        required
      />
      
      <input 
        type="text"
        placeholder="Last Name"
        value={form.lastName}
        onChange={e => setForm({ ...form, lastName: e.target.value })}
        className="w-full p-2 border rounded"
        required
      />
      
      <input 
        type="text"
        placeholder="Username"
        value={form.username}
        onChange={e => setForm({ ...form, username: e.target.value })}
        className="w-full p-2 border rounded"
        required
      />
      
      <input 
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        className="w-full p-2 border rounded"
        required
      />
      
      <input 
        type="number"
        placeholder="Age"
        value={form.age}
        onChange={e => setForm({ ...form, age: e.target.value })}
        className="w-full p-2 border rounded"
        required
        min="1"
        max="120"
      />
      
      <input 
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
        className="w-full p-2 border rounded"
        required
      />
      
      <input 
        type="password"
        placeholder="Confirm Password"
        value={form.confirmPassword}
        onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
        className="w-full p-2 border rounded"
        required
      />
      
      <button 
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Register
      </button>
    </form>
  );
}