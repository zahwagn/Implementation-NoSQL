import { useEffect, useState } from 'react';
import api from '../api';

export default function BillboardPage() {
  const [billboards, setBillboards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/media/billboard/current')
      .then(res => {
        console.log('Billboard data:', res.data.payload);
        setBillboards(res.data.payload);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading billboards:', err);
        setLoading(false);
      });
  }, []);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/300x200?text=No+Image';
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // Remove any leading '/' from the imageUrl and ensure it starts with 'uploads/'
    const cleanImageUrl = imageUrl.replace(/^\/+/, '').replace(/^uploads\//, '');
    
    // Construct the full URL to the image
    return `http://localhost:3000/uploads/${cleanImageUrl}`;
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Top Billboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {billboards.map((item, i) => (
          <div key={i} className="border rounded-lg overflow-hidden shadow-lg">
            <div className="relative h-48">
              <img 
                src={getImageUrl(item.media.imageUrl)}
                alt={item.media.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image load error for:', item.media.imageUrl);
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{item.media.title}</h3>
              <p className="text-gray-600">Total Tickets: {item.totalTickets}</p>
              <p className="text-gray-600">Rank: {item.rank}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}