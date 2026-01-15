import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

export default function CreateQuiz() {
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState(null);
  const [difficulty, setDifficulty] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [user] = useAuthState(auth);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answeredStatus, setAnsweredStatus] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({ rating: "", comments: "" });

  // Timer
  useEffect(() => {
    if (!showQuiz || submitted || showFeedback) return;
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showQuiz, submitted, showFeedback]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) setSubmitted(true);
  }, [timeLeft, submitted]);

  // Handle quiz generation
  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!textInput.trim() && !file)
      return alert("❌ Please enter a topic or upload a file");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", user?.email);
      formData.append("difficulty", difficulty);
      if (textInput.trim()) formData.append("topic", textInput);
      if (file) formData.append("file", file);

      const res = await fetch("https://intelliq-api.onrender.com/api/quiz/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setQuiz({
        quizId: data.quizId,
        questions: data.questions,
        topic: data.topic,
        difficulty: data.difficulty,
      });

      setAnswers({});
      setScore(0);
      setSubmitted(false);
      setCurrentQ(0);
      setAnsweredStatus(new Array(data.questions.length).fill("unanswered"));
      setShowQuiz(true);
      setTimeLeft(30);
    } catch (err) {
      console.error(err);
      alert("Failed to generate quiz: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIndex, optIndex) => {
    if (submitted || timeLeft === 0) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmitQuestion = () => {
    const q = quiz.questions[currentQ];
    const selected = answers[currentQ];
    if (selected === undefined) return alert("Please select an answer!");

    const isCorrect = selected === q.answer;
    const newStatus = [...answeredStatus];
    newStatus[currentQ] = isCorrect ? "correct" : "wrong";
    setAnsweredStatus(newStatus);
    if (isCorrect) setScore((s) => s + 1);
    setSubmitted(true);
  };

  const handleSkipQuestion = () => {
    const newStatus = [...answeredStatus];
    newStatus[currentQ] = "skipped";
    setAnsweredStatus(newStatus);
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSubmitted(false);
      setTimeLeft(30);
    } else handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    setSubmitted(true);
    try {
      await fetch("https://intelliq-api.onrender.com/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.quizId,
          selectedAnswers: answers,
          score,
        }),
      });
    } catch (err) {
      console.error("❌ Failed to save attempt:", err);
    }
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = async () => {
    try {
      await fetch("https://intelliq-api.onrender.com/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, feedback }),
      });
    } catch (err) {
      console.error("❌ Failed to submit feedback:", err);
    }
    setShowFeedback(false);
    setShowQuiz(false);
    setQuiz(null);
    setTextInput("");
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-4 py-10">
      {/* QUIZ GENERATOR */}
      {!showQuiz && !showFeedback && (
        <motion.div
          className="bg-gray-800/90 rounded-2xl shadow-lg w-full md:w-1/2 p-6 md:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            🎯 Generate Your Quiz
          </h2>
          <form onSubmit={handleGenerateQuiz} className="flex flex-col gap-4 md:gap-6">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type a topic or text..."
              className="w-full p-3 md:p-4 rounded-lg bg-gray-700 text-white h-24 md:h-32 resize-none text-sm md:text-lg"
            />

            <div className="flex flex-col gap-2">
              <label className="text-gray-300 font-semibold">📄 Upload File (optional)</label>
              <input
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="p-2 bg-gray-700 rounded-lg"
              />
              {file && <p className="text-sm text-green-400 truncate">✅ {file.name}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-300 font-semibold">⚙️ Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="p-3 rounded-lg bg-gray-700 text-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 px-4 md:px-6 py-3 rounded-lg font-semibold text-white text-base md:text-lg"
              whileHover={{ scale: 1.05 }}
            >
              {loading ? "Generating..." : "Generate Quiz"}
            </motion.button>
          </form>
        </motion.div>
      )}

      {/* QUIZ DISPLAY */}
      {showQuiz && quiz && !showFeedback && (
        <div className="w-full md:w-3/4 flex flex-col items-center gap-6">
          {/* Question Timeline */}
          <div className="flex flex-wrap justify-center gap-2">
            {quiz.questions.map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition 
                  ${
                    answeredStatus[i] === "correct"
                      ? "bg-green-600 border-green-400"
                      : answeredStatus[i] === "wrong"
                      ? "bg-red-600 border-red-400"
                      : answeredStatus[i] === "skipped"
                      ? "bg-yellow-600 border-yellow-400"
                      : i === currentQ
                      ? "bg-purple-600 border-purple-400"
                      : "bg-gray-700 border-gray-500"
                  }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Timer */}
          <div className="text-lg md:text-xl font-bold text-indigo-400">
            ⏳ Time Left: {timeLeft}s
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQ}
            className="p-4 md:p-8 bg-gray-800 rounded-2xl shadow-lg w-full overflow-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-semibold text-lg md:text-2xl mb-4 md:mb-6">
              Q{currentQ + 1}. {quiz.questions[currentQ].question}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {quiz.questions[currentQ].options.map((opt, idx) => {
                const selected = answers[currentQ] === idx;
                const isCorrect = submitted && quiz.questions[currentQ].answer === idx;
                const isWrong = submitted && selected && quiz.questions[currentQ].answer !== idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(currentQ, idx)}
                    disabled={submitted || timeLeft === 0}
                    className={`p-3 md:p-4 rounded-lg border transition text-left text-sm md:text-lg 
                      ${selected && !submitted ? "bg-purple-700 border-purple-400" : "bg-gray-900 border-purple-500 hover:bg-purple-700/70"}
                      ${isCorrect ? "bg-green-600 border-green-400" : ""}
                      ${isWrong ? "bg-red-600 border-red-400" : ""}
                    `}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div className="mt-4 p-3 md:p-4 bg-gray-700 rounded-lg text-gray-200 text-sm md:text-base">
                💡 {quiz.questions[currentQ].explanation || "No explanation provided."}
              </div>
            )}

            <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              {!submitted ? (
                <>
                  <motion.button
                    onClick={handleSubmitQuestion}
                    className="bg-indigo-600 hover:bg-indigo-700 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-white text-base md:text-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    Submit Answer
                  </motion.button>
                  <motion.button
                    onClick={handleSkipQuestion}
                    className="bg-yellow-600 hover:bg-yellow-700 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-white text-base md:text-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    Skip Question
                  </motion.button>
                </>
              ) : (
                <motion.button
                  onClick={handleNextQuestion}
                  className="bg-purple-600 hover:bg-purple-700 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-white text-base md:text-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  {currentQ === quiz.questions.length - 1 ? "Finish Quiz" : "Next Question →"}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* FEEDBACK PAGE */}
      {showFeedback && (
        <motion.div
          className="bg-gray-800 p-6 md:p-8 rounded-2xl w-full md:w-1/2 text-center flex flex-col gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-purple-400">🎉 Quiz Completed!</h2>
          <p className="text-gray-300 text-sm md:text-base">
            You scored {score} / {quiz.questions.length}
          </p>

          <h3 className="text-lg md:text-xl font-semibold">📝 Feedback</h3>
          <div className="flex flex-col gap-3">
            <select
              className="p-3 bg-gray-700 rounded-lg"
              value={feedback.rating}
              onChange={(e) => setFeedback({ ...feedback, rating: e.target.value })}
            >
              <option value="">Rate your experience</option>
              <option>Excellent</option>
              <option>Good</option>
              <option>Average</option>
              <option>Poor</option>
            </select>
            <textarea
              className="p-3 bg-gray-700 rounded-lg h-24 resize-none"
              placeholder="Any suggestions..."
              value={feedback.comments}
              onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
            />
            <motion.button
              onClick={handleFeedbackSubmit}
              className="bg-green-600 hover:bg-green-700 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-white text-base md:text-lg"
              whileHover={{ scale: 1.05 }}
            >
              Submit Feedback
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
