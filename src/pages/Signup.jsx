import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import robotImg from "../assets/robot.png";
import { auth } from "../firebase"; 
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    // 1️⃣ Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // 2️⃣ Update Firebase profile with full name
    await updateProfile(userCredential.user, {
      displayName: fullName,
    });

    console.log("User signed up with Firebase:", userCredential.user);

    // 3️⃣ Send data to backend (MongoDB)
    const backendResponse = await fetch("https://intelliq-api.onrender.com/api/user", { // <-- updated URL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        email: email,
        role: "user",           // default role
        dp: "default.jpg"       // placeholder DP
      }),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      throw new Error(data.message || "Failed to save user in backend");
    }

    console.log("User saved in MongoDB:", data);

    setLoading(false);
    navigate("/login");
  } catch (err) {
    console.error(err);

    let message = "";
    switch (err.code) {
      case "auth/email-already-in-use":
        message = "This email is already registered. Try logging in!";
        break;
      case "auth/weak-password":
        message = "Password should be at least 6 characters long.";
        break;
      default:
        message = err.message || "Something went wrong. Please try again.";
    }

    setError(message);
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-tr from-indigo-900 via-black to-purple-900">
      
      {/* Left: Signup Form */}
      <motion.div
        className="md:w-1/2 flex items-center justify-center p-8"
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-10 w-full max-w-md text-white">
          <h2 className="text-4xl font-extrabold text-center mb-8 text-indigo-300 drop-shadow-lg">
            Create Account 🤖
          </h2>

          {error && <p className="text-red-400 text-center mb-4">{error}</p>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-4 rounded-lg bg-white/10 border border-white/30 placeholder-gray-300 text-white focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-lg bg-white/10 border border-white/30 placeholder-gray-300 text-white focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-lg bg-white/10 border border-white/30 placeholder-gray-300 text-white focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-indigo-500/50 disabled:opacity-50"
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-300">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Right: Robot View */}
      <motion.div
        className="md:w-1/2 flex items-center justify-center p-10"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={robotImg}
          alt="AI Robot"
          className="w-3/4 max-w-md drop-shadow-[0_0_40px_rgba(59,130,246,0.7)]"
        />
      </motion.div>
    </div>
  );
}
