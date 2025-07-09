import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/FINSAVE.png";
import axios from "axios";

const MainNavbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:7001/api/auth/status", {
          withCredentials: true,
        });
        setUserData(res.data);
      } catch (err) {
        console.error("User not authenticated");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:7001/api/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-200 via-blue-100 to-purple-200 text-gray-800 shadow-md border-b border-indigo-300">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <img src={logo} alt="FinSave Logo" className="w-18 h-18 rounded-full" />
          <span className="text-xl font-semibold text-indigo-700">FinSave</span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex space-x-6 text-sm font-medium">
          <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
          <Link to="/wallet" className="hover:text-indigo-600">Wallet</Link>
          <Link to="/transactions" className="hover:text-indigo-600">Transactions</Link>
          <Link to="/split" className="hover:text-indigo-600">Split Expense</Link>
          <Link to="/badges" className="hover:text-indigo-600">Badges</Link>
          <Link to="/ai-assistant" className="hover:text-indigo-600">AI Assistant</Link>
          <Link to="/FHS" className="hover:text-indigo-600">FHS Score</Link>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-4">
          {/* Avatar & Username */}
          <div className="flex flex-col items-center space-y-1">
            <img
              src={`https://ui-avatars.com/api/?name=${userData?.username || "User"}&background=random`}
              alt="Avatar"
              className="w-9 h-9 rounded-full border border-indigo-400 cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
            <span className="text-xs text-indigo-700 font-medium">
              {userData?.username || "User"}
            </span>
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute top-16 right-6 w-40 bg-white text-gray-900 rounded shadow-lg z-50">
              <div className="p-3 text-sm border-b border-gray-200 font-semibold">
                {userData?.username || "User"}
              </div>
              <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</Link>
              <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-gray-100">Settings</Link>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-sm border border-red-400 text-red-600 px-3 py-1 rounded hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;
