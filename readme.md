
# Deployment Guide for Ethereum Private Network

This guide outlines the steps to set up a private Ethereum network, initialize nodes, and deploy smart contracts using Geth and Hardhat.

## Prerequisites

* Geth installed on your machine.
* Hardhat and other project dependencies.
* Node.js v20.

## Initial Setup

### Create Node Directories

First, create two directories to hold the data for your nodes:

```
mkdir first second
```

### Create Accounts

Create at least one account for each node:

```
geth --datadir first account new
geth --datadir second account new
geth --datadir first account new
geth --datadir second account new
```

 **Note** : Use the same password for all accounts as it will come in handy later.

### Genesis Block Configuration

Create a `genesis.json` file to be used with each node with the following content:

```
{
  "config": {
    "chainId": 123454321,
    "homesteadBlock": 0,
    "eip150Block": 0,
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "muirGlacierBlock": 0,
    "berlinBlock": 0,
    "londonBlock": 0,
    "arrowGlacierBlock": 0,
    "grayGlacierBlock": 0,
    "clique": {
      "period": 5,
      "epoch": 30000
    }
  },
  "difficulty": "1",
  "gasLimit": "800000000",
  "extradata": "0x0000000000000000000000000000000000000000000000000000000000000000Addr10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "alloc": {
    "Addr1": { "balance": "1000000000000000000" },
    "Addr2": { "balance": "1000000000000000000" },
    "Addr3": { "balance": "1000000000000000000" },
    "Addr4": { "balance": "1000000000000000000" }
  }
}
```

### Initialize Nodes

With the `genesis.json` file created, initialize each node:

```
geth init --datadir first first/genesis.json
geth init --datadir second second/genesis.json
```

## Network Configuration

### Bootnode Setup

Generate a bootnode key and start the bootnode, use any open port (30305):

```
bootnode -genkey boot.key
bootnode -nodekey boot.key -addr :30305 
```

### Start Nodes
Create a `password.txt` file in `first` directory. Use the following commands to start your nodes, unlocking the first account and setting it as the miner on the first node, and enabling HTTP `--http` on the second node for JSON-RPC requests from web3 client, use any open ports (30306 and 30307):

```
geth --datadir first --port 30306 --bootnodes $bootNode --networkid 123454321 --unlock 0xAddr1 --password first/passwords.txt --authrpc.port 8551 --mine --miner.etherbase 0xAddr1

geth --datadir second --port 30307 --bootnodes $bootNode --networkid 123454321 --password=second/passwords.txt --authrpc.addr localhost --authrpc.vhosts localhost --authrpc.port 8552 --http --http.api eth,net
```

### Accessing the JavaScript Console

To interact with a node via the JavaScript console, we can use ipc files:

```
geth attach first/geth.ipc
geth attach second/geth.ipc
```

The Geth setup is complete, and the two nodes along with a bootnode are running.

## Deploying Smart Contracts

Ensure all dependencies are installed:

```
npm ci
```

### Compilation

Compile your smart contracts:

```
npx hardhat compile
```

### Prepare for Deployment

Setting necessary environment variables in a `.env` file:

```
PRIVATE_KEY_FILE=path/to/privateKeys.txt
SOLIDITY_VERSION=0.8.0
URL=http://localhost:8545
PASSWORD=yourCommonPassword
```

Extracting the private Keys for all accounts using a custom script:

```
node getpwd.js
```

**Note** :  In case you did set different password for all accounts, you need to make some changes to .env and deploy.js file

### Deploy Contracts

Deploy your contracts to the private network:

```
npx hardhat run deploy.js --network myprivatenet
```

### Troubleshooting

Refer to `.gitignore` for potential file exclusion errors. Adjust your `.env` and `deploy.js` files as necessary, especially if using different passwords for each account.

## Useful Geth Console Commands

* `net.peerCount` - Check the number of connected nodes.
* `admin.peers` - View details of connected peers.
* `eth.getBalance(eth.accounts[0])` - Check the balance of an account.
* Sending Ether between accounts:

  ```
  eth.sendTransaction({
    to: '0xRecipientAddress',
    from: eth.accounts[0],
    value: 250000
  });
  ```

## Contributing

If you want to contribute to this project, follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:

```
git checkout -b feature/your-feature-name
```

3. Make your changes and commit them:

```
git commit -m "Add your commit message here"
```

4. Push the changes to your fork:

```
git push origin feature/your-feature-name
```

5. Create a pull request on the original repository.



