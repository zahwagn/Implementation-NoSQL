import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate,
  useParams  // Tambahkan ini
} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Base URL for API
axios.defaults.baseURL = 'http://localhost:3000';
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add new component ProtectedRoute
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      jwtDecode(token);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : null;
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/media" element={<MediaList />} />
            <Route path="/movies" element={<MediaList type="movie" />} />
            <Route path="/books" element={<MediaList type="book" />} />
            
            {/* Protected Routes */}
            <Route path="/media/create" element={
              <ProtectedRoute>
                <CreateMedia />
              </ProtectedRoute>
            } />
            <Route path="/media/:id/edit" element={
              <ProtectedRoute>
                <EditMedia />
              </ProtectedRoute>
            } />
            <Route path="/tickets" element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            } />
            
            <Route path="/media/:id" element={<MediaDetail />} />
            <Route path="/billboard" element={<Billboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Media Tracker</Link>
        <div className="flex space-x-4">
          {user ? (
            <>
              {/* These links match the media type enum in the schema */}
              <Link 
                to="/movies" 
                className="hover:underline"
              >
                Movies
              </Link>
              <Link 
                to="/books" 
                className="hover:underline"
              >
                Books
              </Link>
              <Link 
                to="/billboard" 
                className="hover:underline"
              >
                Billboard
              </Link>
              <Link 
                to="/tickets" 
                className="hover:underline"
              >
                My Tickets
              </Link>
              <button 
                onClick={handleLogout} 
                className="hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="hover:underline">Register</Link>
              <Link to="/login" className="hover:underline">Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const Home = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const [moviesRes, booksRes] = await Promise.all([
          axios.get('/media/filter/movie?limit=3&sort=rating'),
          axios.get('/media/filter/book?limit=3&sort=rating')
        ]);
        setFeaturedMovies(moviesRes.data.payload);
        setFeaturedBooks(booksRes.data.payload);
      } catch (error) {
        console.error('Error fetching featured items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-64 rounded-lg"></div>
            <div className="bg-gray-200 h-64 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Media Tracker</h1>
      <p className="text-xl mb-8">Track your favorite movies and books in one place</p>

      {/* Featured Movies Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Featured Movies</h2>
          <button 
            onClick={() => navigate('/media?type=movie')}
            className="text-blue-600 hover:text-blue-800"
          >
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredMovies.map(movie => (
            <div 
              key={movie._id} 
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:scale-105 transition-transform"
              onClick={() => navigate(`/media/${movie._id}`)}
            >
              {movie.imageUrl && (
                <img
                  src={`http://localhost:3000${movie.imageUrl}`}
                  alt={movie.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold mb-2">{movie.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {movie.duration} mins
                  </span>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span>{movie.rating || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Books Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Featured Books</h2>
          <button 
            onClick={() => navigate('/media?type=book')}
            className="text-blue-600 hover:text-blue-800"
          >
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredBooks.map(book => (
            <div 
              key={book._id} 
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:scale-105 transition-transform"
              onClick={() => navigate(`/media/${book._id}`)}
            >
              {book.imageUrl && (
                <img
                  src={`http://localhost:3000${book.imageUrl}`}
                  alt={book.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold mb-2">{book.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {book.pageCount} pages
                  </span>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span>{book.rating || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    age: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/register', formData);
      localStorage.setItem('token', response.data.payload.token);
      navigate('/media');
    } catch (error) {
      if (error.response && error.response.data.payload.errors) {
        setErrors(error.response.data.payload.errors);
      } else {
        setErrors([error.response?.data.message || 'Registration failed']);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            min="3"
            max="120"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            minLength="8"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          Register
        </button>
      </form>
      <p className="mt-4 text-center">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
      </p>
    </div>
  );
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/login', formData);
      localStorage.setItem('token', response.data.payload.token);
      navigate('/media');
    } catch (error) {
      setError(error.response?.data.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          Login
        </button>
      </form>
      <p className="mt-4 text-center">
        Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register here</Link>
      </p>
    </div>
  );
};

const MediaList = ({ type }) => {
  const [user, setUser] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: type, // Add type to filters
    minRating: '',
    availableAtVenue: false,
    status: '',
    search: '',
    sortBy: ''
  });

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        // Use the filter endpoint instead of the general media endpoint
        const response = await axios.get(`/media/filter/${type}`, { 
          params: {
            minRating: filters.minRating,
            availableAtVenue: filters.availableAtVenue,
            status: filters.status,
            search: filters.search,
            sortBy: filters.sortBy
          }
        });
        setMedia(response.data.payload);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data.message || 'Failed to fetch media');
        setLoading(false);
      }
    };

    // Only fetch if type is specified
    if (type) {
      fetchMedia();
    }
  }, [filters, type]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, []);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {type === 'movie' ? 'Movies' : 'Books'} Library
        </h2>
        {user && (
          <Link 
            to={`/media/create?type=${type}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add New {type === 'movie' ? 'Movie' : 'Book'}
          </Link>
        )}
      </div>

      {/* Filters section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded"
              placeholder={`Search ${type === 'movie' ? 'movies' : 'books'}...`}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Min Rating</label>
            <select
              name="minRating"
              value={filters.minRating}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">All</option>
              <option value="plan">
                Plan to {type === 'movie' ? 'Watch' : 'Read'}
              </option>
              <option value={type === 'movie' ? 'watched' : 'read'}>
                {type === 'movie' ? 'Watched' : 'Read'}
              </option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="availableAtVenue"
              name="availableAtVenue"
              checked={filters.availableAtVenue}
              onChange={handleFilterChange}
              className="mr-2"
            />
            <label htmlFor="availableAtVenue">Available at Venue</label>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Sort By</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Default</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rating</option>
              <option value="tickets">Most Tickets</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {item.imageUrl && (
              <img 
                src={`http://localhost:3000${item.imageUrl}`} 
                alt={item.title} 
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              {/* Show duration for movies, page count for books */}
              {type === 'movie' ? (
                <p className="text-sm text-gray-600 mb-2">
                  {item.duration} minutes
                </p>
              ) : (
                <p className="text-sm text-gray-600 mb-2">
                  {item.pageCount} pages
                </p>
              )}
              <div className="flex justify-between mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {type === 'movie' ? 'Movie' : 'Book'}
                </span>
                {item.rating && (
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span>{item.rating}/5</span>
                  </div>
                )}
              </div>
              <Link 
                to={`/media/${item._id}`} 
                className="text-blue-600 hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CreateMedia = () => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'movie',
    status: 'plan',
    ageCategory: 'all',
    rating: '',
    review: '',
    duration: '',
    pageCount: '',
    genres: '',
    releaseDate: ''
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('ageCategory', formData.ageCategory);
      formDataToSend.append('genres', formData.genres);
      
      if (formData.rating) formDataToSend.append('rating', formData.rating);
      if (formData.review) formDataToSend.append('review', formData.review);
      if (formData.duration) formDataToSend.append('duration', formData.duration);
      if (formData.pageCount) formDataToSend.append('pageCount', formData.pageCount);
      if (formData.releaseDate) formDataToSend.append('releaseDate', formData.releaseDate);
      if (image) formDataToSend.append('image', image);

      const response = await axios.post('/media', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate(`/media/${response.data.payload._id}`);
    } catch (error) {
      setError(error.response?.data.message || 'Failed to create media');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Media</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-1">Title*</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Type*</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="movie">Movie</option>
              <option value="book">Book</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Status*</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="plan">Plan to Watch/Read</option>
              <option value="watched">Watched</option>
              <option value="read">Read</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Age Category*</label>
            <select
              name="ageCategory"
              value={formData.ageCategory}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="all">All Ages</option>
              <option value="kids">Kids</option>
              <option value="teen">Teen</option>
              <option value="adult">Adult</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Genres*</label>
            <select
              name="genres"
              value={formData.genres}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="comedy">Comedy</option>
              <option value="romance">Romance</option>
              <option value="action">Action</option>
              <option value="adult">Adult</option>
              <option value="horror">Horror</option>
              <option value="drama">Drama</option>
              <option value="thriller">Thriller</option>
              <option value="documentary">Documentary</option>
              <option value="fantasy">Fantasy</option>
              <option value="mystery">Mystery</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Rating</label>
            <select
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Not rated</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </div>
          {formData.type === 'movie' && (
            <div>
              <label className="block text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                min="1"
              />
            </div>
          )}
          {formData.type === 'book' && (
            <div>
              <label className="block text-gray-700 mb-1">Page Count</label>
              <input
                type="number"
                name="pageCount"
                value={formData.pageCount}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                min="1"
              />
            </div>
          )}
          <div>
            <label className="block text-gray-700 mb-1">Release Date</label>
            <input
              type="date"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Review</label>
          <textarea
            name="review"
            value={formData.review}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            rows="3"
          ></textarea>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Image*</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border rounded"
            accept="image/*"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/media')}
            className="mr-4 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Media
          </button>
        </div>
      </form>
    </div>
  );
};

const MediaDetail = () => {
  const { id } = useParams(); // Gunakan useParams
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [venueFormData, setVenueFormData] = useState({
    name: '',
    type: 'cinema',
    location: '',
    price: '',
    capacity: '',
    availableSeats: '',
    bookStock: ''
  });
  const [ticketFormData, setTicketFormData] = useState({
    venueId: '',
    quantity: 1
  });
  const [showTicketForm, setShowTicketForm] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await axios.get(`/media/${id}`);
        setMedia(response.data.payload);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data.message || 'Failed to fetch media');
        setLoading(false);
      }
    };

    fetchMedia();
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, []);

  const handleVenueFormChange = (e) => {
    const { name, value } = e.target;
    setVenueFormData({
      ...venueFormData,
      [name]: value
    });
  };

  const handleAddVenue = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await axios.post(`/media/${id}/venues`, venueFormData);
      setMedia(response.data.payload.media);
      setShowVenueForm(false);
      setVenueFormData({
        name: '',
        type: 'cinema',
        location: '',
        price: '',
        capacity: '',
        availableSeats: '',
        bookStock: ''
      });
    } catch (error) {
      setError(error.response?.data.message || 'Failed to add venue');
    }
  };

  const handleTicketFormChange = (e) => {
    const { name, value } = e.target;
    setTicketFormData({
      ...ticketFormData,
      [name]: value
    });
  };

  const handlePurchaseTicket = async (e) => {
    e.preventDefault();
    try {
      // Update endpoint sesuai dengan backend
      await axios.post('/media/purchase/ticket', {
        mediaId: id,
        venueId: ticketFormData.venueId,
        quantity: parseInt(ticketFormData.quantity)
      });
      navigate('/tickets');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to purchase ticket');
    }
  };

  const handleDelete = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      await axios.delete(`/media/${id}`);
      navigate('/media');
    } catch (error) {
      setError(error.response?.data.message || 'Failed to delete media');
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!media) return <div className="text-center">Media not found</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">{media.title}</h2>
          <div className="flex items-center space-x-4 mt-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {media.type}
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              {media.ageCategory}
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
              {media.status}
            </span>
          </div>
        </div>
        {user && ( // Only show if user is logged in
          <div className="flex space-x-2">
            <Link
              to={`/media/${id}/edit`}
              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          {media.imageUrl && (
            <img
              src={`http://localhost:3000${media.imageUrl}`}
              alt={media.title}
              className="w-full rounded-lg shadow"
            />
          )}
          {media.rating && (
            <div className="mt-4 flex items-center">
              <span className="text-yellow-500 text-2xl mr-2">★</span>
              <span className="text-xl font-semibold">{media.rating}/5</span>
            </div>
          )}
          <div className="mt-4">
            <h3 className="font-semibold">Details</h3>
            <ul className="mt-2 space-y-1">
              {media.type === 'movie' && media.duration && (
                <li>Duration: {media.duration} minutes</li>
              )}
              {media.type === 'book' && media.pageCount && (
                <li>Pages: {media.pageCount}</li>
              )}
              {media.genres && (
                <li>Genres: {media.genres}</li>
              )}
              {media.releaseDate && (
                <li>Release Date: {new Date(media.releaseDate).toLocaleDateString()}</li>
              )}
              <li>Created: {new Date(media.createdAt).toLocaleDateString()}</li>
              <li>Updated: {new Date(media.updatedAt).toLocaleDateString()}</li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2">
          {media.review && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Review</h3>
              <p className="text-gray-700">{media.review}</p>
            </div>
          )}

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Venues</h3>
              {user && ( // Only show if user is logged in
                <button
                  onClick={() => setShowVenueForm(!showVenueForm)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  {showVenueForm ? 'Cancel' : 'Add Venue'}
                </button>
              )}
            </div>

            {showVenueForm && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-3">Add New Venue</h4>
                <form onSubmit={handleAddVenue}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 mb-1">Name*</label>
                      <input
                        type="text"
                        name="name"
                        value={venueFormData.name}
                        onChange={handleVenueFormChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Type*</label>
                      <select
                        name="type"
                        value={venueFormData.type}
                        onChange={handleVenueFormChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                      >
                        <option value="cinema">Cinema</option>
                        <option value="bookstore">Bookstore</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Location*</label>
                      <input
                        type="text"
                        name="location"
                        value={venueFormData.location}
                        onChange={handleVenueFormChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Price*</label>
                      <input
                        type="number"
                        name="price"
                        value={venueFormData.price}
                        onChange={handleVenueFormChange}
                        className="w-full px-3 py-2 border rounded"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    {venueFormData.type === 'cinema' && (
                      <>
                        <div>
                          <label className="block text-gray-700 mb-1">Capacity*</label>
                          <input
                            type="number"
                            name="capacity"
                            value={venueFormData.capacity}
                            onChange={handleVenueFormChange}
                            className="w-full px-3 py-2 border rounded"
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1">Available Seats*</label>
                          <input
                            type="number"
                            name="availableSeats"
                            value={venueFormData.availableSeats}
                            onChange={handleVenueFormChange}
                            className="w-full px-3 py-2 border rounded"
                            min="0"
                            max={venueFormData.capacity || ''}
                            required
                          />
                        </div>
                      </>
                    )}
                    {venueFormData.type === 'bookstore' && (
                      <div>
                        <label className="block text-gray-700 mb-1">Book Stock*</label>
                        <input
                          type="number"
                          name="bookStock"
                          value={venueFormData.bookStock}
                          onChange={handleVenueFormChange}
                          className="w-full px-3 py-2 border rounded"
                          min="0"
                          required
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Add Venue
                    </button>
                  </div>
                </form>
              </div>
            )}

            {media.venues && media.venues.length > 0 ? (
              <div className="space-y-3">
                {media.venues.map((venue) => (
                  <div key={venue._id} className="border p-3 rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">{venue.name}</h4>
                        <p className="text-sm text-gray-600">{venue.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${venue.price.toFixed(2)}</p>
                        {venue.type === 'cinema' ? (
                          <p className="text-sm text-gray-600">
                            {venue.availableSeats}/{venue.capacity} seats available
                          </p>
                        ) : (
                          <p className="text-sm text-gray-600">
                            {venue.bookStock} in stock
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowTicketForm(true);
                        setTicketFormData({
                          venueId: venue._id,
                          quantity: 1
                        });
                      }}
                      className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Purchase
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No venues available for this media.</p>
            )}
          </div>

          {showTicketForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Purchase Ticket</h4>
                <button
                  onClick={() => setShowTicketForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handlePurchaseTicket}>
                <div className="mb-3">
                  <label className="block text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={ticketFormData.quantity}
                    onChange={handleTicketFormChange}
                    className="w-full px-3 py-2 border rounded"
                    min="1"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Confirm Purchase
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EditMedia = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    type: 'movie',
    status: 'plan',
    ageCategory: 'all',
    rating: '',
    review: '',
    duration: '',
    pageCount: '',
    genres: '',
    releaseDate: ''
  });
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await axios.get(`/media/${id}`);
        const media = response.data.payload;
        setFormData({
          title: media.title,
          type: media.type,
          status: media.status,
          ageCategory: media.ageCategory,
          rating: media.rating || '',
          review: media.review || '',
          duration: media.duration || '',
          pageCount: media.pageCount || '',
          genres: media.genres || '',
          releaseDate: media.releaseDate ? new Date(media.releaseDate).toISOString().split('T')[0] : ''
        });
        setCurrentImage(media.imageUrl);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data.message || 'Failed to fetch media');
        setLoading(false);
      }
    };

    fetchMedia();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('ageCategory', formData.ageCategory);
      formDataToSend.append('genres', formData.genres);
      
      if (formData.rating) formDataToSend.append('rating', formData.rating);
      if (formData.review) formDataToSend.append('review', formData.review);
      if (formData.duration) formDataToSend.append('duration', formData.duration);
      if (formData.pageCount) formDataToSend.append('pageCount', formData.pageCount);
      if (formData.releaseDate) formDataToSend.append('releaseDate', formData.releaseDate);
      if (image) formDataToSend.append('image', image);

      await axios.put(`/media/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate(`/media/${id}`);
    } catch (error) {
      setError(error.response?.data.message || 'Failed to update media');
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Edit Media</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-1">Title*</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Type*</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="movie">Movie</option>
              <option value="book">Book</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Status*</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="plan">Plan to Watch/Read</option>
              <option value="watched">Watched</option>
              <option value="read">Read</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Age Category*</label>
            <select
              name="ageCategory"
              value={formData.ageCategory}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="all">All Ages</option>
              <option value="kids">Kids</option>
              <option value="teen">Teen</option>
              <option value="adult">Adult</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Genres*</label>
            <select
              name="genres"
              value={formData.genres}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="comedy">Comedy</option>
              <option value="romance">Romance</option>
              <option value="action">Action</option>
              <option value="adult">Adult</option>
              <option value="horror">Horror</option>
              <option value="drama">Drama</option>
              <option value="thriller">Thriller</option>
              <option value="documentary">Documentary</option>
              <option value="fantasy">Fantasy</option>
              <option value="mystery">Mystery</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Rating</label>
            <select
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Not rated</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </div>
          {formData.type === 'movie' && (
            <div>
              <label className="block text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                min="1"
              />
            </div>
          )}
          {formData.type === 'book' && (
            <div>
              <label className="block text-gray-700 mb-1">Page Count</label>
              <input
                type="number"
                name="pageCount"
                value={formData.pageCount}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                min="1"
              />
            </div>
          )}
          <div>
            <label className="block text-gray-700 mb-1">Release Date</label>
            <input
              type="date"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Review</label>
          <textarea
            name="review"
            value={formData.review}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            rows="3"
          ></textarea>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Current Image</label>
          {currentImage && (
            <img
              src={`http://localhost:3000${currentImage}`}
              alt="Current"
              className="w-32 h-32 object-cover mb-2"
            />
          )}
          <label className="block text-gray-700 mb-1">New Image (optional)</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border rounded"
            accept="image/*"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(`/media/${id}`)}
            className="mr-4 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

const Billboard = () => {
  const [movieBillboard, setMovieBillboard] = useState([]);
  const [bookBillboard, setBookBillboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('movies');
  const [searchParams, setSearchParams] = useState({
    week: '',
    year: ''
  });  useEffect(() => {
    const fetchBillboards = async () => {
      try {
        setLoading(true);
        setError('');
        
        // First try the specific endpoints with a timeout to prevent hanging
        const fetchWithTimeout = (url, options = {}) => {
          const timeout = options.timeout || 8000; // Increased timeout to 8 seconds
          return Promise.race([
            axios.get(url),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Request to ${url} timed out`)), timeout)
            )
          ]);
        };

        try {
          // Use individual try/catch for each request to prevent one failure from affecting the other
          let moviesData = [];
          let booksData = [];
          
          try {
            const moviesResponse = await fetchWithTimeout('/media/billboard/movies');
            if (moviesResponse.data && moviesResponse.data.payload) {
              moviesData = moviesResponse.data.payload;
            }
          } catch (movieError) {
            console.error("Failed to fetch movie billboard:", movieError);
          }
          
          try {
            const booksResponse = await fetchWithTimeout('/media/billboard/books');
            if (booksResponse.data && booksResponse.data.payload) {
              booksData = booksResponse.data.payload;
            }
          } catch (bookError) {
            console.error("Failed to fetch book billboard:", bookError);
          }
          
          // Update state with whatever data we got
          if (moviesData.length > 0) {
            setMovieBillboard(moviesData);
          }
          
          if (booksData.length > 0) {
            setBookBillboard(booksData);
          }
          
          // If both requests failed, try the fallback
          if (moviesData.length === 0 && booksData.length === 0) {
            throw new Error("Both movie and book billboard requests failed");
          }
          
          setLoading(false);
        } catch (specificError) {
          console.error("Failed with specific endpoints, trying fallback to general billboard:", specificError);
          
          // Fallback to the main billboard endpoint if specific ones fail
          try {
            const response = await fetchWithTimeout('/media/billboard/current');
            if (response.data && response.data.payload) {
              const allBillboards = response.data.payload;
              
              // Separate movies and books
              const movies = allBillboards.filter(item => item.media && item.media.type === 'movie');
              const books = allBillboards.filter(item => item.media && item.media.type === 'book');
              
              setMovieBillboard(movies);
              setBookBillboard(books);
            }
          } catch (fallbackError) {
            console.error("Fallback request also failed:", fallbackError);
            setError("Failed to load billboard data. Please refresh the page and try again.");
          } finally {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("All billboard fetch attempts failed:", error);
        setError(error.response?.data?.message || 'Failed to fetch billboard data. Please try again.');
        setLoading(false);
      }
    };

    fetchBillboards();
  }, []);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value
    });
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    try {
      const mediaType = activeTab === 'movies' ? 'movie' : 'book';
      
      setLoading(true);
      const response = await axios.get('/media/billboard/search', {
        params: {
          week: searchParams.week,
          year: searchParams.year,
          mediaType: mediaType
        }
      });
      
      const results = response.data.payload;
      
      if (activeTab === 'movies') {
        setMovieBillboard(results.filter(item => item.media.type === 'movie'));
      } else {
        setBookBillboard(results.filter(item => item.media.type === 'book'));
      }
      setLoading(false);
    } catch (error) {
      console.error("Search failed:", error);
      setError(error.response?.data?.message || 'Failed to search billboard');
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Billboard</h2>
        <form onSubmit={handleSearchSubmit} className="flex space-x-2">
          <input
            type="number"
            name="week"
            value={searchParams.week}
            onChange={handleSearchChange}
            placeholder="Week (1-52)"
            className="px-3 py-2 border rounded w-24"
            min="1"
            max="52"
          />
          <input
            type="number"
            name="year"
            value={searchParams.year}
            onChange={handleSearchChange}
            placeholder="Year"
            className="px-3 py-2 border rounded w-24"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('movies')}
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'movies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`ml-8 py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'books'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Books
            </button>
          </nav>
        </div>
      </div>

      {/* Movies Tab */}
      {activeTab === 'movies' && (
        <>
          {movieBillboard.length === 0 ? (
            <div className="text-center text-gray-500">No movie billboard data available</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {movieBillboard.map((item) => (
                <div key={item.media._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative">
                    {item.media.imageUrl && (
                      <img
                        src={`http://localhost:3000${item.media.imageUrl}`}
                        alt={item.media.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white font-bold px-3 py-1 rounded-full">
                      #{item.rank}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{item.media.title}</h3>
                    <div className="flex justify-between mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Movie
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {item.totalTickets} tickets
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="font-semibold">
                        ${item.totalRevenue?.toFixed(2) || '0.00'}
                      </span>
                      <Link
                        to={`/media/${item.media._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Books Tab */}
      {activeTab === 'books' && (
        <>
          {bookBillboard.length === 0 ? (
            <div className="text-center text-gray-500">No book billboard data available</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookBillboard.map((item) => (
                <div key={item.media._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative">
                    {item.media.imageUrl && (
                      <img
                        src={`http://localhost:3000${item.media.imageUrl}`}
                        alt={item.media.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white font-bold px-3 py-1 rounded-full">
                      #{item.rank}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{item.media.title}</h3>
                    <div className="flex justify-between mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Book
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        Popularity: {item.popularity}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="font-semibold">
                        Week {item.week}, {item.year}
                      </span>
                      <Link
                        to={`/media/${item.media._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Update endpoint sesuai dengan backend
        const response = await axios.get('/media/user/tickets');
        setTickets(response.data.payload);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setError(error.response?.data?.message || 'Failed to fetch tickets');
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Tickets</h2>
      
      {tickets.length === 0 ? (
        <div className="text-center text-gray-500">You haven't purchased any tickets yet</div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{ticket.media.title}</h3>
                  <p className="text-gray-600">{ticket.venue.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${ticket.totalPrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">
                    {ticket.quantity} {ticket.quantity > 1 ? 'tickets' : 'ticket'}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Purchased on {new Date(ticket.purchaseDate).toLocaleDateString()}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  ticket.status === 'completed' ? 'bg-green-100 text-green-800' :
                  ticket.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {ticket.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;