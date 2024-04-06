import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./Menu.css";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "../Auth/UserRoleContext";

// In your Menu component, use the useUserRole hook
const Menu = () => {
  const user = useUserRole();
  const navigate = useNavigate();

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

  return (
    <div className="menu">
      <div className="menu-container">
        <div className="top-menu">
          <Link to="/dashboard">
            <img src={logo} alt="logo" className="logo" />
            <span>Finsmart</span>
          </Link>
        </div>
        <div className="middle-menu">
          <ul>
            {user !== "admin" ? (
              <li>
                <NavLink to="/dashboard" activeClassName="active">
                  <i class="fa-solid fa-house"></i> <span>Dashboard</span>
                </NavLink>
              </li>
            ) : (
              <li>
                <NavLink to="/admin-dashboard" activeClassName="active">
                  <i class="fa-solid fa-house"></i> <span>Dashboard</span>
                </NavLink>
              </li>
            )}

            {user !== "admin" ? (
              <li>
                <NavLink to="/transactions" activeclassname="active">
                  <i class="fa-regular fa-arrows-rotate"></i>
                  <span>Transactions</span>
                </NavLink>
              </li>
            ) : (
              ""
            )}

            {user !== "admin" ? (
              <li>
                <NavLink to="/lessons" activeclassname="active">
                  <i class="fa-solid fa-books"></i>
                  <span>Lessons</span>
                </NavLink>
              </li>
            ) : (
              <li>
                <NavLink to="/create-lessons" activeClassName="active">
                  <i class="fa-solid fa-books"></i>
                  <span>Create Lesson</span>
                </NavLink>
              </li>
            )}

            <li>
              <NavLink to="/profile" activeClassName="active">
                <i class="fa-solid fa-user"></i>
                <span>My account</span>
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="bottom-menu">
          <ul>
            <li onClick={handleLogout}>
              <i class="fa-regular fa-arrow-right-from-bracket"></i>
              <span>Logout</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Menu;
