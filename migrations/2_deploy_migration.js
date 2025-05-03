const PaymentContract = artifacts.require("PaymentContract");
require("dotenv").config(); // Load environment variables

module.exports = function (deployer) {
  // Get values from environment variables
  const recipientWallet =
    process.env.RECIPIENT_WALLET ||
    "0x39244e7DC4D4E830A2076c91d244336842019c5E";
  const lenderWallet =
    process.env.LENDER_WALLET || "0x101fA24b32b47cf0153AC7f2F9daf06e1445F9a5";
  const paymentAmount = web3.utils.toWei(
    process.env.PAYMENT_AMOUNT || "1",
    "ether"
  );
  const capAmount = web3.utils.toWei(process.env.CAP_AMOUNT || "10", "ether");

  // Deploy the contract with dynamic arguments
  deployer.deploy(
    PaymentContract,
    recipientWallet,
    lenderWallet,
    paymentAmount,
    capAmount
  );
};
