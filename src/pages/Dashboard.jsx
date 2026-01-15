import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import robotImg from "../assets/robot.png";
import logo from "../assets/logo.png";
import { FaHome, FaBookOpen, FaChartBar, FaUser, FaPlusCircle, FaBars, FaTimes } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user details
  useEffect(() => {
    if (!user?.email) return;
    const fetchUserDetails = async () => {
      try {
        const res = await fetch(`https://intelliq-api.onrender.com/api/user/${user.email}`);
        if (!res.ok) throw new Error("Failed to fetch user details");
        const data = await res.json();
        setUserDetails(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserDetails();
  }, [user?.email]);

  // Fetch quizzes
  useEffect(() => {
    if (!user?.email) return;
    const fetchQuizzes = async () => {
      try {
        const res = await fetch(`https://intelliq-api.onrender.com/api/quizzes/${user.email}`);
        const data = await res.json();
        setQuizzes(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [user?.email]);

  // Derived Stats
  const totalQuizzes = quizzes.length;
  const attemptedQuizzes = quizzes.filter(q => q.attempted);
  const averageScore = attemptedQuizzes.length
    ? Math.round(
        attemptedQuizzes.reduce((acc, q) => acc + (q.score ?? 0), 0) / attemptedQuizzes.length
      )
    : 0;
  const bestScore = attemptedQuizzes.length
    ? Math.max(...attemptedQuizzes.map(q => q.score ?? 0))
    : 0;

  // Last 7 Days Performance
  const sevenDayPerformance = useMemo(() => {
    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const key = date.toLocaleDateString();
      const quizzesOfDay = attemptedQuizzes.filter(
        q => new Date(q.createdAt).toLocaleDateString() === key
      );
      const avgScore = quizzesOfDay.length
        ? Math.round(
            quizzesOfDay.reduce((acc, q) => acc + (q.score ?? 0), 0) / quizzesOfDay.length
          )
        : 0;
      days.push({ date: key, avgScore });
    }

    return days;
  }, [attemptedQuizzes]);

  const stats = [
    { title: "Total Quizzes", value: totalQuizzes },
    { title: "Quizzes Attempted", value: attemptedQuizzes.length },
    { title: "Average Score", value: `${averageScore}0%` },
    { title: "Best Quiz", value: `${bestScore}0%` },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-900 text-white">
      {/* Sidebar for desktop */}
      <aside className="md:flex flex-col w-64 bg-gray-800/90 p-6 hidden md:flex">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 tracking-wide">
          <img src={logo} alt="INTELLIQ Logo" className="h-15 w-auto inline-block" />
        </h1>
        <nav className="flex flex-col gap-5 mb-6">
          {[
            { name: "Home", icon: <FaHome />, path: "/dashboard" },
            { name: "My Quizzes", icon: <FaBookOpen />, path: "/quizzes" },
            { name: "Analytics", icon: <FaChartBar />, path: "/analytics" },
            { name: "Profile", icon: <FaUser />, path: "/profile" },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-600/30 transition"
            >
              <span className="text-purple-400">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        <Link
          to="/createquiz"
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg mt-2 transition flex items-center justify-center gap-2 font-semibold text-white"
        >
          <FaPlusCircle /> Create Quiz
        </Link>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-gray-800/90 p-4">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
          IntelliQ
        </h1>
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {menuOpen && (
        <aside className="md:hidden fixed top-0 left-0 w-64 h-full bg-gray-800/95 p-6 z-50">
          <nav className="flex flex-col gap-5 mb-6">
            {[
              { name: "Home", icon: <FaHome />, path: "/dashboard" },
              { name: "My Quizzes", icon: <FaBookOpen />, path: "/quizzes" },
              { name: "Analytics", icon: <FaChartBar />, path: "/analytics" },
              { name: "Profile", icon: <FaUser />, path: "/profile" },
            ].map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-600/30 transition"
              >
                <span className="text-purple-400">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          <Link
            to="/createquiz"
            onClick={() => setMenuOpen(false)}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg mt-2 transition flex items-center justify-center gap-2 font-semibold text-white"
          >
            <FaPlusCircle /> Create Quiz
          </Link>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Header */}
        <motion.div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome, <span className="text-purple-400">{userDetails?.name || user?.email}</span>
            </h2>
            <p className="text-gray-400">{userDetails?.role}</p>
            <p className="text-gray-400">{userDetails?.email}</p>
          </div>
          <img src={robotImg} className="w-16 md:w-20 h-16 md:h-20 object-contain rounded-full" />
        </motion.div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          {stats.map((card) => (
            <motion.div
              key={card.title}
              className="p-4 md:p-6 bg-gray-800/80 rounded-2xl shadow-lg border-l-4 border-purple-500 hover:scale-105 transition transform"
            >
              <h3 className="text-gray-400 text-sm md:text-base">{card.title}</h3>
              <p className="text-xl md:text-2xl font-bold mt-2">{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Quizzes */}
        {/* Top 3 Quizzes */}
<div className="mb-10">
  <h3 className="text-lg md:text-xl font-bold mb-4">Top 3 Quizzes</h3>
  <div className="flex gap-4 overflow-x-auto pb-2">
    {loading ? (
      <p className="text-gray-400">Loading quizzes...</p>
    ) : quizzes.length === 0 ? (
      <p className="text-gray-400">No quizzes found.</p>
    ) : (
      quizzes
        .filter(q => q.attempted) // Only attempted quizzes
        .sort((a, b) => {
          const scoreA = ((a.score ?? 0) / (a.quiz?.questions?.length || 1)) * 100;
          const scoreB = ((b.score ?? 0) / (b.quiz?.questions?.length || 1)) * 100;
          return scoreB - scoreA; // Sort descending
        })
        .slice(0, 3) // Take top 3
        .map((quiz) => {
          const totalQuestions = quiz.quiz?.questions?.length || 1;
          const percent = Math.round(((quiz.score ?? 0) / totalQuestions) * 100);

          return (
            <motion.div
              key={quiz._id}
              className="min-w-[150px] md:min-w-[200px] p-3 md:p-4 bg-gray-800/80 rounded-xl shadow-lg hover:scale-105 transition transform"
            >
              <h4 className="font-semibold text-sm md:text-base">{quiz.topic || "General"}</h4>
              <p className="text-gray-400 mt-1 md:mt-2 text-xs md:text-sm">
                {percent}%
              </p>
            </motion.div>
          );
        })
    )}
  </div>
</div>


        {/* Last 7 Days Performance */}
        <motion.div className="p-4 md:p-6 bg-gray-800/80 rounded-2xl shadow-lg mb-10">
          <h3 className="text-lg md:text-xl font-bold mb-4">Last 7 Days Performance</h3>
          <div className="h-40 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sevenDayPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="date" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Line type="monotone" dataKey="avgScore" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
