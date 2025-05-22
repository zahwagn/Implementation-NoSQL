import { useState } from 'react';
import api from '../api';
import { useAuth } from '../App';

export default function AddFilmPage() {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [director, setDirector] = useState('');
  const [year, setYear] = useState('');
  const [genre, setGenre] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !director) {
      setMessage('Title and Director are required.');
      return;
    }

    try {
      const response = await api.post('/films', {
        title,
        director,
        year,
        genre,
        userId: currentUser.id,
      });

      if (response.data.success) {
        setMessage('Film added successfully!');
        setTitle('');
        setDirector('');
        setYear('');
        setGenre('');
      } else {
        setMessage('Failed to add film.');
      }
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Film</h2>
      {message && <p className="mb-4 text-red-600">{message}</p>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          Title:
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </label>
        <label className="block mb-2">
          Director:
          <input
            type="text"
            value={director}
            onChange={e => setDirector(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </label>
        <label className="block mb-2">
          Year:
          <input
            type="number"
            value={year}
            onChange={e => setYear(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-4">
          Genre:
          <input
            type="text"
            value={genre}
            onChange={e => setGenre(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </label>
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Add Film
        </button>
      </form>
    </div>
  );
}
