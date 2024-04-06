import React, { useState, useEffect } from "react";
import "./Auth.css";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  fetch("http://localhost:3001/user-role", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.user) {
        setUser(data.user);
        if (data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      fetch("http://localhost:3001/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
          if (data.message === "Email doesnt exist") {
            setSuccessMessage("");
            setErrors({ email: "Email does not exist" });
          }
          if (data.message === "Password is incorrect") {
            setSuccessMessage("");
            setErrors({ password: "password is incorrect" });
          }

          if (data.message === "User is blocked") {
            setSuccessMessage("");
            setErrors({ password: "User is blocked" });
          }

          if (data.message === "Login successful!") {
            setSuccessMessage("Login successful!");
            if (data.user.role === "admin") {
              setTimeout(() => {
                navigate("/admin-dashboard");
              }, 1000);
            } else {
              setTimeout(() => {
                navigate("/dashboard");
              }, 1000);
            }
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  return (
    <div className="Register">
      <div className="register-container">
        <div className="register-form">
          <img src={logo} alt="logo" className="logo" />
          <h2>Welcome Back.</h2>
          <p className="intro-p">
            New to Finsmart? <a href="/register">Register</a>
          </p>
          <form method="post" onSubmit={handleSubmit}>
            <div className="form-group">
              <i class="fa-solid fa-envelope"></i>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email && "input-error"}
              />
              {errors.email && <div className="error">{errors.email}</div>}
            </div>
            <div className="form-group">
              <i class="fa-solid fa-lock"></i>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password && "input-error"}
              />
              <div className="messages">
                {errors.password && (
                  <div className="error">{errors.password}</div>
                )}
                {successMessage && (
                  <div className="success">{successMessage}</div>
                )}
                <a href="/forgot-password">
                  <p className="forgot-pass">Forgot Password?</p>
                </a>
              </div>
            </div>
            <button type="submit" className="auth-btn">
              Log in
            </button>
          </form>
        </div>
        <div className="register-image">
          <div className="logo"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
