import React, { useEffect, useState } from "react";
import Menu from "../../Menu/Menu.jsx";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [userName, setUserName] = useState("");
  const [totalLessons, setTotalLessons] = useState("0");
  const [totalUsers, setTotalUsers] = useState("0");
  const [lesson, setLesson] = useState([]);
  const [user, setUser] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/get-profile", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUserName(data.name.split(" ")[0]);
      })
      .catch((error) => {
        console.error("Error fetching profile", error);
      });
  }, []);

  const getUsers = () => {
    fetch("http://localhost:3001/get-users", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUser(data.users);
        setTotalUsers(data.users.length);
        setTotalLessons(data.lesson.length);
      })
      .catch((error) => {
        console.error("Error fetching users", error);
      });
  };

  const fetchLessons = () => {
    fetch("http://localhost:3001/get-lesson", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setLesson(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    fetchLessons();
    getUsers();
  }, []);

  return (
    <div className="admin-dashboard">
      <Menu />
      <div className="admin-dashboard-container">
        <h3>Welcome back, {userName}</h3>

        <div className="dashboard-items">
          <div className="dashboard-item admin-item">
            <div className="dashboard-icon">
              <i class="fa-solid fa-books"></i>
              <span className="dashboard-title">Total Lessons</span>
            </div>

            <div className="dashboard-amount">
              <span className="amount">{totalLessons}</span>
            </div>
          </div>

          <div className="dashboard-item admin-item">
            <div className="dashboard-icon">
              <i class="fa-solid fa-book-open-reader"></i>
              <span className="dashboard-title">Total Readers</span>
            </div>
            <div className="dashboard-amount">
              <span className="amount">{totalUsers}</span>
            </div>
          </div>

          <div className="dashboard-item admin-item">
            <div className="dashboard-icon">
              <i class="fa-duotone fa-users"></i>
              <span className="dashboard-title">Total users</span>
            </div>
            <div className="dashboard-amount">
              <span className="amount">{totalUsers}</span>
            </div>
          </div>
        </div>

        <div className="admin-dashboard-content">
          <div className="admin-users">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {user.map((user) => (
                  <tr key={user._id} id={user._id} onClick={(e) => {}}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-lessons">
            <table>
              <thead>
                <tr>
                  <th>#</th>

                  <th>Title</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody id="table-body">
                {lesson.map((lesson, index) => (
                  <tr key={lesson._id} id={lesson._id} onClick={(e) => {}}>
                    <td>{index + 1}</td>
                    <td>{lesson.title}</td>
                    <td>
                      <div class="clamp">{lesson.blogContent}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
