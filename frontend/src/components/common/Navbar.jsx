import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-primary-600">
            X Men's Hair Salon
          </Link>
          
          <div className="flex space-x-4">
            <Link to="/" className="text-gray-700 hover:text-primary-600">Home</Link>
            <Link to="/services" className="text-gray-700 hover:text-primary-600">Services</Link>
            <Link to="/queue" className="text-gray-700 hover:text-primary-600">Queue</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/booking" className="text-gray-700 hover:text-primary-600">Book</Link>
                <Link to="/profile" className="text-gray-700 hover:text-primary-600">Profile</Link>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="text-gray-700 hover:text-primary-600">Admin</Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600">Login</Link>
                <Link to="/register" className="text-gray-700 hover:text-primary-600">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;