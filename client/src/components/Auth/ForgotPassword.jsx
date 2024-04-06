import React, { useState } from "react";
import "./Auth.css";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Handle sending token to email
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      fetch("http://localhost:3001/forgot-password", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Email doesnt exist") {
            setSuccessMessage("");
            setErrors({ email: "Email does not exist" });
          } else if (data.message === "Token send successful!") {
            setSuccessMessage("Token send successful!");
            setTimeout(() => {
              navigate("/new-password");
            }, 1000);
          }
        });
    }
  };

  return (
    <div className="Register">
      <div className="register-container">
        <div className="register-form">
          <img src={logo} alt="logo" className="logo" />
          <form method="post" onSubmit={handleSubmit}>
            <div className="form-group">
              <>
                <h2>Reset Password</h2>
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
              </>

              {successMessage && (
                <div className="success">{successMessage}</div>
              )}
            </div>

            <button type="submit" className="auth-btn">
              Send Link
            </button>
          </form>
        </div>

        <div className="register-image"></div>
      </div>
    </div>
  );
};

export default ForgotPassword;
