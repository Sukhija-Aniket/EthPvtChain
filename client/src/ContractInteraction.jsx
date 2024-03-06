import React, { useState } from 'react';
import axios from 'axios';

const ContractInteraction = () => {
  const [userName, setUserName] = useState('');
  const [objectId, setObjectId] = useState('');
  const [value, setValue] = useState('');
  const [userId, setUserId] = useState('');

  const handleRegisterUser = async () => {
    try {
      const response = await axios.post('https://localhost:3001/registerUser', { name: userName });
      console.log(response.data.userId);
      setUserId(response.data.userId); //TODO: nothing is returned by user, so it does not work
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  const handleRegisterObject = async () => {
    try {
      console.log(userId, objectId, value)
      await axios.post('https://localhost:3001/registerObject', { objectId: objectId, value: value, userId: userId });
    } catch (error) {
      console.error('Error registering object:', error);
    }
  };

  const handleGetUserId = async () => {
    try {
      const response = await axios.get('https://localhost:3001/getNextUserId');
      console.log(response.data.userId);
    } catch (error) {
      console.error('Error fetching next user ID:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="User Name"
      />
      <button onClick={handleRegisterUser}>Register User</button>

      <input
        type="text"
        value={objectId}
        onChange={(e) => setObjectId(e.target.value)}
        placeholder="Object ID"
      />
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Value"
      />
      <button onClick={handleRegisterObject}>Register Object</button>

      <button onClick={handleGetUserId}>Get Next User ID</button>
    </div>
  );
};

export default ContractInteraction;
