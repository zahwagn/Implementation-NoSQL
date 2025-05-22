import { useState } from 'react';
import api from '../api'; // axios instance dengan baseURL
import { useAuth } from '../App'; // kalau perlu akses user

export default function AddBookPage() {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !author) {
      setMessage('Title and Author are required.');
      return;
    }

    try {
      const response = await api.post('/books', {
        title,
        author,
        year,
        userId: currentUser.id,
      });
      if (response.data.success) {
        setMessage('Book added successfully!');
        setTitle('');
        setAuthor('');
        setYear('');
      } else {
        setMessage('Failed to add book.');
      }
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Book</h2>
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
          Author:
          <input
            type="text"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </label>
        <label className="block mb-4">
          Year:
          <input
            type="number"
            value={year}
            onChange={e => setYear(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </label>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Book
        </button>
      </form>
    </div>
  );
}
