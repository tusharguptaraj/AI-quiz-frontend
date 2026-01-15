import { useState, useEffect, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import axios from "axios";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, LabelList,
} from "recharts";

const COLORS = ["#16A34A", "#E11D48"];

export default function Analytics() {
  const [user] = useAuthState(auth);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get(`http://intelliq-api.onrender.com/api/quizzes/${user.email}`);
        setQuizzes(res.data || []);
      } catch (err) {
        console.error("Failed to fetch quizzes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [user]);

  // Derived Stats
  const totalQuizzes = quizzes.length;
  const attemptedQuizzes = quizzes.filter(q => q.attempted);
  const unattemptedQuizzes = quizzes.filter(q => !q.attempted);
  const attemptedCount = attemptedQuizzes.length;
  const notAttemptedCount = unattemptedQuizzes.length;

  // Average / Best / Worst Scores out of 100
  const averageScore = attemptedCount
    ? Math.round(
        attemptedQuizzes.reduce((acc, q) => {
          const totalQ = q.quiz?.questions?.length || 1;
          return acc + ((q.score ?? 0) / totalQ) * 100;
        }, 0) / attemptedCount
      )
    : 0;

  const bestScore = attemptedCount
    ? Math.round(
        Math.max(
          ...attemptedQuizzes.map(q => ((q.score ?? 0) / (q.quiz?.questions?.length || 1)) * 100)
        )
      )
    : 0;

  

  // Pie Chart Data
  const pieData = [
    { name: "Attempted", value: attemptedCount },
    { name: "Not Attempted", value: notAttemptedCount },
  ];

  // Quiz-wise Score
  const scoreData = attemptedQuizzes.map(q => ({
    name: q.title || q.topic || "Untitled Quiz",
    score: Math.round(((q.score ?? 0) / (q.quiz?.questions?.length || 1)) * 100),
  }));

  // Activity Over Time
  const activityData = useMemo(() => {
    const map = {};
    attemptedQuizzes.forEach(q => {
      const date = new Date(q.createdAt).toLocaleDateString();
      map[date] = (map[date] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }, [attemptedQuizzes]);

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
            quizzesOfDay.reduce((acc, q) => {
              const totalQ = q.quiz?.questions?.length || 1;
              return acc + ((q.score ?? 0) / totalQ) * 100;
            }, 0) / quizzesOfDay.length
          )
        : null;

      let performanceLabel = "";
      if (avgScore !== null) {
        if (avgScore < 51) performanceLabel = "Poor";
        else if (avgScore < 80) performanceLabel = "Good";
        else performanceLabel = "Excellent";
      }

      days.push({ date: key, quizzes: quizzesOfDay, avgScore, performanceLabel });
    }
    return days;
  }, [attemptedQuizzes]);

  if (loading)
    return <p className="text-gray-400 text-center mt-10">Loading analytics...</p>;

  if (totalQuizzes === 0)
    return <p className="text-gray-400 text-center mt-10">No quizzes available for analytics.</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10">
      <motion.h1
        className="text-3xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📊 Your Quiz Analytics Dashboard
      </motion.h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
        <div className="bg-gray-800 p-4 md:p-6 rounded-2xl text-center shadow-lg">
          <h2 className="text-lg text-gray-300">Total Quizzes</h2>
          <p className="text-3xl md:text-4xl font-extrabold text-purple-500">{totalQuizzes}</p>
        </div>
        <div className="bg-gray-800 p-4 md:p-6 rounded-2xl text-center shadow-lg">
          <h2 className="text-lg text-gray-300">Attempted</h2>
          <p className="text-3xl md:text-4xl font-extrabold text-green-500">{attemptedCount}</p>
        </div>
        <div className="bg-gray-800 p-4 md:p-6 rounded-2xl text-center shadow-lg">
          <h2 className="text-lg text-gray-300">Average Score</h2>
          <p className="text-3xl md:text-4xl font-extrabold text-pink-500">{averageScore}%</p>
        </div>
        <div className="bg-gray-800 p-4 md:p-6 rounded-2xl text-center shadow-lg">
          <h2 className="text-lg text-gray-300">Best Score</h2>
          <p className="text-3xl md:text-4xl font-extrabold text-yellow-400">{bestScore}%</p>
        </div>
      </div>

      {/* Last 7 Days Performance */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4 text-center">📅 Last 7 Days Performance</h2>
        <div className="flex md:grid md:grid-cols-7 gap-4 overflow-x-auto md:overflow-x-visible pb-2">
          {sevenDayPerformance
            .slice()
            .reverse()
            .map((day, idx) => {
              let bgColor = "bg-gray-800";
              if (day.avgScore !== null) {
                if (day.avgScore < 51) bgColor = "bg-red-600";
                else if (day.avgScore < 80) bgColor = "bg-yellow-500";
                else bgColor = "bg-green-600";
              }

              return (
                <div
                  key={idx}
                  className={`${bgColor} p-3 rounded-lg shadow-lg flex flex-col justify-between min-w-[140px]`}
                >
                  <h3 className="text-center text-sm font-semibold mb-2">{day.date}</h3>
                  <div className="flex-1 overflow-y-auto max-h-40 space-y-1">
                    {day.quizzes.length === 0 ? (
                      <p className="text-gray-300 text-xs text-center">No attempts</p>
                    ) : (
                      day.quizzes.map((q, i) => {
                        const totalQ = q.quiz?.questions?.length || 1;
                        const scorePercent = Math.round(((q.score ?? 0) / totalQ) * 100);
                        return (
                          <div key={i} className="flex justify-between text-xs font-medium">
                            <span className="truncate">{q.topic || "General"}</span>
                            <span>{scorePercent}%</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {day.avgScore !== null && (
                    <div className="mt-2 text-center text-sm font-bold">
                      Avg: {day.avgScore}% ({day.performanceLabel})
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Charts Grid */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        {/* Pie Chart: Attempted vs Not Attempted */}
        <div className="bg-gray-800/80 p-4 md:p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-center">Attempted vs Not Attempted</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart: Activity Over Time */}
        <div className="bg-gray-800/80 p-4 md:p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-center">Activity Over Time</h2>
          <ResponsiveContainer width="100%" height={250}>
  <LineChart data={activityData}>
    <CartesianGrid strokeDasharray="3 3" stroke="#555" />
    <XAxis dataKey="date" stroke="#fff" />
    <YAxis stroke="#fff" />

    <Tooltip
      content={({ label, payload }) => {
        if (!payload || !payload.length) return null;

        return (
          <div
            style={{
              background: "rgba(31, 41, 55, 0.9)",
              padding: "8px 12px",
              borderRadius: "8px",
              color: "#fff",
            }}
          >
            <p>Date: {label}</p>
            <p>Quizzes: {payload[0].value}</p>
          </div>
        );
      }}
    />

    <Line
      type="monotone"
      dataKey="count"
      stroke="#8B5CF6"
      strokeWidth={2}
    />
  </LineChart>
</ResponsiveContainer>

        </div>

        {/* Bar Chart: Quiz-wise Score */}


<div className="bg-gray-800/80 p-4 md:p-6 rounded-2xl shadow-lg md:col-span-2">
  <h2 className="text-xl font-bold mb-4 text-center">Quiz-wise Score</h2>
  <ResponsiveContainer width="100%" height={300}>
  <BarChart data={scoreData.slice(0, 10)}>
    <XAxis dataKey="name" stroke="#fff" tick={false} axisLine={true} />
    <YAxis stroke="#fff" />
    <Tooltip
      contentStyle={{
        backgroundColor: "rgba(31, 41, 55, 0.9)",
        border: "none",
        borderRadius: "8px",
        color: "#fff",
      }}
      labelFormatter={(name) => `Quiz: ${name}`}
      formatter={(value) => [`Score: ${value}`]}
    />
    <Bar dataKey="score" fill="#7C3AED" radius={[5, 5, 0, 0]} />
  </BarChart>
</ResponsiveContainer>


  {/* Label below the chart */}
  <p className="text-center text-gray-300 mt-2 text-l font-bold">Previous 10 Quizzes</p>
</div>

      </motion.div>
    </div>
  );
}
