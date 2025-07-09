import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FHS = () => {
  const [fhs, setFhs] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
const [scoreOnly, setScoreOnly] = useState(null);

  useEffect(() => {
    fetchFHS();
    fetchAdvice();
  }, []);

  const fetchFHS = async () => {
    try {
      const res = await API.get("/ai/fhs");
        const text = res.data.result;
    setFhs(text);
 const match = text.match(/(\d{1,3})\s*\/\s*100/); // matches formats like "72/100"
    if (match && match[1]) {
      setScoreOnly(Number(match[1]));
    }
    } catch (err) {
      toast.error("Failed to fetch FHS Score");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvice = async () => {
    try {
      const res = await API.get("/ai/advice");
      setAdvice(res.data.result);
    } catch (err) {
      toast.error("Failed to fetch budgeting advice");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 via-blue-50 to-purple-100 text-gray-800 px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-10 text-indigo-700">
        💹 Your Financial Health Overview
      </h1>
{scoreOnly !== null && (
  <div className="text-center mb-6">
    <div className="inline-block bg-green-100 text-green-800 font-bold text-4xl px-6 py-3 rounded-full shadow-md border border-green-300">
      FHS: {scoreOnly}/100
    </div>
    <p className="text-sm text-gray-500 mt-2">Your estimated Financial Health Score</p>
  </div>
)}

      {loading ? (
        <p className="text-center text-gray-600">Loading your score...</p>
      ) : (
       <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* FHS Score Block */}
  <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow-sm max-h-75 overflow-y-auto">
    <h2 className="text-lg font-semibold text-indigo-600 mb-2">📊 Financial Health Score</h2>
    <p className="text-gray-700 whitespace-pre-wrap text-xs leading-tight">
      {fhs || "No score available"}
    </p>
  </div>

  {/* Budgeting Advice Block */}
  <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow-sm max-h-75 overflow-y-auto">
    <h2 className="text-lg font-semibold text-green-600 mb-2">💡 Smart Budgeting Advice</h2>
    <p className="text-gray-700 whitespace-pre-wrap text-xs leading-tight">
      {advice || "No advice available"}
    </p>
  </div>
</div>


      )}

      <div className="text-center text-sm text-gray-500 mt-10">
        Powered by AI & Recent Transactions • Updated dynamically
      </div>
    </div>
  );
};

export default FHS;
