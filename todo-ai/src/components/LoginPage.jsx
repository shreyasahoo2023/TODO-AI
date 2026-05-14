import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, Key, User, ArrowRight } from "lucide-react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function LoginPage() {
  const { login } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const { access_token } = tokenResponse;
      const res = await axios.post(`${BASE_URL}/auth/google`, {
        token: access_token,
      });

      if (res.data.user) {
        login(res.data.user, access_token);
      }
    } catch (err) {
      console.error(err);
      setError("Google authentication failed");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError("Google Login Failed"),
    flow: "implicit",
    prompt: "select_account",
    use_fedcm_for_prompt: true,
  });

  const handleManualAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        await axios.post(`${BASE_URL}/auth/register`, {
          email,
          name,
          password,
        });

        const res = await axios.post(`${BASE_URL}/auth/login`, {
          email,
          password,
        });

        if (res.data.user && res.data.token) {
          login(res.data.user, res.data.token);
        }
      } else {
        const res = await axios.post(`${BASE_URL}/auth/login`, {
          email,
          password,
        });

        if (res.data.user && res.data.token) {
          login(res.data.user, res.data.token);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs & Effects */}
      <div className="animated-bg" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500 mb-4 shadow-lg shadow-indigo-500/20"
          >
            <Lock className="text-white w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {isRegistering ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {isRegistering ? "Start organizing your life today" : "Please enter your details to sign in"}
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-8 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-white/5">
          {/* SOCIAL LOGIN */}
          <button
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-200 font-medium text-gray-700 dark:text-gray-200"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-500 bg-white/0 backdrop-blur-none">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleManualAuth} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {isRegistering && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                {!isRegistering && (
                  <button type="button" className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">Forgot password?</button>
                )}
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegistering ? "Create account" : "Sign in"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
              }}
              className="text-gray-600 dark:text-gray-400 text-sm hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              {isRegistering
                ? "Already have an account? Sign in"
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}