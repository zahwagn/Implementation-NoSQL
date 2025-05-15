import { useEffect, useState } from 'react';
import api from '../api';

export default function BookPage() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    api.get('/media/filter/book')
      .then(res => setBooks(res.data.payload))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Books</h2>
      {books.map(book => (
        <div key={book._id} className="mb-3 p-4 border rounded">
          <h3 className="text-lg font-semibold">{book.title}</h3>
          <p>Status: {book.status}</p>
          <p>Rating: {book.rating ?? 'N/A'}</p>
        </div>
      ))}
    </div>
  );
}
