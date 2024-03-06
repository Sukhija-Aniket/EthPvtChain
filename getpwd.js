const Web3 = require('web3');
const fs = require('fs');
const path = require('path');


const dir = __dirname

const dotenv = require('dotenv');
dotenv.config({'path': path.join(dir,'.env')});


async function getFiles(nodes) {
    let filesInKeystore = []
    for (const node of nodes) {
        const keystorePath = path.join(dir, node, 'keystore');
        try {
            const files = await fs.promises.readdir(keystorePath);
            const completeFiles = files.map(file => path.join(keystorePath, file));
            filesInKeystore.push(...completeFiles);
        } catch (error) {
            console.error(`Error reading directory ${keystorePath}: ${error.message}`);
            return filesInKeystore
        }
    }   
    return filesInKeystore
}

async function getValue(decryptedAccount) {
    const value = await decryptedAccount;
    return value.privateKey
}

async function saveKeys() {
    const nodes = ['first', 'second', 'third']
    const filePaths = await getFiles(nodes)
    const password = process.env.PASSWORD; 
    const privateKeyFile = path.join(dir, process.env.PRIVATE_KEY_FILE);

    try {
        let privateKeys = ''
        await Promise.all(filePaths.map(async (filePath) => {
            const file = fs.readFileSync(filePath, 'utf8')
            const decryptedAccount = Web3.eth.accounts.decrypt(JSON.parse(file), password);
            const key = await getValue(decryptedAccount);
            privateKeys += key + '\n'
        }));
        console.log(privateKeyFile)
        fs.writeFileSync(privateKeyFile, privateKeys) 
        console.log(`Private keys have been written to ${privateKeyFile}`);
    } catch (error) {
        console.error('Encountered some error:', error.message);
    }
}

saveKeys()
