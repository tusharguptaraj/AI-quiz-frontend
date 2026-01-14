import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import robotImg from "../assets/robot.png";
import { auth } from "../firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", userCredential.user);
      setLoading(false);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      switch (err.code) {
  
  default:
    setError("Login failed. Please try again.");
}

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-purple-900 via-black to-indigo-900">
      {/* Left: Robot View */}
      <motion.div
        className="md:w-1/2 flex items-center justify-center p-10"
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={robotImg}
          alt="AI Robot"
          className="w-3/4 max-w-md drop-shadow-[0_0_40px_rgba(168,85,247,0.7)]"
        />
      </motion.div>

      {/* Right: Login Form */}
      <motion.div
        className="md:w-1/2 flex items-center justify-center p-8"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-10 w-full max-w-md text-white">
          <h2 className="text-4xl font-extrabold text-center mb-8 text-purple-300 drop-shadow-lg">
            Welcome Back 🚀
          </h2>

          {error && <p className="text-red-400 text-center mb-4">{error}</p>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-lg bg-white/10 border border-white/30 placeholder-gray-300 text-white focus:ring-2 focus:ring-purple-400 focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-lg bg-white/10 border border-white/30 placeholder-gray-300 text-white focus:ring-2 focus:ring-purple-400 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50"
            >
              {loading ? "Logging In..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-300">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-purple-400 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
