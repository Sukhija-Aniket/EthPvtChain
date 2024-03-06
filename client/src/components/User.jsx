// src/components/User.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom"
import AlertComponent from "./AlertComponent";
import { useEvent } from "./EventContext";
import { Button, Container, Title, Input, Text, List, ListItem, Spacer} from "./StyledComponents"

const User = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  
  useEffect(() => {
    if (!state || !state.userId || !state.userName) {
      navigate('/', {state: {message: 'Could not directly go to the user Page'}});
    }
  }, [state, navigate]);
 
  const userId = state ? state.userId : undefined
  const userName = state ? state.userName : undefined
  const [value, setValue] = useState("");
  const [objectId, setObjectId] = useState("");
  const [userObjects, setUserObjects] = useState(state ? state.objects : []);
  const { eventData } = useEvent();

  const handleCreateObject = async () => {
    try {
        // the blockchain will check whether the object already exists or not,
        // so no need to check here (Note)
      await axios.post("https://localhost:3001/registerObject", {
        objectId: objectId,
        value: value,
        userId: userId,
      });
      setUserObjects(prevObjects => [...prevObjects, objectId])
    } catch (error) {
      const reason = eventData ? ` Reason: ${eventData}` : "";
      <AlertComponent message={`Object could not be created${reason}`}/>
      console.log("Error creating object: ", error.toString());
    }
  };


  const viewObject = async (objectId) => {
    try {
      const objectObject = await axios.post(
        "https://localhost:3001/getObject",
        { objectId: objectId }
      );
      if (objectObject) {
        const users = objectObject.data.users;
        const value = objectObject.data.value;
        navigate(`/object/${objectId}`,  { state: { objectId: objectId, userId: userId, userName: userName, users: users, value: value}});
      } else {
        <AlertComponent message="No such object Exists"/>
        console.log("No such object exists");
      }
    } catch (error) {
      <AlertComponent message="Object could not be fetched" />
      console.log("Error getting object : ", error.toString());
    }
  };

  return (
    <Container>
      <Title>User Page</Title>
      
      <Text>User ID: {userId}</Text>
      <Text>User Name: {userName}</Text>
      
      <Input
        type="text"
        placeholder="Enter ObjectId"
        value={objectId}
        onChange={(e) => setObjectId(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Enter Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button onClick={handleCreateObject}>Create Object</Button>
      
      <Spacer />
      
      <List>
        {userObjects.map((object, index) => (
          <ListItem key={index}>
            Object ID: {object}{' '}
            <Button onClick={() => viewObject(object)}>View Object</Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default User;
