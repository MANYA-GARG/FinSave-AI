import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/auth/register", formData);
      alert("🎉 Registration successful! Please log in to continue.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-indigo-200 shadow-lg rounded-xl px-8 py-10 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-indigo-700 text-center mb-6">
          ✨ Create Your Account
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <div className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-300 focus:outline-none text-sm"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-300 focus:outline-none text-sm"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-300 focus:outline-none text-sm"
          />
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-3 rounded-lg transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Register;
