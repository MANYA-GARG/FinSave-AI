import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [twoFACode, setTwoFACode] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handle2FAChange = (e) => {
    setTwoFACode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/login", formData);
      if (res.data.isMfaActive) {
        setShow2FA(true);
      } else {
        navigate("/2fa-setup");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/2fa/verify", { token: twoFACode });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "2FA verification failed");
    }
  };

  // 🔐 2FA Form
  if (show2FA) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-indigo-100 via-blue-50 to-purple-100 flex justify-center items-center px-4 py-10">
        <form
          onSubmit={handle2FASubmit}
          className="bg-white border border-indigo-200 shadow-lg rounded-xl px-8 py-10 w-full max-w-md"
        >
          <h2 className="text-xl font-bold text-indigo-700 text-center mb-6">
            🔐 Enter 2FA Code
          </h2>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <input
            type="text"
            placeholder="6-digit code"
            required
            value={twoFACode}
            onChange={handle2FAChange}
            className="w-full px-4 py-3 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-300 text-sm mb-6"
          />

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-3 rounded-lg transition"
          >
            Verify
          </button>
        </form>
      </div>
    );
  }

  // 🔐 Login Form
  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 via-blue-50 to-purple-100 flex justify-center items-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-indigo-200 shadow-lg rounded-xl px-8 py-10 w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-indigo-700 text-center mb-6">
          🔐 Login to FinSave
        </h2>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-300 text-sm mb-4"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-300 text-sm mb-6"
        />

        <button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-3 rounded-lg transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
