// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import robotImg from "../assets/robot.png";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

export default function App() {
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white font-sans min-h-screen scroll-smooth">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-gray-900/70 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 tracking-wide">
  <img
    src={logo}
    alt="INTELLIQ Logo"
    className="h-15 w-auto inline-block"
  />
</h1>


       

        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg border border-purple-500 hover:bg-purple-600 transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition"
          >
            Signup
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-10 py-20">

        {/* Left Side */}
        <motion.div
          className="md:w-1/2 text-center md:text-left"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
              AI-Powered
            </span>{" "}
            Quiz Generator ⚡
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            IntelliQ makes learning fun and smart. Instantly generate quizzes,
            track your performance, and share with friends or students.
          </p>
          <a href="/signup">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 text-lg rounded-xl shadow-lg"
          >
            
            Get Started Free 🚀
            
          </motion.button>
          </a>
        </motion.div>

        {/* Right Side */}
        <motion.div
          className="md:w-1/2 flex justify-center mt-10 md:mt-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 1 } }}
        >
          <motion.img
            src={robotImg}
            alt="AI Robot"
            className="w-72 h-72 object-contain drop-shadow-lg"
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-10 grid md:grid-cols-3 gap-10">
        {[
          {
            icon: "🤖",
            title: "AI Quiz Generator",
            desc: "Generate quizzes instantly with AI, customized to any topic.",
          },
          {
            icon: "📊",
            title: "Performance Tracking",
            desc: "Get detailed insights on progress, strengths, and weaknesses.",
          },
          {
            icon: "🌍",
            title: "Quiz Access",
            desc: "Access your quizzes after attempting the quiz for better learning.",
          },
        ].map((f, i) => (
          <motion.div
            key={i}
            className="p-8 bg-gray-800/80 rounded-2xl shadow-lg hover:scale-105 transition transform"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
          >
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
            <p className="text-gray-400">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* About Section */}
      <motion.section
        id="about"
        className="py-20 px-10 text-center max-w-3xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold mb-6">About IntelliQ</h2>
        <p className="text-gray-400">
          IntelliQ is built to revolutionize learning with AI-powered quizzes,
          adaptive learning, and performance insights. Whether you're a student,
          teacher, or professional, IntelliQ helps you grow smarter every day.
        </p>
      </motion.section>

      {/* Call to Action */}
      <a href="/signup">
      <motion.section
        id="contact"
        className="text-center py-20 bg-gradient-to-r from-purple-700 to-indigo-700"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl font-bold mb-6">Ready to Try IntelliQ?</h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-purple-700 font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-gray-200"
        >
            
          Start Free Today
          
        </motion.button>
      </motion.section></a>

      {/* Footer */}
      <footer className="bg-gray-900 text-center py-6 text-gray-400">
        © {new Date().getFullYear()} IntelliQ. All rights reserved by Radhika Sharma / Tushar Gupta.
      </footer>
    </div>
  );
}
