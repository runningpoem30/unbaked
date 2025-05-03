const { Loan } = require("../models/user.model");

const createLoan = async (req, res) => {
  try {
    const { userId, id, amount, months, rate, interest, contractAddress } =
      req.body;

    // Basic validation
    if (!id || !amount || !months || !rate || !interest || !contractAddress) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (id, amount, months, rate, interest, contractAddress) are required",
      });
    }

    // Validate types or ranges (example)
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    await Loan.create({
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
};

module.exports = { createLoan };
