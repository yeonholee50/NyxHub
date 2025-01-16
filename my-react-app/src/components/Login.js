import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Login - LeetCodeTwitter";
  }, []);
  const handleLogin = async () => {
    
    try {
      const response = await axios.post("https://design-twitter.onrender.com/login", { username, password });
      setMessage(response.data.message);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", username);  // Store username in localStorage
      navigate("/profile");
    } catch (error) {
      setMessage(error.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br/>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br/>
      <button onClick={handleLogin}>Login</button>
      <p className="message">{message}</p>
      <p>
        Don't have an account?{" "}
        <Link to="/signup" className="signup-link">
          Click here to sign up.
        </Link>
      </p>
    </div>
  );
};

export default Login;