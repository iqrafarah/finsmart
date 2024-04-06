import "./Lesson-post.css";
import Menu from "../Menu/Menu";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

const LessonPost = () => {
  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [blogContent, setBlog] = useState("");
  const [lesson, setLesson] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [prevId, setPrevId] = useState(null);
  const [nextId, setNextId] = useState(null);

  const getLesson = (id) => {
    fetch(`http://localhost:3001/get-lesson-info/${id}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setImage(data.img);
        setTitle(data.title);
        setBlog(data.blogContent);
        setPrevId(data.prevId);
        setNextId(data.nextId);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getLesson(id);
    }
  }, [id]);

  return (
    <div className="lesson-post">
      <Menu />
      <div className="lesson-post-container">
        <h1>{title}</h1>
        <img src={`http://localhost:3001/uploads/${image}`} alt={title} />
        {blogContent.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}

        <div className="pagination">
          {prevId && (
            <Link to={`/lesson-post/${prevId}`} className="prev">
              <i class="fa-solid fa-arrow-left-long"></i> Previous
            </Link>
          )}
          {nextId && (
            <Link to={`/lesson-post/${nextId}`} className="next">
              Next <i class="fa-solid fa-arrow-right-long"></i>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPost;
