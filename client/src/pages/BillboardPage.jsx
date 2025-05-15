import { useEffect, useState } from 'react';
import api from '../api';

export default function BillboardPage() {
  const [billboards, setBillboards] = useState([]);

  useEffect(() => {
    api.get('/media/billboard/current')
      .then(res => setBillboards(res.data.payload))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Top Billboard</h2>
      {billboards.map((item, i) => (
        <div key={i} className="mb-3 border p-3 rounded">
          <h3 className="text-lg font-semibold">{item.media.title}</h3>
          <p>Views: {item.viewCount}</p>
          <p>Rank: {item.rank}</p>
        </div>
      ))}
    </div>
  );
}
