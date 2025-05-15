import { useEffect, useState } from 'react';
import api from '../api';

export default function MoviePage() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    api.get('/media/filter/movie')
      .then(res => setMovies(res.data.payload))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Movies</h2>
      {movies.map(movie => (
        <div key={movie._id} className="mb-3 p-4 border rounded">
          <h3 className="text-lg font-semibold">{movie.title}</h3>
          <p>Status: {movie.status}</p>
          <p>Rating: {movie.rating ?? 'N/A'}</p>
        </div>
      ))}
    </div>
  );
}
