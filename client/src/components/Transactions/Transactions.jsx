import React, { useEffect, useState } from "react";

import "./Transactions.css";
import Menu from "../Menu/Menu";
import income from "../../assets/income.png";
import outcome from "../../assets/outcome.png";
import check from "../../assets/check.png";
import warning from "../../assets/warning.png";

const Transactions = () => {
  const [from, setFrom] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [errors, setErrors] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

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
            const row = e.target.parentElement;
            const id = row.id;
            setSelectedTransaction(id);
          }
        });
        const tableBody = document.getElementById("table-body");

        while (tableBody.firstChild) {
          tableBody.removeChild(tableBody.firstChild);
        }

        data.forEach((item) => {
          const row = document.createElement("tr");
          row.id = item._id;
          row.addEventListener("click", (e) => {
            createTransaction(e);
            setSelectedTransaction(item._id);
            (() => {
              getTransaction(item._id);
            })();
          });

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

  const getTransaction = (id) => {
    fetch(`http://localhost:3001/get-transaction-info/${id}`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setFrom(data.from);
        setAmount(data.amount);
        setType(data.type);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const updateTransaction = (e, id) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    fetch(`http://localhost:3001/update-transaction/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        document.querySelector("form").reset();
        setFrom("");
        setAmount("");
        setType("");
        fetchTransactions();
        showSuccessMessage("Transaction has been updated");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!from) newErrors.from = "Fill in the title";
    if (!amount) newErrors.amount = "Fill in the amount";
    if (!type) newErrors.type = "Select income or expenses";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      if (selectedTransaction) {
        updateTransaction(e, selectedTransaction);
      } else {
        fetch("http://localhost:3001/create-transaction", {
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
            setFrom("");
            setAmount("");
            setType("");

            showSuccessMessage("Transaction has been created");

            fetchTransactions();
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    }
  };

  useEffect(() => {
    fetchTransactions();
    const searchBar = document.getElementById("searchBar");
    searchBar.addEventListener("input", search);
    return () => {
      searchBar.removeEventListener("input", search);
    };
  }, []);

  const deleteTransaction = () => {
    console.log("delete transaction");
    document
      .querySelector(".success-message")
      .classList.add("transaction-active");

    if (selectedTransaction) {
      document
        .querySelector(".create-new")
        .classList.remove("transaction-active");

      document.querySelector(".success-message").innerHTML = `
      <div class="delete-transaction">
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
          fetch(
            `http://localhost:3001/delete-transaction/${selectedTransaction}`,
            {
              method: "DELETE",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
            .then((response) => response.json())
            .then((data) => {
              if (data.message === "Transaction deleted successfully!") {
                fetchTransactions();
                setSelectedTransaction(null);
                showSuccessMessage("Transaction has been deleted");
              }
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        });

      document.querySelector("#cancel-delete").addEventListener("click", () => {
        document
          .querySelector(".success-message")
          .classList.remove("transaction-active");
      });
    } else {
      console.log("No transaction selected");
    }
  };

  const createTransaction = (e) => {
    setFrom("");
    setAmount("");
    setType("");
    setSelectedTransaction(null);

    if (e && e.target.tagName === "TD") {
      document.querySelector(".deleteBtn").style.display = "block";
      document.querySelector(".createBtn").innerHTML = "Update";
    } else {
      document.querySelector(".deleteBtn").style.display = "none";
    }
    document.querySelector(".create-new").classList.add("transaction-active");
  };

  const close = (e) => {
    document
      .querySelector(".create-new")
      .classList.remove("transaction-active");
  };

  const showSuccessMessage = (message) => {
    document
      .querySelector(".create-new")
      .classList.remove("transaction-active");
    document
      .querySelector(".success-message")
      .classList.add("transaction-active");
    document.querySelector(".success-message").innerHTML = `
          <div class="success-alert">	
            <img src=${check} alt="" />
            <p><b>SUCCESS:</b> ${message}</p>
            </div>
        `;

    setTimeout(() => {
      document
        .querySelector(".success-message")
        .classList.remove("transaction-active");
    }, 2000);
  };

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

  return (
    <div className="transactions">
      <Menu />
      <div className="transactions-container">
        <div className="top-header">
          <h2>Transactions</h2>
          <div className="top-right-header">
            <div className="search-container">
              <input
                type="search"
                id="searchBar"
                placeholder="Search transactions"
              />
              <i class="fa-solid fa-magnifying-glass"></i>{" "}
            </div>
            <button onClick={createTransaction} className="transaction-btn">
              <i class="fa-regular fa-plus"></i> Add New
            </button>
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

      <div className="success-message"></div>
      <div className="error-message"></div>

      <div className="create-new">
        <div className="top">
          <h3>Fill in the transaction</h3>
          <i class="fa-regular fa-xmark" onClick={close}></i>
        </div>
        <form method="post" onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="from"
            placeholder="from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={errors.from && "input-error"}
          />
          {errors.from && <div className="error">{errors.from}</div>}

          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            placeholder="Amount"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={errors.amount && "input-error"}
          />
          {errors.amount && <div className="error">{errors.amount}</div>}

          <label htmlFor="Income/expenses ">Income/expenses </label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={errors.type && "input-error"}
          >
            <option
              value="Select income or expenses"
              defaultValue="Select income or expenses"
              hidden
            >
              Select income or expenses
            </option>
            <option className="option" value="income">
              Income
            </option>
            <option className="option" value="expenses">
              Expenses
            </option>
          </select>
          {errors.type && <div className="error">{errors.type}</div>}

          <div className="bottom">
            <button className="createBtn">
              <i class="fa-regular fa-plus"></i>Create
            </button>
            <i
              className="fa-regular fa-trash deleteBtn"
              onClick={deleteTransaction}
            ></i>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Transactions;
