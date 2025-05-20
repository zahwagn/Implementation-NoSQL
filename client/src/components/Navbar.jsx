import { Link } from 'react-router-dom';

export default function Navbar({ isAuthenticated, setIsAuthenticated }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <nav className="bg-blue-700 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-xl hover:text-blue-200">
          Media Tracker
        </Link>
        <div className="space-x-4">
          <Link to="/books" className="hover:text-blue-200">Books</Link>
          <Link to="/films" className="hover:text-blue-200">Films</Link>
          <Link to="/billboard" className="hover:text-blue-200">Billboard</Link>
          {isAuthenticated ? (
            <button 
              onClick={handleLogout}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">Login</Link>
              <Link to="/register" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
