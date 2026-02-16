import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser, logout } from '../store/slices/authSlice';

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-blue-600">
              ✂️ X Men's Hair Salon
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                Home
              </Link>
              <Link to="/services" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                Services
              </Link>
              <Link to="/queue" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                Queue
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/booking" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    Book
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    Profile
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    Login
                  </Link>
                  <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 X Men's Hair Salon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;