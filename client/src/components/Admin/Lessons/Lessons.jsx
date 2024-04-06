import "./Lessons.css";
import Menu from "../../Menu/Menu";
import { useState } from "react";
import { useEffect } from "react";
import check from "../../../assets/check.png";
import warning from "../../../assets/warning.png";

const AdminLessons = () => {
  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [blogContent, setBlog] = useState("");
  const [lesson, setLesson] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [errors, setErrors] = useState({});

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
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const getImages = () => {
    fetch("http://localhost:3001/get-images", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setImage(data[0].img);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    getImages();
    fetchLessons();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!image) newErrors.image = "upload a image";
    if (!title) newErrors.title = "Fill in the title";
    if (!blogContent) newErrors.blogContent = "fill in the blog content";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("title", title);
      formData.append("blogContent", blogContent);

      if (selectedLesson) {
        updateLesson(e, selectedLesson);
        console.log("update lesson");
      } else {
        fetch("http://localhost:3001/create-lesson", {
          method: "POST",
          credentials: "include",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data) {
              document.querySelector("form").reset();
              setImage("");
              setTitle("");
              setBlog("");

              showSuccessMessage("Lesson has been created");

              fetchLessons();
            } else {
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    }
  };

  const updateLesson = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);
    formData.append("blogContent", blogContent);

    console.log(selectedLesson, "selected lesson");
    fetch(`http://localhost:3001/update-lesson/${selectedLesson}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        document.querySelector("form").reset();
        setImage("");
        setTitle("");
        setBlog("");
        fetchLessons();
        showSuccessMessage("Lesson has been updated");
      });
  };

  const deleteLesson = () => {
    console.log("delete Lesson");
    console.log(selectedLesson, "selected q");
    document.querySelector(".success-message").classList.add("lessons-active");

    if (selectedLesson) {
      document.querySelector(".create-new").classList.remove("lessons-active");

      document.querySelector(".success-message").innerHTML = `
      <div class="delete-lesson">
      <img src=${warning} alt="" />
      <h3>Warning!</h3>
        <p>Your transaction will be deleted and this cannot be undone.</p>
      <div class="buttons">
      <button id="confirm-delete">Delete</button>
      <button id="cancel-delete">Cancel</button>
      </div>
      </div>
      
    `;

      document
        .querySelector("#confirm-delete")
        .addEventListener("click", () => {
          fetch(`http://localhost:3001/delete-lesson/${selectedLesson}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((response) => response.json())
            .then((data) => {
              console.log(data);
              if (data.message === "Lesson deleted successfully!") {
                fetchLessons();
                setSelectedLesson(null);
                showSuccessMessage("Lesson has been deleted");
              }
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        });

      document.querySelector("#cancel-delete").addEventListener("click", () => {
        document
          .querySelector(".success-message")
          .classList.remove("lessons-active");
      });
    } else {
      console.log("No Lesson selected");
    }
  };

  const createLesson = (e) => {
    setImage("");
    setTitle("");
    setBlog("");
    setSelectedLesson(null);

    if (
      (e && e.target.tagName === "TD") ||
      e.target.parentElement.tagName === "TD" ||
      e.target.parentElement.tagName === "TR"
    ) {
      setSelectedLesson(e.target.parentElement.id);
      document.querySelector(".deleteBtn").style.display = "block";
      document.querySelector(".createBtn").innerHTML = "Update";
    } else {
      document.querySelector(".deleteBtn").style.display = "none";
    }
    document.querySelector(".create-new").classList.toggle("lessons-active");
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

    const rows = document.querySelectorAll("tr");
    rows.forEach((row, index) => {
      if (index === 0) return;
      const text = row.textContent.toLowerCase();
      if (text.includes(searchValue)) {
        row.style.display = "table-row";
      } else {
        row.style.display = "none";
      }
    });
  };

  const close = (e) => {
    document.querySelector(".create-new").classList.remove("lessons-active");
  };

  const showSuccessMessage = (message) => {
    document.querySelector(".create-new").classList.remove("lessons-active");
    document.querySelector(".success-message").classList.add("lessons-active");
    document.querySelector(".success-message").innerHTML = `
          <div class="success-alert">	
            <img src=${check} alt="" />
            <p><b>SUCCESS:</b> ${message}</p>
            </div>
        `;

    setTimeout(() => {
      document
        .querySelector(".success-message")
        .classList.remove("lesson-active");
    }, 2000);
  };

  return (
    <div className="lessons">
      <Menu />
      <div className="lessons-container">
        <div className="top-header">
          <h2>Lesson</h2>
          <div className="top-right-header">
            <div className="search-container">
              <input
                type="search"
                id="searchBar"
                placeholder="Search Lesson..."
              />
              <i class="fa-solid fa-magnifying-glass"></i>
            </div>
            <button onClick={createLesson} className="lesson-btn">
              <i class="fa-regular fa-plus"></i> Add New
            </button>
          </div>
        </div>
        <div className="scrollable-table">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>
                  <i class="fa-regular fa-image"></i>{" "}
                </th>
                <th>Title</th>
                <th>Summary</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody id="table-body">
              {lesson.map((lesson, index) => (
                <tr
                  key={lesson._id}
                  id={lesson._id}
                  onClick={(e) => {
                    setSelectedLesson(lesson._id);
                    createLesson(e);
                    getLesson(lesson._id);
                  }}
                >
                  <td>{index + 1}</td>
                  <td>
                    <img
                      className="table-img"
                      src={`http://localhost:3001/uploads/${lesson.img}`}
                      alt=""
                    />
                  </td>
                  <td>{lesson.title}</td>
                  <td>
                    <div class="clamp">{lesson.blogContent}</div>
                  </td>
                  <td>
                    {new Date("2024-02-23").toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="success-message"></div>

        <div className="create-new">
          <div className="top">
            <h3>Fill in the Lesson</h3>
            <i class="fa-regular fa-xmark" onClick={close}></i>
          </div>
          <form
            method="post"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
          >
            <label
              htmlFor="image"
              className="custom-file-upload"
              style={{ backgroundImage: `url(${image})` }}
            >
              <i class="fa-solid fa-cloud-arrow-up"></i>
              {image ? "1 image selected" : " Upload image"}
              <input
                accept="image/*"
                type="file"
                id="image"
                name="image"
                placeholder="Upload Image"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setImage(file);
                }}
                style={{ display: "none" }}
              />
            </label>
            {errors.image && <p className="error">{errors.image}</p>}

            <label htmlFor="title" className="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <p className="error">{errors.title}</p>}

            <label htmlFor="Income/expenses ">blog Content </label>
            <textarea
              id="blogContent"
              name="blogContent"
              placeholder="Fill in the blog content"
              value={blogContent}
              onChange={(e) => setBlog(e.target.value)}
            ></textarea>

            {errors.blogContent && (
              <p className="error">{errors.blogContent}</p>
            )}

            <div className="bottom">
              <button className="createBtn">
                <i class="fa-regular fa-plus"></i> Create blog
              </button>
              <i
                className="fa-regular fa-trash deleteBtn"
                onClick={deleteLesson}
              ></i>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLessons;
