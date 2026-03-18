import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <nav className="bg-white border-b border-border-primary sticky top-0 z-50">
      <div className="container">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="text-2xl font-black text-black tracking-tighter uppercase group">
            X <span className="text-gold group-hover:text-black transition-colors">Men's</span> Hair Salon
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-secondary-brown hover:text-gold transition-colors">Home</Link>
            <Link to="/services" className="text-[10px] font-black uppercase tracking-widest text-secondary-brown hover:text-gold transition-colors">Services</Link>
            <Link to="/queue" className="text-[10px] font-black uppercase tracking-widest text-secondary-brown hover:text-gold transition-colors">Queue</Link>
            
            <div className="h-6 w-px bg-border-primary mx-4" />

            {isAuthenticated ? (
              <>
                <Link to="/booking" className="text-[10px] font-black uppercase tracking-widest text-secondary-brown hover:text-gold transition-colors">Book</Link>
                <Link to="/profile" className="text-[10px] font-black uppercase tracking-widest text-secondary-brown hover:text-gold transition-colors">Profile</Link>
                {user?.role === 'ADMIN' && (
                  <Button variant="black" size="sm" onClick={() => navigate('/admin')}>
                    Control Panel
                  </Button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-secondary-brown hover:text-gold transition-colors">Login</Link>
                <Button variant="gold" size="sm" onClick={() => navigate('/register')}>Register</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;