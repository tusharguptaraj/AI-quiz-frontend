import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import axios from "axios";

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;

    const fetchQuizzes = async () => {
      try {
        const res = await axios.get(`https://intelliq-api.onrender.com/api/quizzes/${user.email}`);
        setQuizzes(res.data);
      } catch (err) {
        console.error("Failed to fetch quizzes:", err);
      }
    };

    fetchQuizzes();
  }, [user]);

  const handleViewQuiz = (quiz) => setSelectedQuiz(quiz);
  const closeResult = () => setSelectedQuiz(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10">
      <h2 className="text-3xl font-bold mb-8 text-center">📘 My Quizzes</h2>

      {quizzes.length === 0 ? (
        <p className="text-gray-400 italic text-lg text-center">
          No quizzes found. Create your first quiz!
        </p>
      ) : (
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-1 gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="bg-gray-800 rounded-lg shadow-md p-4 flex flex-col md:flex-row md:items-center md:justify-between transition hover:bg-gray-700/40"
            >
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-lg truncate">{quiz.topic || "N/A"}</p>
                <p className="text-gray-400 text-sm">Difficulty: {quiz.difficulty || "Medium"}</p>
                <p
                  className={`font-semibold text-sm ${
                    quiz.attempted ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {quiz.attempted ? "Attempted" : "Not Attempted"}
                </p>
                <p className="text-gray-400 text-xs">
                  {new Date(quiz.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleViewQuiz(quiz)}
                className="mt-3 md:mt-0 md:ml-4 px-4 py-2 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                View Quiz
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🟪 Quiz / Result Modal */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2">
          <div className="bg-gray-800 rounded-2xl w-full max-w-3xl p-6 md:p-8 shadow-xl relative flex flex-col max-h-[90vh]">
            <button
              onClick={closeResult}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl"
            >
              ✖
            </button>

            <h3 className="text-2xl font-bold text-purple-400 mb-4 text-center truncate">
              📊 {selectedQuiz.title || "Quiz Overview"}
            </h3>

            {selectedQuiz.attempted && (
              <p className="text-gray-300 mb-4 text-center">
                Score:{" "}
                <span className="text-green-400 font-semibold">
                  {selectedQuiz.score} / {selectedQuiz.quiz?.questions?.length || 0}
                </span>
              </p>
            )}

            <div className="space-y-4 overflow-y-auto flex-1">
              {selectedQuiz.quiz?.questions?.map((q, idx) => {
                const userAnswer = selectedQuiz.answers?.[idx];
                const isCorrect = userAnswer === q.answer;

                return (
                  <div
                    key={idx}
                    className="p-3 md:p-4 bg-gray-900 rounded-lg border border-gray-700"
                  >
                    <p className="font-semibold text-base md:text-lg mb-2">
                      Q{idx + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                      {q.options.map((opt, i) => {
                        const isUser = userAnswer === i;
                        const isAns = q.answer === i;
                        const baseStyle =
                          "p-2 md:p-3 rounded-lg border text-sm md:text-base transition";

                        let styleClass = "bg-gray-800 border-gray-600";

                        if (selectedQuiz.attempted) {
                          if (isAns) styleClass = "bg-green-700 border-green-400";
                          else if (isUser && !isAns) styleClass = "bg-red-700 border-red-400";
                        } else {
                          if (isAns) styleClass = "bg-green-700 border-green-400";
                        }

                        return (
                          <div key={i} className={`${baseStyle} ${styleClass}`}>
                            <span className="font-bold mr-2">
                              {String.fromCharCode(65 + i)}.
                            </span>
                            {opt}
                          </div>
                        );
                      })}
                    </div>

                    {selectedQuiz.attempted ? (
                      <p
                        className={`mt-2 md:mt-3 font-semibold ${
                          isCorrect ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {isCorrect ? "✅ Correct" : "❌ Wrong"}
                      </p>
                    ) : (
                      <p className="mt-2 md:mt-3 font-semibold text-green-400">
                        ✅ Correct Answer:{" "}
                        <span className="text-white">{q.options[q.answer]}</span>
                      </p>
                    )}

                    {q.explanation && (
                      <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-400">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
