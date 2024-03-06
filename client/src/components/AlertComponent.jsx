import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AlertComponent = ({ message }) => {
  useEffect(() => {
    toast(message);
  }, [message]);
  return (
    <div>
      <ToastContainer />
    </div>
  );
};

export default AlertComponent;
