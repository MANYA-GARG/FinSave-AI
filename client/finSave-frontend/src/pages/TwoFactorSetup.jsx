import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const TwoFactorSetup = () => {
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleSetup = async () => {
    try {
      const res = await axios.post("/auth/2fa/setup");
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      setStep(2);
    } catch (error) {
      console.error("Failed to set up 2FA", error);
    }
  };

  const handleVerify = async () => {
    try {
      const res = await axios.post("/auth/2fa/verify", { token });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      alert("Invalid token. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-6 py-10">
      <h1 className="text-3xl font-bold text-yellow-400 mb-6">Enable 2FA</h1>

      {step === 1 && (
        <button
          className="bg-yellow-400 text-gray-900 font-semibold px-6 py-3 rounded hover:bg-yellow-300"
          onClick={handleSetup}
        >
          Generate QR Code
        </button>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-gray-300">
            Scan the QR Code below in Google Authenticator or Authy.
          </p>
          <img src={qrCode} alt="2FA QR Code" className="w-40 h-40 border" />
          <p className="text-sm text-gray-400">Secret: {secret}</p>

          <input
            type="text"
            placeholder="Enter the 6-digit code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="px-4 py-2 rounded bg-gray-800 border border-gray-600 text-white"
          />
          <button
            onClick={handleVerify}
            className="bg-green-500 px-6 py-2 rounded hover:bg-green-600 text-white font-semibold"
          >
            Verify & Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;
