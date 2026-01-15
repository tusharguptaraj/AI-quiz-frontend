/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { updateProfile, signOut } from "firebase/auth";
import robotImg from "../assets/robot.png";
import { Navigate, useNavigate } from "react-router-dom";

export default function Profile() {
  const [user] = useAuthState(auth);
  const [userDetails, setUserDetails] = useState(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Student");
  const [notifications, setNotifications] = useState(true);
  const [message, setMessage] = useState("");

  // 🧩 Quiz stats state
  const [quizStats, setQuizStats] = useState({
    totalCreated: 0,
    attempted: 0,
    avgScore: 0,
    bestQuiz: "N/A",
  });

  const navigate = useNavigate();

  if (!user) return <Navigate to="/" replace />;

  // Fetch user details from DB
  useEffect(() => {
    if (!user?.email) return;

    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`https://intelliq-api.onrender.com/api/user/${user.email}`);
        if (!response.ok) throw new Error("Failed to fetch user details");
        const data = await response.json();
        setUserDetails(data);
        setName(data.name || "");
        setRole(data.role || "Student");
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserDetails();
  }, [user?.email]);

  // 🧠 Fetch quiz statistics
  useEffect(() => {
    if (!user?.email) return;

    const fetchQuizStats = async () => {
      try {
        const res = await fetch(`https://intelliq-api.onrender.com/api/quizzes/${user.email}`);
        if (!res.ok) throw new Error("Failed to fetch quizzes");
        const quizzes = await res.json();

        if (!Array.isArray(quizzes) || quizzes.length === 0) {
          setQuizStats({
            totalCreated: 0,
            attempted: 0,
            avgScore: 0,
            bestQuiz: "N/A",
          });
          return;
        }

        const totalCreated = quizzes.length;
        const attemptedQuizzes = quizzes.filter((q) => q.attempted);
        const attempted = attemptedQuizzes.length;

        // 🧮 Calculate average score out of 100
        let totalScore = 0;
        let totalPossible = 0;

        attemptedQuizzes.forEach((q) => {
          const possible = q.quiz?.questions?.length || 0;
          totalPossible += possible;
          totalScore += q.score || 0;
        });

        const avgScore =
          totalPossible > 0
            ? Math.round((totalScore / totalPossible) * 100)
            : 0;

        // 🥇 Best quiz based on highest score percentage
        const bestQuizObj =
          attemptedQuizzes.sort((a, b) => {
            const aPercent =
              a.quiz?.questions?.length > 0
                ? (a.score / a.quiz.questions.length) * 100
                : 0;
            const bPercent =
              b.quiz?.questions?.length > 0
                ? (b.score / b.quiz.questions.length) * 100
                : 0;
            return bPercent - aPercent;
          })[0] || null;

        setQuizStats({
          totalCreated,
          attempted,
          avgScore,
          bestQuiz: bestQuizObj ? bestQuizObj.topic || "Untitled" : "N/A",
        });
      } catch (err) {
        console.error("Quiz stats error:", err);
      }
    };

    fetchQuizStats();
  }, [user?.email]);

  const handleUpdateProfile = async () => {
    try {
      if (!user?.email) throw new Error("User email is undefined");

      await updateProfile(user, { displayName: name });
      const emailEncoded = encodeURIComponent(user.email);

      const res = await fetch(`https://intelliq-api.onrender.com/api/user/${emailEncoded}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setUserDetails(data);
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Update Error:", err);
      setMessage(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-10">
      <motion.div
        className="flex flex-col md:flex-row w-full max-w-5xl gap-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Left: Profile Picture */}
        <div className="flex flex-col items-center bg-gray-800/80 p-6 rounded-2xl shadow-lg w-full md:w-1/3">
          <img
            src={robotImg}
            alt="Profile"
            className="w-40 h-40 object-cover rounded-full mb-4 border-4 border-purple-500"
          />
          <h2 className="text-xl font-bold mt-4">{name}</h2>
          <p className="text-gray-400">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>

        {/* Right: Profile Details */}
        <div className="flex-1 bg-gray-800/80 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center md:text-left">Your Profile</h2>

          {message && (
            <p className="mb-4 text-center md:text-left text-green-400 font-semibold">{message}</p>
          )}

          <div className="flex flex-col gap-4">
            {/* Editable fields */}
            <label className="flex flex-col">
              <span className="text-gray-400 mb-1">Full Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-3 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-gray-400 mb-1">Email</span>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="p-3 rounded-lg bg-gray-900 border border-gray-700 cursor-not-allowed"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-gray-400 mb-1">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="p-3 rounded-lg bg-gray-900 border border-gray-700"
              >
                <option>Student</option>
                <option>Teacher</option>
              </select>
            </label>

            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
                className="accent-purple-500"
              />
              <span className="text-gray-400">Enable Notifications</span>
            </label>

            <button
              onClick={handleUpdateProfile}
              className="mt-4 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold"
            >
              Save Changes
            </button>
          </div>

          {/* 🧩 Dynamic Quiz Stats */}
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-4">Your Statistics</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
                <p className="text-gray-400">Total Quizzes Created</p>
                <p className="text-2xl font-bold mt-1">{quizStats.totalCreated}</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
                <p className="text-gray-400">Quizzes Attempted</p>
                <p className="text-2xl font-bold mt-1">{quizStats.attempted}</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
                <p className="text-gray-400">Average Score</p>
                <p className="text-2xl font-bold mt-1">{quizStats.avgScore}%</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
                <p className="text-gray-400">Best Quiz</p>
                <p className="text-2xl font-bold mt-1">{quizStats.bestQuiz}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
