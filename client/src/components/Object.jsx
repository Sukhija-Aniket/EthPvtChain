// src/components/Object.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEvent } from "./EventContext";
import { Button, Container, Spacer, Input, Text, Title, List, ListItem } from "./StyledComponents";
import "react-toastify/dist/ReactToastify.css";
import AlertComponent from "./AlertComponent";

const Object = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  useEffect(() => {
    if (
      !state ||
      !state.userId ||
      !state.userName ||
      !state.users ||
      !state.objectId ||
      !state.value
    ) {
      navigate("/", {
        state: { message: "Could not directly go to the Object Page" },
      });
    }
  }, [state, navigate]);

  const objectId = state ? state.objectId : undefined;
  const value = state ? state.value : undefined;
  const [userId, setUserId] = useState(state ? state.userId : undefined);
  const [newUserId, setNewUserId] = useState("");
  const [userName, setUserName] = useState(state ? state.userName : undefined);
  const [users, setUsers] = useState(state ? state.users : []);
  const { eventData } = useEvent();

  const handleTransferOwnership = async () => {
    // Call API to transfer ownership
    try {
      // we want userId, userName and list of objects
      const response = await axios.post(
        "https://localhost:3001/transferOwnership",
        { objectId: objectId, userId: newUserId }
      );
      if (response) {
        setUserId(response.data.userId);
        setUserName(response.data.userName);
        setUsers(response.data.users);
      } else {
        const reason = eventData ? ` Reason: ${eventData}`: "";
        const message = `Ownership could not be transferred!${reason}`;
        <AlertComponent message={message} />;
        // TODO: find reason for this
        console.log(message);
      }
    } catch (error) {
      const reason = eventData ? ` Reason: ${eventData}`: "";
      const message = `Ownership could not be transferred!${reason}`;
      <AlertComponent message={message} />;
      console.error("Error transferring ownership: " + error.toString());
    }
  };

  const handleViewUser = async () => {
    try {
      const userObject = await axios.post("https://localhost:3001/getUser", {
        userId: userId,
      });
      if (userObject) {
        // redirect to the new page
        setUserName(userObject.data.userName);
        const objects = userObject.data.objects;
        navigate(`../../user/:${userId}`, {
          state: {
            userName: userObject.data.userName,
            objects: objects,
            userId: userId,
          },
        });
      } else {
        <AlertComponent message="No such user exists!" />;
        console.log("No such user exists!");
      }
    } catch (error) {
      <AlertComponent message="User could not be fetched!" />;
      console.error("Error getting user: ", error.toString());
    }
  };

  return (
    <Container>
      <Title>Object Page</Title>
      
      <Text>User ID: {userId}</Text>
      <Text> UserName: {userName}</Text>
      <Text> Object ID: {objectId} </Text>
      <Text> value: {value} </Text>
      
      <Input
        type="text"
        placeholder="Enter UserId"
        value={newUserId}
        onChange={(e) => setNewUserId(e.target.value)}
      />
      <Button onClick={handleTransferOwnership}>Transfer Ownership</Button>
     
      <Spacer />
     
      <List>
        {users.map((user, index) => (
          <ListItem key={index}>Owner: {user}</ListItem>
        ))}
      </List>
     
      <Spacer />
     
      <Button onClick={handleViewUser}>Back to User</Button>
    </Container>
  );
};

export default Object;
