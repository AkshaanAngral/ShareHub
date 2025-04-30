// SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    // Only connect if the user is logged in AND we have a token
    if (!isLoggedIn || !user || !storedToken) {
      return;
    }
  
    const socketInstance = io("http://localhost:5000", {
      auth: (cb) => { // Use a function to dynamically fetch the token
        cb({token: localStorage.getItem("token")});
      },
      transports: ['websocket'] // Ensure only WebSocket transport is used
    });
  
    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");
    });
  
    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });
  
    socketInstance.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setIsConnected(false);
    });
  
    setSocket(socketInstance);
  
    return () => {
      socketInstance.disconnect();
    };
  }, [isLoggedIn, user]);
  

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
