module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default Ganache host)
      port: 7545, // Default Ganache GUI port (or 8545 for Ganache CLI)
      network_id: "*", // Match any network ID
      gas: 67219725, // Gas limit (optional, adjust based on needs)
      gasPrice: 20000000000, // Gas price in wei (optional, default 20 Gwei)
    },
  },
  compilers: {
    solc: {
      version: "0.8.13", // Specify Solidity compiler version
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
  mocha: {
    timeout: 100000, // Optional: Set timeout for tests
  },
};
