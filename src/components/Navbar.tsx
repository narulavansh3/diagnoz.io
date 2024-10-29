import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">TeleRad</span>
          </Link>
          
          <div className="flex space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 px-3 py-2">
              Login
            </Link>
            <Link to="/radiologist/signup" className="text-gray-600 hover:text-blue-600 px-3 py-2">
              Radiologist Signup
            </Link>
            <Link to="/center/signup" className="text-gray-600 hover:text-blue-600 px-3 py-2">
              Center Signup
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;