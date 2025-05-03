const express = require("express");
const Router = require("router");
const LoanRouter = Router();
const { createLoan } = require("../controllers/loan.controller");

LoanRouter.post("/create-loan", LoanRouter);

module.exports = LoanRouter;
