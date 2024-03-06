const fs = require("fs");
const path = require("path"); 

const dir = __dirname

const dotenv = require("dotenv");
dotenv.config({'path': path.join(dir,'.env')});

// Path to your file
const privateKeyFile = path.join(dir, process.env.PRIVATE_KEY_FILE);
const solidityVersion = process.env.SOLIDITY_VERSION;
const url = process.env.URL;

// Read the private keys from file
const privateKeys = fs.readFileSync(privateKeyFile, 'utf8')
  .split('\n') 
  .filter(key => key.trim() !== '') 
  .map(key => key.trim());


module.exports = {
  solidity: solidityVersion,
  paths: {
    sources: path.join(dir, "contracts"), // Directory where Solidity contracts are located
    tests: path.join(dir, 'test'), // Directory where tests are located
    artifacts: path.join(dir, "artifacts"), // Directory to store compiled artifacts
  },
  networks: {
    myprivatenet: {
        url: url, // Your private network RPC URL
        accounts: privateKeys, // Array of account private keys
    }
  }
};
  