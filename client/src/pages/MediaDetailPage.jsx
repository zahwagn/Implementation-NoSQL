import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function MediaDetailPage() {
  const { id } = useParams();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const response = await api.get(`/media/${id}`);
        if (response.data.success) {
          setMedia(response.data.data);
        } else {
          setMedia(null);
        }
      } catch (err) {
        setMedia(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!media) return <p>Media not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-4">{media.title}</h1>
      <p><strong>Author/Director:</strong> {media.author || media.director}</p>
      <p><strong>Year:</strong> {media.year}</p>
      <p><strong>Description:</strong> {media.description || 'No description available.'}</p>
      {/* Tambah detail lain sesuai kebutuhan */}
    </div>
  );
}
