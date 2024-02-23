const { Web3 }  = require('web3');
const fs = require('fs');
const path = require('path');

const dir = __dirname

dotenv = require('dotenv');
dotenv.config({'path': path.join(dir,'.env')});

// Your private network RPC URL
const httpProviderURL = process.env.URL

// Load contract artifacts
const userArtifact = require('./artifacts/contracts/User.sol/User.json');
const objectArtifact = require('./artifacts/contracts/Object.sol/Object.json');

// Set up web3 provider
const web3 = new Web3(new Web3.providers.HttpProvider(httpProviderURL));

const privateKeyFile = path.join(dir, process.env.PRIVATE_KEY_FILE);

const privateKeys = fs.readFileSync(privateKeyFile, 'utf8')
  .split('\n') 
  .filter(key => key.trim() !== '') 
  .map(key => key.trim());

// Deployment function
async function deployContract(artifact, constructorArgs, accounts) {

    const contract = new web3.eth.Contract(artifact.abi);
    const gas = await contract.deploy({ data: artifact.bytecode, arguments: constructorArgs }).estimateGas();
    console.log(gas);
    const contractInstance = await contract.deploy({ data: artifact.bytecode, arguments: constructorArgs })
        .send({
            from: accounts[0].address,
            gas: BigInt(3)*gas
        });

    console.log(`Contract deployed to: ${contractInstance.options.address}`);
    return contractInstance;
}

function getAccounts(privateKeys) {
  let accounts = []
  for (const privateKey of privateKeys) {
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    if (accounts.length == 0) {
      web3.eth.defaultAccount = account.address;
    }
    accounts.push(account);
  }
  return accounts
}

// Example usage

async function deploy () {
    const accounts = getAccounts(privateKeys)
    const userContract = await deployContract(userArtifact, [1, 'Alice'], accounts);
    console.log('User Contract Address:', userContract.options.address);

    const objectContract = await deployContract(objectArtifact, [2, 100, userContract.options.address], accounts);
    console.log('Object Contract Address:', objectContract.options.address);
} 
deploy().catch(console.error);
