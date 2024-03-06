const express = require("express");
const { Web3 } = require("web3");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const https = require("https");
const { Server } = require("socket.io");
const { IpcProvider } = require("web3-providers-ipc");
const bodyParser = require("body-parser");

dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });

const options = {
  key: fs.readFileSync(path.join(__dirname, "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert.pem")),
};

// setting up Web3 Provider
let currentNode = "third";
const nodes = ["first", "second", "third"];
const ipcPaths = nodes.map((node) => path.join(__dirname, node, "geth.ipc"));
const ipcProviders = ipcPaths.map((ipcPath) => new IpcProvider(ipcPath));
let web3 = initWeb3(getNextNode());

// creating express application
const corsOptions = {
  origin: "http://localhost:5173", // Update with the origin of your React app
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

const buildPath = path.join(__dirname, "client/build");
const port = process.env.NODEPORT || 3001;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(bodyParser.json());
// app.use(express.static(buildPath));

// Load contract artifacts
const objectManagerArtifact = require("./artifacts/contracts/ObjectManager.sol/ObjectManager.json");
const contractAddress = process.env.CONTRACTADDRESS;
const objectManagerContract = new web3.eth.Contract(
  objectManagerArtifact.abi,
  contractAddress
);
let accounts = [];

// Routes
// app.get('*', (req, res) =>  res.sendFile(path.join(buildPath, 'index.html')) );
app.get("/", async (req, res) => res.sendStatus(200));
app.get("/getNextUserId", async (req, res) => getNextUserId(req, res));
app.post("/getUser", async (req, res) => getUser(req, res));
app.post("/getObject", async (req, res) => getObject(req, res));
app.post("/registerUser", async (req, res) => registerUser(req, res));
app.post("/registerObject", async (req, res) => registerObject(req, res));
app.post("/transferOwnership", async (req, res) => transferOwnership(req, res));

// creating http server
const server = https.createServer(options, app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  },
});

// Event Functions
objectManagerContract.events.UserRegistered({}).on("data", (event) => {
  const { userId, name, owner } = event.returnValues;
  console.log(
    "User Registered Event with userId: ",
    userId,
    " and name: ",
    name,
    " and owner: ",
    owner
  );
  io.emit("UserRegistered", {
    userId: userId.toString(),
    name: name.toString(),
  });
});

objectManagerContract.events.ObjectRegistered({}).on("data", (event) => {
  const { objectId, userId } = event.returnValues;
  console.log(
    "Object registered with ObjectId: ",
    objectId,
    " and Registered by User: ",
    userId
  );
  io.emit("ObjectRegistered", {
    userId: userId.toString(),
    objectId: objectId.toString(),
  });
});

objectManagerContract.events.OwnershipTransferred({}).on("data", (event) => {
  const { objectId, userId } = event.returnValues;
  console.log(`Ownership of object ${objectId} Transferred  to ${userId}`);
  io.emit("OwnershipTransferred", {
    objectId: objectId.toString(),
    userId: userId.toString(),
  });
});

objectManagerContract.events.TransferCancelled({}).on("data", (event) => {
  const { objectId, userId, reason } = event.returnValues;
  console.log(
    `Transfer of Ownership of object ${objectId} failed to ${userId} due to ${reason}`
  );
  io.emit("TransferCancelled", {
    objectId: objectId.toString(),
    userId: userId.toString(),
    reason: reason.toString(),
  });
});

const parseRevertReason = (error) => {
  if (error && error.innerError) {
    const errorData = error.innerError.data;
    console.log(errorData);
    if (errorData && errorData.startsWith("0x08c379a0")) {
      try {
        const reason = web3.eth.abi.decodeParameter("string", errorData);
        return reason;
      } catch (error) {
        console.error("Failed to decode revert reason", error);
        return null;
      }
    }
  }
  return null;
};

// Contract functions
async function registerUser(req, res) {
  try {
    const { name } = req.body;
    console.log("registering User");
    const receipt = await objectManagerContract.methods
      .registerUser(name)
      .send({ from: accounts[0] });
    const userId = await getUserId(receipt);
    res.json({ userId: userId.toString() });
  } catch (error) {
    const revertReason = parseRevertReason(error);
    console.log(revertReason);
    res.status(500).json({ error: error.toString() });
  }
}

async function registerObject(req, res) {
  try {
    const { objectId, value, userId } = req.body;
    await objectManagerContract.methods
      .registerObject(objectId, value, userId)
      .send({ from: accounts[0] });
    res.sendStatus(204);
  } catch (error) {
    const revertReason = parseRevertReason(error);
    console.log(revertReason);
    res.status(500).json({ error: error.toString() });
  }
}

async function getNextUserId(req, res) {
  try {
    const userId = await objectManagerContract.methods
      .nextUserId()
      .call({ from: accounts[0] });
    res.json({ userId: userId.toString() });
  } catch (error) {
    const revertReason = parseRevertReason(error);
    console.log(revertReason);
    console.error("Encountered some Error in GetNextUserId ", error.toString());
    res.status(500).json({ error: error.toString() });
  }
}

async function getUser(req, res) {
  try {
    const { userId } = req.body;
    const user = await objectManagerContract.methods
      .getUser(BigInt(userId))
      .call({ from: accounts[0] });
    console.log(user);
    res.json({
      userName: user.name,
      userId: userId.toString(),
      objects: user.userObjects.map((userObject) => userObject.toString()),
    });
  } catch (error) {
    const revertReason = parseRevertReason(error);
    console.log(revertReason);
    console.error("Encountered some Error in getUser", error.toString());
    res.status(500).json({ error: error.toString() });
  }
}

async function getObject(req, res) {
  try {
    const { objectId } = req.body;
    const objectData = await objectManagerContract.methods
      .getObject(objectId)
      .call({ from: accounts[0] });
    console.log("this is ", objectData);
    res.json({ value: objectData.value.toString(), users: objectData.history });
  } catch (error) {
    const revertReason = parseRevertReason(error);
    console.log(revertReason);
    console.error("Encountered some Error in getObject ", error.toString());
    res.status(500).json({ error: error.toString() });
  }
}

async function transferOwnership(req, res) {
  try {
    const { objectId, userId } = req.body;
    const receipt = await objectManagerContract.methods
      .transferOwnership(objectId, userId)
      .send({ from: accounts[0] });
    // const data = await getTransferOwnershipLogs(receipt);
    const objectData = await objectManagerContract.methods
      .getObject(objectId)
      .call({ from: accounts[0] });
    const userData = await objectManagerContract.methods
      .getUser(userId)
      .call({ from: accounts[0] });
    res.json({
      userId: userId.toString(),
      users: objectData.history,
      userName: userData.name,
    });
  } catch (error) {
    const revertReason = parseRevertReason(error);
    console.log(revertReason);
    console.error(
      "Encountered some Error in TranferOwnership ",
      error.toString()
    );
    res.status(500).json({ error: error.toString() });
  }
}

// utility functions
function getNextNode() {
  const currentIndex = nodes.indexOf(currentNode);
  const nextIndex = (currentIndex + 1) % nodes.length;
  currentNode = nodes[nextIndex];
  return currentNode;
}

function initWeb3(node) {
  const currentIndex = nodes.indexOf(node);
  return new Web3(ipcProviders[currentIndex]);
}

async function getUserId(receipt) {
  const log = receipt.events.UserRegistered;
  return log.returnValues.userId;
}

// listening
server.listen(port, async () => {
  accounts = await web3.eth.getAccounts();
  console.log(`Server Listening at https://localhost:${port}`);
});

/*
0x08c379a000000000000000000000000000000000000000000000000000000000000000
0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000164f626a65637420616c7265616479206578697374732e00000000000000000000
0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000164f626a65637420616c7265616479206578697374732e00000000000000000000
*/