import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Menu from "../Menu/Menu.jsx";
import BarChart from "../chart/chart.jsx";
import check from "../../assets/check.png";
import warning from "../../assets/warning.png";
import income from "../../assets/income.png";
import outcome from "../../assets/outcome.png";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [totalIncome, setTotalIncome] = useState("0");
  const [totalExpense, setTotalExpense] = useState("0");
  const [totalSavings, setTotalSavings] = useState("0");
  const [lesson, setLesson] = useState([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [goal, setGoal] = useState("");
  const [errors, setErrors] = useState({});
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const Navigate = useNavigate();

  const [chartData, setChartData] = useState([]);

  const fetchTransactions = () => {
    fetch("http://localhost:3001/get-transaction", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setTransactions(data);

        const table = document.querySelector("table");
        table.addEventListener("click", (e) => {
          if (e.target.tagName === "TD") {
          }
        });
        const tableBody = document.getElementById("table-body");

        while (tableBody.firstChild) {
          tableBody.removeChild(tableBody.firstChild);
        }

        data.forEach((item) => {
          const row = document.createElement("tr");
          row.id = item._id;

          row.innerHTML = `
            <td>
              <img src=${item.type === "expenses" ? outcome : income} alt="" />
            </td>
            <td>${item.from}</td>
            <td>
              <span className="income">${item.type}</span>
            </td>
            <td>${new Date(item.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}</td>     
            <td>$${item.amount}</td>
          `;
          tableBody.appendChild(row);
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    fetchProfile();
    fetchLessons();
    incomeResponse();
    fetchGoals();
    fetchTotal();
    fetchTransactions();
  }, []);

  const fetchProfile = () => {
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
  };
  const fetchTotal = () => {
    fetch("http://localhost:3001/get-transaction-total", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setTotalIncome(data.totalIncome.toFixed(2));
        setTotalExpense(data.totalExpense.toFixed(2));
        setTotalSavings(data.totalSavings.toFixed(2));
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
        console.log(data);
        setLesson(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const incomeResponse = () => {
    fetch("http://localhost:3001/income-expenses", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log("Response data:", data); // Log the response data

        const combinedData = {};

        data.forEach((d) => {
          const month = d.month;
          const monthName = new Date(2022, d.month - 1).toLocaleString(
            "default",
            {
              month: "long",
            }
          );
          if (!combinedData[month]) {
            combinedData[month] = { monthName, income: 0, expenses: 0 };
          }
          combinedData[month].income += Number(d.income);
          combinedData[month].expenses += Number(d.expenses);
        });

        // console.log("Combined data:", combinedData); // Log the combined data

        const chartData = Object.values(combinedData)
          .map((item) => [
            {
              month: item.monthName, // Changed label to month
              value: item.income,
              color: "rgb(59, 130, 246)",
            },
            { month: item.monthName, value: item.expenses, color: "#22416d" }, // Changed label to month
          ])
          .flat();

        setChartData(chartData);
        // console.log("Chart data:", chartData); // Log the chart data
      });
  };

  const fetchGoals = () => {
    fetch("http://localhost:3001/fetch-goals", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setGoals(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!title) {
      newErrors.title = "Title is required";
    }
    if (!price) {
      newErrors.price = "Price is required";
    }
    if (!goal) {
      newErrors.goal = "Goal is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const data = {
        title,
        price,
        goal,
      };
      console.log("Data:", data);
      console.log("Selected goal:", selectedGoal);

      if (selectedGoal) {
        updateGoal(e, selectedGoal);
      } else {
        fetch("http://localhost:3001/create-goal", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then((response) => response.json())
          .then((data) => {
            document.querySelector("form").reset();
            setTitle("");
            setPrice("");
            setGoal("");

            showSuccessMessage("Goal created successfully");
            fetchGoals();
            fetchTotal();
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    }
  };

  const getGoal = (id) => {
    console.log("Get goal:", id);
    fetch(`http://localhost:3001/get-goal/${id}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setTitle(data.title);
        setPrice(data.price);
        setGoal(data.goal);
        setSelectedGoal(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const updateGoal = (e, selectedGoal) => {
    e.preventDefault();

    const updatedPrice = Number(price);
    const goalAmount = Number(goal);

    if (updatedPrice >= goalAmount) {
      markGoalAsCompleted(selectedGoal.id, updatedPrice);
    } else {
      const data = {
        title,
        price: updatedPrice,
        goal: goalAmount,
      };

      fetch(`http://localhost:3001/update-goal/${selectedGoal.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          document.querySelector("form").reset();
          setTitle("");
          setPrice("");
          setGoal("");
          showSuccessMessage("Goal updated successfully");
          fetchGoals();
          fetchTotal();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  const markGoalAsCompleted = (id, updatedPrice) => {
    const data = {
      completed: true,
      price: updatedPrice,
    };

    fetch(`http://localhost:3001/mark-goal-as-completed/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Goal completed and price updated:", data);
        showSuccessMessage("Goal completed successfully");
        fetchGoals();
      });
  };

  const createGoals = (e) => {
    console.log("Create goals");
    setTitle("");
    setPrice("");
    setGoal("");
    setSelectedGoal(null);

    console.log(e.target.tagName);
    if (e.target.tagName === "DIV") {
      document.querySelector(".deleteBtn").style.display = "block";
      document.querySelector(
        ".createBtn"
      ).innerHTML = `<i class="fa-regular fa-plus"></i> Update`;
    } else {
    }
    document.querySelector(".create-new").classList.add("goal-active");
  };

  const close = () => {
    document.querySelector(".create-new").classList.remove("goal-active");
  };
  const closeCompleted = () => {
    document.querySelector(".completed").classList.remove("completed-active");
  };

  const deleteGoal = () => {
    console.log("Delete goal:", selectedGoal.id);

    document.querySelector(".success-message").classList.add("goal-active");

    if (selectedGoal) {
      document.querySelector(".create-new").classList.remove("goal-active");
      document.querySelector(".success-message").innerHTML = `
      <div class="delete-goal">
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
          fetch(`http://localhost:3001/delete-goal/${selectedGoal.id}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((response) => response.json())
            .then(() => {
              fetchGoals();
              setSelectedGoal(null);
              showSuccessMessage("Goal deleted successfully");
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        });

      document.querySelector("#cancel-delete").addEventListener("click", () => {
        document
          .querySelector(".success-message")
          .classList.remove("goal-active");
      });
    } else {
      console.log("Create goals");
    }
  };

  const displayCompleted = () => {
    console.log("Display completed");
    document.querySelector(".completed").classList.toggle("completed-active");
  };

  const showSuccessMessage = (message) => {
    document.querySelector(".create-new").classList.remove("goal-active");
    document.querySelector(".success-message").classList.add("goal-active");
    document.querySelector(".success-message").innerHTML = `
          <div class="success-alert">	
            <img src=${check} alt="" />
            <p><b>SUCCESS:</b> ${message}</p>
            </div>
        `;

    setTimeout(() => {
      document
        .querySelector(".success-message")
        .classList.remove("goal-active");
    }, 2000);
  };

  const LessonPost = (e) => {
    if (e.target.parentElement) {
      Navigate(`/lesson-post/${e.target.id}`);
    }
  };

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return (
    <div className="dashboard">
      <Menu />
      <div className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-content">
            <h3>Welcome back, {userName}</h3>

            <div className="dashboard-items">
              <div className="dashboard-item">
                <span className="dashboard-title">Total Income</span>
                <div className="dashboard-amount">
                  <span className="amount">${totalIncome}</span>
                </div>
              </div>
              <div className="dashboard-item">
                <span className="dashboard-title">Total outcome</span>
                <div className="dashboard-amount">
                  <span className="amount">${totalExpense}</span>
                </div>
              </div>

              <div className="dashboard-item">
                <span className="dashboard-title">Total savings</span>
                <div className="dashboard-amount">
                  <span className="amount">${totalSavings}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <BarChart
              data={chartData}
              months={months}
              width={820}
              height={170}
            />
            <div className="months">
              {months.map((month, index) => (
                <span key={index}>{month}</span>
              ))}
            </div>
          </div>

          <div className="scrollable-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>From</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody id="table-body"></tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="goals-container">
            <div className="goals-header">
              <h3>My goals</h3>
              <button className="add-goal" onClick={createGoals}>
                <i class="fa-regular fa-plus"></i> Add goal
              </button>
            </div>
            <span className="view-all" onClick={displayCompleted}>
              View Completed ({goals.filter((goal) => goal.completed).length})
            </span>

            <div className="goals-list">
              {goals
                .filter((goal) => !goal.completed)
                .map((goal) => (
                  <div className="goal-item">
                    <div className="goal-icon">
                      <i class="fa-duotone fa-bullseye"></i>{" "}
                      <div className="goal-status">
                        <div
                          className="goal-title"
                          onClick={(e) => {
                            createGoals(e);
                            getGoal(goal._id);
                            setSelectedGoal({ id: goal._id });
                          }}
                        >
                          {goal.title}
                        </div>
                        <div className="goal-left">
                          ${goal.goal - goal.price} left
                        </div>
                      </div>
                    </div>

                    <div className="goal-progress">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${(goal.price / goal.goal) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="goal-amount">
                      <span>${goal.price}</span>
                      <span>${goal.goal}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="lesson-container">
            <div className="lesson-header">
              <h3>Newest lessons</h3>
              <a href="/lessons" className="view-all">
                View all
              </a>
            </div>

            <div className="lesson-list">
              {lesson.map((lesson, index) => (
                <div className="lesson-item">
                  <div className="lesson-icon"></div>
                  <div
                    className="lesson-title"
                    key={index}
                    id={lesson._id}
                    onClick={LessonPost}
                  >
                    {lesson.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="success-message"></div>
      <div className="completed">
        <div className="goals-header">
          <h3>Completed goals</h3>
          <i class="fa-regular fa-xmark" onClick={closeCompleted}></i>
        </div>
        {goals
          .filter((goal) => goal.completed)
          .map((goal) => (
            <div className="goal-item">
              <div className="goal-icon">
                <i class="fa-duotone fa-bullseye"></i>{" "}
                <div className="goal-status">
                  <div className="goal-title">{goal.title}</div>
                  <div className="goal-left">
                    ${goal.goal - goal.price} left
                  </div>
                </div>
              </div>

              <div className="goal-progress">
                <div
                  className="progress-bar"
                  style={{
                    width: `${(goal.price / goal.goal) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="goal-amount">
                <span>${goal.price}</span>
                <span>${goal.goal}</span>
              </div>
            </div>
          ))}
      </div>

      <div className="create-new">
        <div className="top">
          <h3>Fill in the Goal</h3>
          <i class="fa-regular fa-xmark" onClick={close}></i>
        </div>
        <form method="post" onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            name="lesson"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={errors.title && "input-error"}
          />
          {errors.title && <div className="error">{errors.title}</div>}
          <label htmlFor="price">Price</label>
          <input
            type="number"
            name="price"
            placeholder="How much do you have now?"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={errors.price && "input-error"}
          />
          {errors.price && <div className="error">{errors.price}</div>}

          <label htmlFor="goal">Goal</label>
          <input
            type="number"
            name="goal"
            placeholder="How much do you want to save?"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className={errors.goal && "input-error"}
          />
          {errors.goal && <div className="error">{errors.goal}</div>}
          <div className="bottom">
            <button className="createBtn">
              <i class="fa-regular fa-plus"></i>Create goal
            </button>
            <i class="fa-regular fa-trash deleteBtn" onClick={deleteGoal}></i>
          </div>
        </form>
      </div>
    </div>
  );
}
