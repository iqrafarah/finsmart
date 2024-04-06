import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import ForgotPassword from "./components/Auth/ForgotPassword";
import NewPassword from "./components/Auth/Newpassword";
import Dashboard from "./components/Dashboard/Dashboard";
import UserProfile from "./components/UserProfile/UserProfile";
import Lessons from "./components/Lessons/Lessons";
import Transactions from "./components/Transactions/Transactions.jsx";
import AdminDashboard from "./components/Admin/AdminDashboard/AdminDashboard";
import AdminLessons from "./components/Admin/Lessons/Lessons";
import LessonPost from "./components/lesson-post/Lesson-post";
import { UserRoleProvider } from "./components/Auth/UserRoleContext";

function App() {
  return (
    <div className="App">
      <Router>
        <UserRoleProvider>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/new-password" element={<NewPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/create-lessons" element={<AdminLessons />} />
            <Route path="/lesson-post/:id" element={<LessonPost />} />
          </Routes>
        </UserRoleProvider>
      </Router>
    </div>
  );
}

export default App;
