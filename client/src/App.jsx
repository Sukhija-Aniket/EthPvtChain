import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import io from "socket.io-client";
import Index from "./components/Index.jsx";
import User from "./components/User.jsx";
import Object from "./components/Object.jsx";
import PageNotFound from "./components/PageNotFound.jsx";
import { EventProvider } from './components/EventContext.jsx'; 


const port = 3001;
const socket = io(`https://localhost:${port}`, {
  withCredentials: true,
}); // Connecting to Backend Server

function App() {

  useEffect(() => {
    socket.on("UserRegistered", (data) => {
      console.log("User Registered event received", data);
    });

    socket.on("ObjectRegistered", (data) => {
      console.log("Object Registered event received", data);
    });

    socket.on("OwnershipTransferred", (data) => {
      console.log("Ownership Transferred event received", data);
    });

    socket.on(("TransferCancelled", (data) => {
      console.log("Transfer Cancelled event received", data);
    }));

    return () => {
      socket.off("UserRegistered");
      socket.off("ObjectRegistered");
      socket.off("OwnershipTransferred");
      socket.off("TransferCancelled");
    };
  }, []);

  return (
    <EventProvider>
    <Router>
      <Routes>
        <Route path="/user/:userId" element={ <User/> } />
        <Route path="/object/:objectId" element={ <Object/> } />
        <Route path="/" element={ <Index/> } />
        <Route path="*" element={ <PageNotFound/> } />
      </Routes>
    </Router>
    </EventProvider>
  );
}

export default App;
