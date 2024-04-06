import React, { useState } from "react";
import "./Auth.css";
import logo from "../../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";

const Newpassword = () => {
  const [Newpassword, setNewpassword] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const resetToken = searchParams.get("token");
  console.log(resetToken);
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!Newpassword) newErrors.Newpassword = "Newpassword is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const formData = new FormData(e.target);
      const data = {};

      console.log(data);
      fetch("http://localhost:3001/new-password", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resetToken, password: Newpassword }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data.message);
          if (data.message === "Password must be at least 6 characterss") {
            setSuccessMessage("");
            setErrors({
              Newpassword: "Password must be at least 6 characters",
            });
          }
          if (data.message === "New password created successfully!") {
            setSuccessMessage("New password created successfully!");
            setTimeout(() => {
              navigate("/login");
            }, 5000);
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
          <h2>New password</h2>
          <p className="intro-p"></p>
          <form method="post" onSubmit={handleSubmit}>
            <div className="form-group">
              <i class="fa-solid fa-lock"></i>
              <input
                type="password"
                id="Newpassword"
                name="Newpassword"
                placeholder="New password"
                value={Newpassword}
                onChange={(e) => setNewpassword(e.target.value)}
                className={errors.Newpassword && "input-error"}
              />
              {errors.Newpassword && (
                <div className="error">{errors.Newpassword}</div>
              )}
            </div>

            <button type="submit" className="auth-btn">
              Save password
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

export default Newpassword;
