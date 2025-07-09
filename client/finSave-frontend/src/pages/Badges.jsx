import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";

const Badges = () => {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const [earnedRes, allRes] = await Promise.all([
        API.get("/badges/my"),
        API.get("/badges/all"),
      ]);
      setEarnedBadges(earnedRes.data.badges);
      setAllBadges(allRes.data.badges);
    } catch (err) {
      console.error("Error fetching badges:", err);
      toast.error("❌ Failed to load badges");
    } finally {
      setLoading(false);
    }
  };

  const isEarned = (badgeName) =>
    earnedBadges.some((b) => b.name === badgeName);

  const getEarnedDate = (badgeName) => {
    const badge = earnedBadges.find((b) => b.name === badgeName);
    return badge ? new Date(badge.earnedAt).toLocaleDateString() : null;
  };

  const getEmoji = (name) => {
    const emojiMap = {
      "3-Day Saver": "🔥",
      "7-Day Champion": "🏆",
      "30-Day Legend": "👑",
    };
    return emojiMap[name] || "🎖️";
  };

  const getUnlockText = (badge) =>
    `Save for ${badge.streakLength} day${badge.streakLength > 1 ? "s" : ""} to unlock!`;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 via-blue-50 to-purple-100 text-gray-800 px-6 py-10 font-sans">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">
        🏅 Your Achievement Badges
      </h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading badges...</p>
      ) : allBadges.length === 0 ? (
        <p className="text-center text-gray-500">No badges available.</p>
      ) : (
        <>
          {earnedBadges.length === 0 && (
            <div className="text-center text-gray-600 mb-6">
              <p className="text-lg font-medium">😕 No badges earned yet.</p>
              <p className="text-sm mt-1 text-gray-500">
                Start saving daily to earn your first badge!
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {allBadges.map((badge) => {
              const earned = isEarned(badge.name);
              return (
                <div
                  key={badge._id}
                  className={`rounded-xl p-5 border shadow-md transition-all duration-300 ${
                    earned
                      ? "bg-indigo-100 border-indigo-300"
                      : "bg-white border-gray-200 opacity-90 hover:opacity-100"
                  }`}
                >
                  <div className="text-5xl text-center mb-3">{getEmoji(badge.name)}</div>
                  <h3 className="text-lg font-bold text-center text-indigo-700">{badge.name}</h3>
                  <p className="text-sm text-center text-gray-700 mb-2">{badge.description}</p>

                  <div className="mt-2 text-center text-xs">
                    {earned ? (
                      <span className="text-green-600 font-medium">
                        ✅ Earned on {getEarnedDate(badge.name)}
                      </span>
                    ) : (
                      <span className="text-yellow-600">
                        🔒 {getUnlockText(badge)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Badges;
