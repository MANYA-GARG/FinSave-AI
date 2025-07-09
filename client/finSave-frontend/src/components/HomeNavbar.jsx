import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/FINSAVE.png";

const HomeNavbar = () => {
  return (
    <nav className="bg-indigo-200/80 text-gray-800 px-6 py-4 shadow-md border-b border-indigo-300 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo + Brand */}
        <div className="flex items-center space-x-3">
          <img
            src={logo}
            alt="FinSave Logo"
            className="w-18 h-18 rounded-full shadow border border-indigo-400"
          />
          <span className="text-2xl font-bold text-indigo-700 tracking-wide">FinSave</span>
        </div>

        {/* Auth Buttons */}
        <div className="flex space-x-4">
          <Link
            to="/register"
            className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-300 transition shadow"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="border border-indigo-500 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 font-medium transition shadow-sm"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;
