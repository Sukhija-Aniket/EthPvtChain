// src/components/Index.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Web3 from "web3";

import axios from "axios";
import { Button, Container, Spacer, Input } from "./StyledComponents"
import "react-toastify/dist/ReactToastify.css";
import AlertComponent from "./AlertComponent";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    if (location.state && location.state.message) {
      console.log(location.state.message);
      toast(location.state.message);
    }

    // Initialize Web3
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          console.log(accounts.length, accounts[0]);
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
        } catch (error) {
          console.error("Error Requesting account access", error);
        }
      } else {
        console.error("Metamask not detected!");
      }
    };

    initWeb3();
  }, [location]);

  const sendEtherUsingMetaMask = async (amountInEther) => {
    // Convert the amount to wei
    const amountInWei = parseInt(Web3.utils.toWei(amountInEther.toString(), 'ether'));
    
    // Get the user's account
    const accounts = await web3.eth.getAccounts();
    const senderAddress = accounts[1];
    const recipientAddress = accounts[0];
    
    console.log("wei amount:" ,amountInWei);
    // Create the transaction parameters
    const gasEstimate = await web3.eth.estimateGas({ from: senderAddress, to: recipientAddress, amount: web3.utils.toWei(amountInEther, 'ether') });
    console.log(gasEstimate, amountInWei);
    const transactionParameters = { 
      to: recipientAddress, // Required except during contract publications.
      from: senderAddress, // must match user's active address.
      value: web3.utils.toHex(amountInWei), // hex-encoded value in wei
      gas: web3.utils.toHex(BigInt(3) * gasEstimate)
    };

    // Send the transaction
    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
      console.log('Transaction Hash:', txHash);
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error; // Rethrow or handle error appropriately in your application
    }
  }

  const handleCreateUser = async () => {
    // creating a new user using name and redirect to that User
    try {
      const response = await axios.post("https://localhost:3001/registerUser", {
        name: userName,
      });
      setUserId(response.data.userId);

      const objects = [];
      console.log(userId);
      navigate(`/user/${response.data.userId}`, {
        state: {
          userName: userName,
          objects: objects,
          userId: response.data.userId,
        },
      });
    } catch (error) {
      <AlertComponent message="user could not be fetched!" />;
      console.error("Error registering user: ", error.toString());
    }
  };

  const handleViewUser = async () => {
    try {
      const userObject = await axios.post("https://localhost:3001/getUser", {
        userId: userId,
      });
      if (userObject) {
        setUserName(userObject.data.userName);
        const objects = userObject.data.objects;
        navigate(`user/:${userId}`, {
          state: {
            userName: userObject.data.userName,
            objects: objects,
            userId: userId,
          },
        });
      } else {
        <AlertComponent mesasge="No such user exists!" />;
        console.log("No such user exists!");
      }
    } catch (error) {
      <AlertComponent mesasge="User Could not be fetched" />;
      console.error("Error getting user: ", error.toString());
    }
    // TODO: Case 3: Metamask to know whether this user belongs to this person or not.
  };

  return (
    <Container>
      <ToastContainer />
      
      <Input
        type="text"
        placeholder="Enter userName to create user"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <Button onClick={handleCreateUser}>Create User</Button>
      
      <Spacer/>
      
      <Input
        type="text"
        placeholder="Enter userId to view user"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <Button onClick={handleViewUser}>View User</Button>
     
      <Spacer/>
      
      <Input
        type="text"
        placeholder="Enter address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Enter Amount in Eth"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button onClick={(() => sendEtherUsingMetaMask(amount))}>Send Money</Button>
    </Container>
  );
};

export default Index;
