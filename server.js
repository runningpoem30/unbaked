const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
const userRoutes = require("./routes/user.routes");
const loanRoutes = require("./routes/loan.routes");
const PORT = 5050;
require("dotenv").config();
const databaseConnect = require("../backend/utils/connectDatabase");
const router = require("router");

const { Loan } = require("../backend/models/user.model");

app.use("/api/user", userRoutes);
app.post("/api/create-loan", async (req, res) => {
  try {
    const { userId, id, amount, months, rate, interest, contractAddress } =
      req.body;
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    await Loan.create({
      userId,
      id,
      amount,
      months,
      rate,
      interest,
      contractAddress,
    });

    res
      .status(201)
      .json({ success: true, message: "Loan created successfully" });
  } catch (error) {
    console.error("Error adding loan:", error.message, {
      requestBody: req.body,
    });
    res.status(400).json({
      success: false,
      message: error.message || "Error adding the loan",
    });
  }
});

const Web3 = require("web3");
const fs = require("fs");
const path = require("path");

// Initialize Web3
const web3 = new Web3("http://localhost:7545");

// Load contract ABI and bytecode
const contractJson = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "./build/contracts/PaymentContract.json")
  )
);
const contractAbi = contractJson.abi;
const contractBytecode = contractJson.bytecode;

// Account setup
const privateKey =
  "0x09bb599366a58a63900b0dbd770a90b1573da676dbe144f55ba31c465f68f4e6";
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

// Store deployed contracts in memory (for demo purposes - use a database in production)
const deployedContracts = {};

// Route to deploy contract
app.post("/deploy-contract", async (req, res) => {
  try {
    const { borrowerAddress, lenderAddress, capAmount } = req.body;

    // Validate inputs
    if (
      !web3.utils.isAddress(borrowerAddress) ||
      !web3.utils.isAddress(lenderAddress)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid borrower or lender address" });
    }
    if (isNaN(capAmount) || capAmount <= 0) {
      return res.status(400).json({ error: "Invalid cap amount" });
    }

    // Fixed reference payment amount (0.1 ETH)
    const referencePaymentAmount = web3.utils.toWei("0.1", "ether");
    const capAmountWei = web3.utils.toWei(capAmount.toString(), "ether");

    console.log(
      `⁠Deploying contract with capAmount: ${capAmount} ETH (${capAmountWei} wei)`
    );
    // Deploy new contract
    const contract = new web3.eth.Contract(contractAbi);
    const deployTx = contract.deploy({
      data: contractBytecode,
      arguments: [
        borrowerAddress,
        lenderAddress,
        referencePaymentAmount,
        capAmountWei,
      ],
    });

    const gas = await deployTx.estimateGas();
    const deployReceipt = await deployTx.send({
      from: account.address,
      gas,
      gasPrice: await web3.eth.getGasPrice(),
    });

    const contractAddress = deployReceipt._address;

    console.log(`contract deployed at ${contractAddress}`);

    // Store contract details
    deployedContracts[contractAddress] = {
      borrowerAddress,
      lenderAddress,
      capAmount: capAmountWei,
    };

    res.status(200).json({
      contractAddress,
      transactionHash: deployReceipt.transactionHash,
      borrowerAddress,
      lenderAddress,
      capAmount: capAmountWei,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Contract deployment failed", details: error.message });
  }
});

// Route to make payment
app.post("/make-payment", async (req, res) => {
  try {
    const { contractAddress, paymentType, paymentAmount } = req.body;

    // Validate inputs
    if (!web3.utils.isAddress(contractAddress)) {
      return res.status(400).json({ error: "Invalid contract address" });
    }
    if (!["borrower", "lender"].includes(paymentType)) {
      return res
        .status(400)
        .json({ error: 'Invalid payment type. Use "borrower" or "lender"' });
    }
    if (
      paymentType === "lender" &&
      (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid payment amount for lender" });
    }

    // Get contract details
    const contractDetails = deployedContracts[contractAddress];
    if (!contractDetails) {
      return res.status(404).json({ error: "Contract not found" });
    }

    const deployedContract = new web3.eth.Contract(
      contractAbi,
      contractAddress
    );

    // Check borrower payment status for borrower type
    if (paymentType === "borrower") {
      const borrowerPaymentMade = await deployedContract.methods
        .borrowerPaymentMade()
        .call();
      if (borrowerPaymentMade) {
        return res
          .status(400)
          .json({ error: "Borrower payment already made for this contract" });
      }
    }

    // Make payment
    let txReceipt;
    let paymentValue;
    if (paymentType === "borrower") {
      paymentValue = contractDetails.capAmount; // Must match capAmount (e.g., 10 ETH)

      console.log(
        `Making borrower payment: ${web3.utils.fromWei(
          paymentValue,
          "ether"
        )} ETH`
      );
      txReceipt = await deployedContract.methods.makeBorrowerPayment().send({
        from: account.address,
        value: paymentValue,
        gas: await deployedContract.methods
          .makeBorrowerPayment()
          .estimateGas({ from: account.address, value: paymentValue }),
        gasPrice: await web3.eth.getGasPrice(),
      });
    } else {
      paymentValue = web3.utils.toWei(paymentAmount.toString(), "ether");

      console.log(
        `Making lender payment: ${paymentAmount} ETH (${paymentValue} wei)`
      );
      if (
        parseFloat(web3.utils.fromWei(contractDetails.capAmount, "ether")) <
        parseFloat(paymentAmount)
      ) {
        return res
          .status(400)
          .json({ error: "Payment amount exceeds cap amount" });
      }
      // Check current lender total to ensure cap is not exceeded
      const lenderTotalReceived = await deployedContract.methods
        .lenderTotalReceived()
        .call();
      if (
        parseFloat(web3.utils.fromWei(lenderTotalReceived, "ether")) +
          parseFloat(paymentAmount) >
        parseFloat(web3.utils.fromWei(contractDetails.capAmount, "ether"))
      ) {
        return res
          .status(400)
          .json({ error: "Lender payment would exceed cap amount" });
      }
      txReceipt = await deployedContract.methods.makeLenderPayment().send({
        from: account.address,
        value: paymentValue,
        gas: await deployedContract.methods
          .makeLenderPayment()
          .estimateGas({ from: account.address, value: paymentValue }),
        gasPrice: await web3.eth.getGasPrice(),
      });
    }

    res.status(200).json({
      contractAddress,
      transactionHash: txReceipt.transactionHash,
      paymentType,
      paymentValue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Payment failed", details: error.message });
  }
});

databaseConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App is listening on PORT ${PORT}`);
    });
  })
  .catch(() => {
    console.log("Error connecting to the database bitch");
  });
