import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const LoginModal: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register">(
    location.pathname.includes("register") ? "register" : "login"
  );

  const { username, email, password, confirmPassword } = formData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (activeTab === "register" && password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      setLoading(true);
      const endpoint = activeTab === "login" ? "login" : "register";
      const payload =
        activeTab === "login"
          ? { email, password }
          : { username, email, password };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/${endpoint}`,
        payload
      );

      if (activeTab === "login") {
        localStorage.setItem("userToken", response.data.token);
        localStorage.setItem("userName", response.data.username);
        navigate("/dashboard");
      } else {
        setActiveTab("login");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `${activeTab} failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/login");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-drift-orange via-drift-pink to-drift-blue z-50">
      <div className="relative w-[400px] bg-white rounded shadow-2xl border border-drift-purple">
        <div className="relative bg-drift-pink text-center text-drift-blue text-3xl py-4 font-medium rounded-t">
          {activeTab === "login" ? "Login" : "Register"}
          <button
            onClick={handleClose}
            className="absolute top-1/2 -translate-y-1/2 right-2 text-white bg-drift-purple rounded-full w-6 h-6 flex items-center justify-center hover:bg-drift-blue pb-2"
          >
            ×
          </button>
        </div>

        <div className="flex justify-around border-b text-lg">
          <button
            onClick={() => setActiveTab("login")}
            className={`py-2 w-1/2 transition-all duration-200 ${
              activeTab === "login"
                ? "border-b-4 border-drift-pink text-black font-semibold"
                : "text-gray-500"
            }`}
          >
            login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`py-2 w-1/2 transition-all duration-200 ${
              activeTab === "register"
                ? "border-b-4 border-drift-pink text-black font-semibold"
                : "text-gray-500"
            }`}
          >
            register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {activeTab === "register" && (
            <input
              className="w-full px-4 py-2 rounded-full bg-drift-pink/30 placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-drift-orange"
              type="text"
              name="username"
              value={username}
              onChange={handleChange}
              required
              placeholder="Username: enter username..."
            />
          )}

          <input
            className="w-full px-4 py-2 rounded-full bg-drift-pink/30 placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-drift-orange"
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            required
            placeholder="Email: enter email..."
          />

          <input
            className="w-full px-4 py-2 rounded-full bg-drift-pink/30 placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-drift-orange"
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            required
            placeholder="Password: enter password..."
          />

          {activeTab === "register" && (
            <input
              className="w-full px-4 py-2 rounded-full bg-drift-pink/30 placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-drift-orange"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm Password: re-enter password..."
            />
          )}

          <button
            className="w-full py-2 rounded-full bg-drift-pink text-drift-blue font-semibold hover:bg-pink-600 transition duration-200"
            type="submit"
            disabled={loading}
          >
            {loading
              ? activeTab === "login"
                ? "Logging in..."
                : "Registering..."
              : "Submit"}
          </button>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
