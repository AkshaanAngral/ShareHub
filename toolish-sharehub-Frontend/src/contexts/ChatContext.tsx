import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { io, Socket } from "socket.io-client";

// Message and Conversation interfaces
export interface Message {
  senderId: string;
  text: string;
  timestamp: Date | string;
  _id: string;
  read?: boolean;
}
export interface Conversation {
  _id: string; // roomId
  participants: string[];
  messages: Message[];
  unreadCount: number;
  toolName?: string;
  participantName: string;
  participantId: string;
}
export interface CurrentConversation {
  participantId: string;
  participantName: string;
  toolName?: string;
}
interface ChatContextType {
  conversations: Conversation[];
  currentConversation: CurrentConversation | null;
  socket: Socket | null;
  isConnected: boolean;
  isLoading: boolean;
  setCurrentConversation: React.Dispatch<
    React.SetStateAction<CurrentConversation | null>
  >;
  sendMessage: (receiverId: string, messageText: string) => void;
  createConversation: (
    userId: string,
    userName?: string,
    toolName?: string
  ) => Promise<string | undefined>;
  fetchMessages: (roomId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);

const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const [currentConversation, setCurrentConversation] =
    useState<CurrentConversation | null>(null);

  const pendingMessagesRef = useRef<
    { receiverId: string; message: string; messageId: string }[]
  >([]);
  const socketRef = useRef<Socket | null>(null);
  const processedMessagesRef = useRef<Set<string>>(new Set());

  // Fetch all conversations for the user
  const fetchConversations = useCallback(async () => {
    if (!isLoggedIn || !user) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/chat`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        // Ensure participantId is always set
        const processedData = data.map((conv: Conversation) => {
          if (!conv.participantId && conv.participants) {
            const otherParticipant = conv.participants.find(
              (p) => p !== user.id
            );
            return {
              ...conv,
              participantId: otherParticipant || "",
            };
          }
          // Ensure all messages have an _id
          const messagesWithIds = conv.messages.map((msg: any) => {
            if (!msg._id) {
              return {
                ...msg,
                _id: `${msg.senderId}_${new Date(msg.timestamp).getTime()}_${Math.random()
                  .toString(36)
                  .substr(2, 5)}`,
              };
            }
            return msg;
          });
          return {
            ...conv,
            messages: messagesWithIds,
          };
        });
        setConversations(processedData);
        // Add all message IDs to the processed set
        processedData.forEach((conv: Conversation) => {
          conv.messages.forEach((msg) => {
            processedMessagesRef.current.add(msg._id);
          });
        });
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, user]);

  // Socket.IO connection
  useEffect(() => {
    if (!isLoggedIn || !user) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    if (socketRef.current) socketRef.current.disconnect();

    const apiUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const newSocket = io(apiUrl, {
      transports: ["websocket"],
      withCredentials: true,
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      // Send any pending messages
      if (pendingMessagesRef.current.length > 0) {
        pendingMessagesRef.current.forEach(
          ({ receiverId, message, messageId }) => {
            const roomId = [user.id, receiverId].sort().join("_");
            newSocket.emit("sendMessage", {
              roomId,
              message,
              senderId: user.id,
              messageId,
            });
          }
        );
        pendingMessagesRef.current = [];
      }
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [isLoggedIn, user]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !user) return;

    const handleReceiveMessage = (data: {
      message: string;
      senderId: string;
      createdAt: string;
      messageId?: string;
      roomId: string;
    }) => {
      const messageId =
        data.messageId ||
        `${data.senderId}_${new Date(data.createdAt).getTime()}`;
      if (processedMessagesRef.current.has(messageId)) return;
      processedMessagesRef.current.add(messageId);

      setConversations((prevConversations) => {
        const updatedConversations = [...prevConversations];
        const conversationIndex = updatedConversations.findIndex(
          (c) => c._id === data.roomId
        );
        if (conversationIndex === -1) {
          // Fetch all conversations if not found
          setTimeout(() => fetchConversations(), 0);
          return prevConversations;
        }
        const newMessage = {
          senderId: data.senderId,
          text: data.message,
          timestamp: new Date(data.createdAt),
          _id: messageId,
        };
        // Prevent duplicate
        const messageExists = updatedConversations[
          conversationIndex
        ].messages.some((msg) => msg._id === messageId);
        if (messageExists) return prevConversations;
        updatedConversations[conversationIndex] = {
          ...updatedConversations[conversationIndex],
          messages: [
            ...updatedConversations[conversationIndex].messages,
            newMessage,
          ],
          unreadCount:
            currentConversation?.participantId === data.senderId
              ? 0
              : updatedConversations[conversationIndex].unreadCount + 1,
        };
        return updatedConversations;
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, user, currentConversation, fetchConversations]);

  // Send a message
  const sendMessage = useCallback(
    (receiverId: string, messageText: string) => {
      if (!user) return;
      const roomId = [user.id, receiverId].sort().join("_");
      const token = localStorage.getItem("token");
      if (!token) return;
      const messageId = generateMessageId();
      const timestamp = new Date();

      setConversations((prevConversations) => {
        const updatedConversations = [...prevConversations];
        const conversationIndex = updatedConversations.findIndex(
          (c) => c._id === roomId
        );
        if (conversationIndex === -1) return prevConversations;
        const newMessage = {
          senderId: user.id,
          text: messageText,
          timestamp,
          _id: messageId,
        };
        updatedConversations[conversationIndex] = {
          ...updatedConversations[conversationIndex],
          messages: [
            ...updatedConversations[conversationIndex].messages,
            newMessage,
          ],
        };
        return updatedConversations;
      });

      processedMessagesRef.current.add(messageId);

      if (socket && isConnected) {
        socket.emit("sendMessage", {
          roomId,
          message: messageText,
          senderId: user.id,
          messageId,
        });
      } else {
        pendingMessagesRef.current.push({
          receiverId,
          message: messageText,
          messageId,
        });
      }

      // API call for persistence
      fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            senderId: user.id,
            receiverId,
            message: messageText,
            messageId,
          }),
        }
      ).catch((error) => {
        console.error("Error sending message via API:", error);
      });
    },
    [socket, isConnected, user]
  );

  // Create a conversation
  const createConversation = useCallback(
    async (
      userId: string,
      userName?: string,
      toolName?: string
    ): Promise<string | undefined> => {
      try {
        const existingConversationId = [user?.id, userId].sort().join("_");
        const existingConversation = conversations.find(
          (c) => c._id === existingConversationId
        );
        if (existingConversation) {
          return existingConversationId;
        }
        const token = localStorage.getItem("token");
        if (!token) return undefined;
        const requestBody: any = { receiverId: userId };
        if (userName) requestBody.receiverName = userName;
        if (toolName) requestBody.toolName = toolName;
        setIsLoading(true);
        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
          }/api/chat/conversations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setConversations((prevConversations) => {
            const conversationExists = prevConversations.some(
              (c) => c._id === data._id
            );
            return conversationExists
              ? prevConversations
              : [...prevConversations, data];
          });
          return data._id;
        }
        return undefined;
      } catch (error) {
        console.error("Error creating conversation:", error);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [conversations, user]
  );

  // Fetch messages for a room
  const fetchMessages = useCallback(async (roomId: string): Promise<void> => {
    if (!roomId) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      setIsLoading(true);
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/api/chat/${roomId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const messages = await response.json();
        const processedMessages = messages.map((msg: any) => {
          const messageId =
            msg._id ||
            `${msg.senderId}_${new Date(msg.timestamp).getTime()}_${Math.random()
              .toString(36)
              .substr(2, 5)}`;
          processedMessagesRef.current.add(messageId);
          return {
            ...msg,
            _id: messageId,
          };
        });
        setConversations((prevConversations) => {
          return prevConversations.map((conversation) => {
            if (conversation._id === roomId) {
              return {
                ...conversation,
                messages: processedMessages,
                unreadCount: 0,
              };
            }
            return conversation;
          });
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue: ChatContextType = {
    conversations,
    currentConversation,
    socket,
    isConnected,
    isLoading,
    setCurrentConversation,
    sendMessage,
    createConversation,
    fetchMessages,
    fetchConversations,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
