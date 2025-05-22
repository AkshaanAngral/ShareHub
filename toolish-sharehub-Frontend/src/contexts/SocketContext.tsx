import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendNotification: (
    userId: string,
    type: string,
    title: string,
    message: string,
    relatedId?: string
  ) => void;
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
    // Only connect if the user is logged in and token is present
    if (!isLoggedIn || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No JWT token found for socket connection.");
      return;
    }

    // Use your backend port (5000 in your setup)
    const socketInstance: Socket = io("http://localhost:5000", {
      transports: ["websocket"], // Use websocket only for best reliability
      auth: {
        token, // <-- JWT sent here!
        userId: user.id,
        username: user.name || user.email,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
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
      setSocket(null);
    };
    // eslint-disable-next-line
  }, [isLoggedIn, user?.id]); // Only re-run when login state or user id changes

  // Function to send notifications through socket
  const sendNotification = (
    userId: string,
    type: string,
    title: string,
    message: string,
    relatedId?: string
  ) => {
    if (socket && isConnected) {
      socket.emit("send_notification", {
        userId,
        type,
        title,
        message,
        relatedId,
        createdAt: new Date()
      });
    } else {
      console.warn("Cannot send notification: Socket not connected");
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, sendNotification }}>
      {children}
    </SocketContext.Provider>
  );
};
