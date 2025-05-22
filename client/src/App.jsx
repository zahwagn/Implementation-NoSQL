import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import BookPage from './pages/BookPage';
import FilmPage from './pages/FilmPage';
import BillboardPage from './pages/BillboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AddBookPage from './pages/AddBookPage';
import AddFilmPage from './pages/AddFilmPage';
import MediaDetailPage from './pages/MediaDetailPage';

// Base API URL
axios.defaults.baseURL = 'http://localhost:5000/api';

// Auth Context
const AuthContext = createContext();

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setCurrentUser(JSON.parse(userData));
      // Set up axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return { success: true };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return { success: true };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!currentUser,
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
const useAuth = () => useContext(AuthContext);

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Background with pattern overlay */}
        <div className="relative min-h-screen">
          {/* Animated gradient background */}
          <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 animate-gradient-slow">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10" 
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
                }}
            ></div>
          </div>

          {/* Content */}
          <div className="relative flex flex-col min-h-screen backdrop-blur-[2px]">
            {/* Navbar */}
            <div className="sticky top-0 z-50 backdrop-blur-md bg-white/60 dark:bg-gray-900/60 border-b border-gray-200/50 dark:border-gray-700/50">
              <Navbar />
            </div>

            {/* Main content area */}
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="max-w-7xl mx-auto space-y-8">
                {/* Page Header */}
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                    Media Tracker
                  </h1>
                  <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                    Track, Rate, and Review Your Favorite Media
                  </p>
                </div>

                {/* Content Card */}
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-2xl backdrop-blur-sm overflow-hidden">
                  <div className="transition-all duration-300 ease-in-out p-4">
                    <Routes>
                      {/* Home Route */}
                      <Route path="/" element={
                        <div className="transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
                          <HomePage />
                        </div>
                      } />
                      
                      {/* Media Routes */}
                      <Route path="/books" element={
                        <div className="transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
                          <BookPage />
                        </div>
                      } />
                      <Route path="/films" element={
                        <div className="transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
                          <FilmPage />
                        </div>
                      } />
                      <Route path="/billboard" element={
                        <div className="transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
                          <BillboardPage />
                        </div>
                      } />
                      <Route path="/media/:id" element={
                        <div className="transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
                          <MediaDetailPage />
                        </div>
                      } />
                      
                      {/* Protected Routes */}
                      <Route path="/add-book" element={
                        <PrivateRoute>
                          <div className="transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
                            <AddBookPage />
                          </div>
                        </PrivateRoute>
                      } />
                      <Route path="/add-film" element={
                        <PrivateRoute>
                          <div className="transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
                            <AddFilmPage />
                          </div>
                        </PrivateRoute>
                      } />
                      
                      {/* Auth Routes */}
                      <Route path="/login" element={
                        <div className="max-w-md mx-auto bg-white/90 dark:bg-gray-800/90 p-8 rounded-xl shadow-xl backdrop-blur-sm">
                          <LoginPage />
                        </div>
                      } />
                      <Route path="/register" element={
                        <div className="max-w-md mx-auto bg-white/90 dark:bg-gray-800/90 p-8 rounded-xl shadow-xl backdrop-blur-sm">
                          <RegisterPage />
                        </div>
                      } />
                    </Routes>
                  </div>
                </div>

                {/* Quick Access Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-lg backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-xl font-semibold mb-2">Quick Links</h3>
                    <div className="space-y-2">
                      <a href="/books" className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-center">
                        Browse Books
                      </a>
                      <a href="/films" className="block w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors text-center">
                        Browse Films
                      </a>
                    </div>
                  </div>
                  
                  <div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-lg backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-xl font-semibold mb-2">Top Rated</h3>
                    <div className="space-y-2 text-sm">
                      <p>⭐ Updated daily</p>
                      <p>📚 Best books this week</p>
                      <p>🎬 Trending movies</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-lg backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-xl font-semibold mb-2">Statistics</h3>
                    <div className="space-y-2 text-sm">
                      <p>📊 Your activity</p>
                      <p>📈 Popular genres</p>
                      <p>🏆 Achievement progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Footer */}
            <div className="mt-auto relative z-10">
              <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              <Footer />
            </div>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;