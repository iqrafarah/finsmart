import "./Lessons.css";
import React, { useState, useEffect } from "react";
import Menu from "../Menu/Menu";
import { useNavigate } from "react-router-dom";

const Lessons = () => {
  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [blogContent, setBlog] = useState("");
  const [lesson, setLesson] = useState([]);
  const Navigate = useNavigate();

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
    const searchBar = document.getElementById("searchBar");
    searchBar.addEventListener("input", search);
    return () => {
      searchBar.removeEventListener("input", search);
    };
  }, []);

  const search = () => {
    const searchBar = document.getElementById("searchBar");
    const searchValue = searchBar.value.toLowerCase();

    const cards = document.querySelectorAll(".lesson-card");
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      if (text.includes(searchValue)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  };
  const LessonPost = (e) => {
    if (e.target.parentElement) {
      Navigate(`/lesson-post/${e.target.id}`);
    }
  };

  return (
    <div className="lessons">
      <Menu />
      <div className="lessons-container">
        <div className="top-header">
          <h2>Financial Tips & Tricks</h2>
          <div className="top-right-header">
            <div className="search-container">
              <input
                type="search"
                id="searchBar"
                placeholder="Search Lesson..."
              />
              <i class="fa-solid fa-magnifying-glass"></i>
            </div>
          </div>
        </div>
        <div className="lesson-cards">
          {lesson.map((item, index) => (
            <div className="lesson-card" key={item._id}>
              <img
                className="card-img"
                src={`http://localhost:3001/uploads/${item.img}`}
                alt=""
              />
              <div className="card-info">
                <span>
                  {new Date("2024-02-23").toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <h2>{item.title}</h2>
                <p>{item.blogContent}</p>
                <button key={index} id={item._id} onClick={LessonPost}>
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lessons;
