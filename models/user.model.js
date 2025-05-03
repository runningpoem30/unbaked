const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
  },
  creditScore: {
    type: Number,
  },
});

const loanSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  amount: {
    type: Number,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  interest: {
    type: Number,
    required: true,
  },
  contractAddress: {
    type: Number,
    required: true,
  },
  months: {
    type: Number,
    requird: true,
  },
});
//loan schema
//uid
//person who created the loan
//wallet address
//amount listed
//terms - duration
//interest
//receipient

module.exports = {
  User: mongoose.model("User", userSchema),
  Loan: mongoose.model("Loan", loanSchema),
};
