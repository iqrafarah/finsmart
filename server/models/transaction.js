const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  from: {
    type: String,
    require: true,
  },
  type: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
  },
  amount: {
    type: String,
    default: 0,
  },
  userId: {
    type: String,
    require: true,
  },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;
