import { useEffect } from 'react';
import { useEvent } from './EventContext';
import io from 'socket.io-client';

const port = 3001
const socket = io(`https://localhost:${port}`);

export const useSocketListener = () => {
    const { setEventData } = useEvent();

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
    }, [setEventData]);
}