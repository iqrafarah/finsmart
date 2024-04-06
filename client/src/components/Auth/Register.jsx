import React, { useState } from "react";
import "./Auth.css";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!name) newErrors.name = "Name is required";
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      fetch("http://localhost:3001/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Success:", data);
          setErrors("");
          setSuccessMessage("Register successful!");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        })
        .catch((error) => {
          console.error("Error:", error);
          setSuccessMessage("");
          setErrors({ email: "Email already exists" });
        });
    }
  };

  return (
    <div className="Register">
      <div className="register-container">
        <div className="register-form">
          <img src={logo} alt="logo" className="logo" />
          <h2>Create your Finsmart account</h2>
          <p className="intro-p">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
          <form method="post" onSubmit={handleSubmit}>
            <div className="form-group">
              <i class="fa-solid fa-user"></i>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name && "input-error"}
              />
              {errors.name && <div className="error">{errors.name}</div>}
            </div>
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
              {errors.password && (
                <div className="error">{errors.password}</div>
              )}
            </div>
            {successMessage && <div className="success">{successMessage}</div>}

            <button type="submit" className="auth-btn">
              Create Account
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

export default Register;
