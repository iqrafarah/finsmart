import React, { useEffect, useState } from "react";
import "./UserProfile.css";
import Menu from "../Menu/Menu";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3001/get-profile", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setName(data.name);
        setEmail(data.email);
        console.log(data);
      });
  }, []);

  async function handleLogout() {
    const response = await fetch("http://localhost:3001/logout", {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      window.location.href = "/login";
      console.log("Logout successful");
    } else {
      console.error("Logout failed");
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!name) newErrors.name = "Name is required";
    if (!email) newErrors.email = "Email is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      fetch("http://localhost:3001/update-profile", {
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
          if (data.message === "Password must be at least 6 characters") {
            setSuccessMessage("");
            setErrors("Password must be at least 6 characters");
          }
          if (data.message === "Email already exists") {
            setSuccessMessage("");
            setErrors("Email already exists");
          }
          if (data.message === "All fields are required") {
            setSuccessMessage("");
            setErrors({ name: "All fields are required" });
          }
          if (data.message === "Update successful!") {
            console.log("Success:", data);
            setErrors("");
            setSuccessMessage("Update successful!");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  return (
    <div className="user-profile">
      <Menu />
      <div className="user-profile-container">
        <h2>Profile</h2>

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
            {errors.password && <div className="error">{errors.password}</div>}
          </div>

          {successMessage && <div className="success">{successMessage}</div>}

          <p onClick={handleLogout} className="logout">
            <i class="fa-regular fa-arrow-right-from-bracket"></i>
            <span> Logout</span>
          </p>
          <button type="submit" className="main-btn profile-btn">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
