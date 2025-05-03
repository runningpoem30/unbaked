// models/ContractDeployment.js
const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema({
  contractAddress: String,
  borrowerWallet: String,
  lenderWallet: String,
  borrowerCapAmount: String,
  lenderCapAmount: String,
  deployedBy: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ContractDeployment", contractSchema);
