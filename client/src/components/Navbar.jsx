import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-blue-700 text-white p-4 flex justify-between">
      <div className="font-bold">Media Tracker</div>
      <div className="space-x-4">
        <Link to="/books">Book</Link>
        <Link to="/films">Film</Link>
        <Link to="/billboard">Billboard</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Regist</Link>
      </div>
    </nav>
  );
}
