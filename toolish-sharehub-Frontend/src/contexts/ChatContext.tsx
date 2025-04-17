import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
  } from "react";
  import { useSocket } from "./SocketContext";
  import { useAuth } from "./AuthContext";
  import { io, Socket } from "socket.io-client";
  
  // Define the Message interface
  interface Message {
    senderId: string;
    text: string;
    timestamp: Date;
  }
  
  // Define the Conversation interface
  interface Conversation {
    _id: string;
    participants: string[];
    messages: Message[];
    unreadCount: number;
    toolName?: string; // Make toolName optional
    participantName: string;
    participantId: string;
  }
  
  // Define the CurrentConversation interface
  interface CurrentConversation {
    participantId: string;
    participantName: string;
    toolName?: string;
  }
  
  // Define the ChatContextType interface
  interface ChatContextType {
    conversations: Conversation[];
    currentConversation: CurrentConversation | null;
    socket: Socket | null; // Socket instance
    setCurrentConversation: React.Dispatch<
      React.SetStateAction<CurrentConversation | null>
    >;
    sendMessage: (receiverId: string, messageText: string) => void;
    createConversation: (userId: string) => Promise<string | undefined>;
    fetchMessages: (roomId: string) => Promise<void>;
  }
  
  // Create the ChatContext
  export const ChatContext = createContext<ChatContextType | undefined>(
    undefined
  );
  
  // Create the ChatProvider component
  export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useAuth();
    const [currentConversation, setCurrentConversation] =
      useState<CurrentConversation | null>(null);
  
    // useEffect to connect to the Socket.IO server
    useEffect(() => {
      const newSocket = io(
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
        {
          transports: ["websocket"],
          withCredentials: true,
        }
      );
      setSocket(newSocket);
  
      // Clean up function to disconnect the socket when the component unmounts
      return () => {
        newSocket.disconnect();
      };
    }, []); // Empty dependency array ensures this effect runs only once
  
    // useEffect to load conversations from API on mount
    useEffect(() => {
      const fetchConversations = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/chat`
          );
          if (response.ok) {
            const data = await response.json();
            setConversations(data);
          } else {
            console.error("Failed to fetch conversations:", response.status);
          }
        } catch (error) {
          console.error("Error fetching conversations:", error);
        }
      };
  
      fetchConversations();
    }, [user]); // Add user to the dependency array
  
    // useEffect to listen for new messages from Socket.IO
    useEffect(() => {
      if (!socket) return;
  
      socket.on(
        "receiveMessage",
        (data: { message: string; senderId: string; createdAt: string }) => {
          console.log("Received message:", data);
          setConversations((prevConversations) => {
            const conversation = prevConversations.find((convo) => {
              return (
                [data.senderId, user?.email].sort().join("_") === convo._id
              );
            });
  
            if (!conversation) {
              console.log("Conversation not found, returning previous state.");
              return prevConversations;
            }
  
            const newMessage = {
              senderId: data.senderId,
              text: data.message,
              timestamp: new Date(data.createdAt),
            };
  
            console.log("New Message:", newMessage);
            return prevConversations.map((convo) => {
              if (convo._id === conversation._id) {
                console.log(`Add new message to conversation ${conversation._id}`);
                return {
                  ...convo,
                  messages: [...convo.messages, newMessage],
                };
              }
              return convo;
            });
          });
        }
      );
  
      return () => {
        socket.off("receiveMessage");
      };
    }, [socket, user]); // Add socket and user to the dependency array
  
    // Function to send a message
    const sendMessage = async (receiverId: string, messageText: string) => {
      if (!socket || !user) {
        console.error("Socket not connected or user not logged in");
        return;
      }
  
      const roomId = [user.email, receiverId].sort().join("_");
      console.log(`Sending message to room ${roomId}:`, messageText);
  
      try {
        socket.emit("sendMessage", {
          roomId: roomId,
          message: messageText,
          senderId: user.email,
        });
  
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: user.email,
            receiverId: receiverId,
            message: messageText,
          }),
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    };
  
    // Function to create a conversation
    const createConversation = async (
      userId: string
    ): Promise<string | undefined> => {
      try {
        // Retrieve the token from local storage
        const token = localStorage.getItem("token");
  
        if (!token) {
          console.error("No token found in local storage");
          return undefined;
        }
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/conversations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId }),
          }
        );
  
        if (response.ok) {
          const data = await response.json();
          setConversations((prevConversations) => [...prevConversations, data]);
          return data._id;
        } else {
          console.error("Failed to create conversation:", response.status);
          return undefined;
        }
      } catch (error) {
        console.error("Error creating conversation:", error);
        return undefined;
      }
    };
  
    // Function to fetch messages for a room
    const fetchMessages = async (roomId: string): Promise<void> => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/${roomId}`
        );
        if (response.ok) {
          const messages = await response.json();
          setConversations((prevConversations) => {
            return prevConversations.map((conversation) => {
              if (conversation._id === roomId) {
                return { ...conversation, messages };
              }
              return conversation;
            });
          });
        } else {
          console.error("Failed to fetch messages:", response.status);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
  
    // Define the context value
    const contextValue: ChatContextType = {
      conversations,
      currentConversation,
      socket,
      setCurrentConversation,
      sendMessage,
      createConversation,
      fetchMessages,
    };
  
    // Provide the context value to the children
    return (
      <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
    );
  };
  
  // Create the useChat hook
  export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
      throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
  };
  
  export type { Message, Conversation };
  