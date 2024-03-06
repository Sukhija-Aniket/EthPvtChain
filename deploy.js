const { Web3 }  = require('web3');
const fs = require('fs');
const path = require('path');
const { IpcProvider } = require('web3-providers-ipc');

dotenv = require('dotenv');
dotenv.config({'path': path.join(__dirname,'.env')});

// Your private network RPC URL
// const httpProviderURL = process.env.URL

// Load contract artifacts
const objectManagerArtifact = require('./artifacts/contracts/ObjectManager.sol/ObjectManager.json')

// Set up web3 provider
const ipcPath = path.join(__dirname , 'first', 'geth.ipc');
const ipcProvider = new IpcProvider(ipcPath);
const web3 = new Web3(ipcProvider);

const privateKeyFile = path.join(__dirname, process.env.PRIVATE_KEY_FILE);

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
    const deploymentPath = path.join(__dirname, 'deployments.json');

    const deploymentData = {
      ObjectManager: contractInstance.options.address
    }

    if (fs.existsSync(deploymentPath)) {
      const existingDataRaw = fs.readFileSync(deploymentPath);
      const existingData = JSON.parse(existingDataRaw);
      existingData.objectManager = contractInstance.options.address

      fs.writeFileSync(deploymentPath, JSON.stringify(existingData, null, 2));
    } else {
      fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
    }

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
    const objectManagerContract = await deployContract(objectManagerArtifact, [], accounts);
} 
deploy().catch(console.error);
