import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 text-gray-800 font-sans px-6 py-10">
      {/* Hero Header */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 text-indigo-700">
          Welcome to <span className="text-yellow-500">FinSave</span> 👋
        </h1>
        <p className="text-gray-700 max-w-3xl mx-auto text-lg mb-6">
          Your intelligent personal finance companion. Track your money, analyze spending, split expenses, and achieve your goals with AI-powered insights.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/register"
            className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg shadow hover:bg-yellow-300 transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="border border-indigo-500 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-100 font-medium transition"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-indigo-700 text-center mb-10">
          💡 Features You'll Love
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
          {features.map((title) => (
            <FeatureCard key={title} title={title} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white/40 backdrop-blur-md rounded-xl shadow-xl max-w-4xl mx-auto text-center py-10 px-6 mb-20 border border-indigo-200">
        <h3 className="text-2xl font-semibold text-indigo-800 mb-4">
          Ready to Take Control of Your Finances?
        </h3>
        <p className="text-gray-700 mb-6">
          Join FinSave and experience the future of smart money management.
        </p>
        <Link
          to="/register"
          className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-300 transition"
        >
          Create Your Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 mt-10">
        &copy; {new Date().getFullYear()} FinSave • Built for Smart Financial Wellness
      </footer>
    </div>
  );
};

const FeatureCard = ({ title }) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all border border-indigo-200">
    <h4 className="text-indigo-800 font-semibold text-lg">{title}</h4>
  </div>
);

const features = [
  "💸 Send & Receive Money",
  "🧾 Downloadable Reports",
  "🧠 Financial Health Score (FHS)",
  "🤝 Split Expenses Easily",
  "🔐 2FA Authentication",
  "🚩 Fraud Detection & Alerts",
  "🏆 Badges for Saving Streaks",
  "💬 AI Financial Chat Assistant",
  "📊 Smart Insights & Graphs",
];

export default Home;
