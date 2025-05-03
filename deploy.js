const Web3 = require("web3");
const fs = require("fs");
require("dotenv").config();

const web3 = new Web3("http://127.0.0.1:7545");

// Replace with your compiled contract
const contractJson = require("./build/contracts/PaymentContract.json");

// 👇 Replace or load from .env
const deployerAddress = "0x39244e7DC4D4E830A2076c91d244336842019c5E";
const deployerPrivateKey =
  "0xdbb64529412e719bba3f1d460d6227eb85265e4719f94b6392b338e5777d4836";

// 👇 Provide these dynamically or hardcode for testing
const borrowerWallet = "0xd7aa49b05064b6978292f4e5499c23F8f51a9431";
const lenderWallet = "0xe036EA700A265844E35508276081D32423C37645";
const borrowerCapAmount = web3.utils.toWei("10", "ether");
const lenderCapAmount = web3.utils.toWei("20", "ether");

const deploy = async () => {
  const contract = new web3.eth.Contract(contractJson.abi);
  const deployTx = contract.deploy({
    data: contractJson.bytecode,
    arguments: [
      borrowerWallet,
      lenderWallet,
      borrowerCapAmount,
      lenderCapAmount,
    ],
  });

  const gas = await deployTx.estimateGas({ from: deployerAddress });
  const encoded = deployTx.encodeABI();

  const tx = {
    from: deployerAddress,
    data: encoded,
    gas,
  };

  const signed = await web3.eth.accounts.signTransaction(
    tx,
    deployerPrivateKey
  );
  const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);

  console.log("✅ Contract deployed at:", receipt.contractAddress);
  console.log("🔗 Transaction Hash:", receipt.transactionHash);
};

deploy().catch(console.error);
