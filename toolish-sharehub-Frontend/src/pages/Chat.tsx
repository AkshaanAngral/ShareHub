import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  ChevronLeft,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useChat, Conversation } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ChatConversationList, {
  ConversationUI,
} from "../components/chat/ChatConversationList";
import ChatMessageList from "../components/chat/ChatMessageList";
import { useLocation } from "react-router-dom";

const Chat = () => {
  const {
    conversations,
    currentConversation,
    sendMessage,
    setCurrentConversation,
    fetchMessages,
    fetchConversations,
    isConnected,
    isLoading,
  } = useChat();
  const { user, isLoggedIn } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState<string>("conversations");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousConversationIdRef = useRef<string | null>(null);

  // URL param for conversation
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const conversationIdFromURL = params.get("conversation");

  // Auto-select conversation from URL
  useEffect(() => {
    if (conversationIdFromURL && conversations.length > 0) {
      const conv = conversations.find((c) => c._id === conversationIdFromURL);
      if (conv) {
        setCurrentConversation({
          participantId: conv.participantId,
          participantName: conv.participantName,
          toolName: conv.toolName,
        });
        setActiveTab("messages");
      }
    }
  }, [conversationIdFromURL, conversations, setCurrentConversation]);

  // Handle sending messages
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentConversation || isSending) return;
    try {
      setIsSending(true);
      sendMessage(currentConversation.participantId, messageInput);
      setMessageInput("");
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Select conversation
  const handleConversationSelect = async (conversation: ConversationUI) => {
    if (currentConversation?.participantId === conversation.participantId) return;
    setCurrentConversation({
      participantId: conversation.participantId,
      participantName: conversation.participantName,
      toolName: conversation.toolName,
    });
    setActiveTab("messages");
    setError(null);
    try {
      await fetchMessages(conversation.id);
    } catch {
      setError("Failed to load messages. Please try again.");
    }
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const handleBack = () => {
    setCurrentConversation(null);
    setActiveTab("conversations");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Total unread
  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );

  // Get messages for the currently selected conversation
  const currentMessages = React.useMemo(() => {
    if (!currentConversation) return [];
    const selectedConversation = conversations.find(
      (c) => c.participantId === currentConversation.participantId
    );
    return selectedConversation?.messages || [];
  }, [currentConversation, conversations]);

  // Fetch conversations periodically
  useEffect(() => {
    if (isLoggedIn) {
      fetchConversations();
      const intervalId = setInterval(() => {
        if (activeTab === "conversations") {
          fetchConversations();
        }
      }, 30000);
      return () => clearInterval(intervalId);
    }
  }, [fetchConversations, isLoggedIn, activeTab]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (currentMessages.length > 0) {
      scrollToBottom();
    }
  }, [currentMessages.length]);

  // Convert Conversation type to ConversationUI type
  const conversationsUI: ConversationUI[] = conversations.map(
    (conversation: Conversation) => ({
      id: conversation._id,
      participantId: conversation.participantId,
      participantName: conversation.participantName,
      toolName: conversation.toolName,
      lastMessage:
        conversation.messages.length > 0
          ? conversation.messages[conversation.messages.length - 1].text
          : undefined,
      lastMessageTime:
        conversation.messages.length > 0
          ? new Date(
              conversation.messages[conversation.messages.length - 1].timestamp
            )
          : undefined,
      unreadCount: conversation.unreadCount,
    })
  );

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto py-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        <Card className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to be logged in to access messages. Please log in to
              continue.
            </AlertDescription>
          </Alert>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isConnected && (
        <Alert variant="default" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Connection lost. Reconnecting...</AlertDescription>
        </Alert>
      )}

      <Card className="border rounded-lg overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="conversations" className="relative">
              Conversations
              {totalUnread > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {totalUnread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages" disabled={!currentConversation}>
              {currentConversation
                ? `Chat with ${currentConversation.participantName}`
                : "Messages"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="m-0">
            {isLoading && (
              <div className="flex justify-center items-center p-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="ml-2">Loading...</span>
              </div>
            )}
            <ScrollArea className="h-[70vh]">
              <ChatConversationList
                conversations={conversationsUI}
                onSelect={handleConversationSelect}
              />

              {!isLoading && conversations.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-20" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">
                    Start chatting with a tool owner from their listing.
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="messages" className="m-0 flex flex-col h-[70vh]">
            {currentConversation ? (
              <>
                <div className="p-4 border-b flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={handleBack}
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft />
                  </Button>

                  <div className="bg-primary/10 rounded-full p-2">
                    <User className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <p className="font-medium">
                      {currentConversation.participantName}
                    </p>
                    {currentConversation.toolName && (
                      <p className="text-xs text-muted-foreground">
                        Re: {currentConversation.toolName}
                      </p>
                    )}
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  {isLoading && (
                    <div className="flex justify-center my-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}

                  <ChatMessageList
                    messages={currentMessages.map((msg) => ({
                      id: msg._id,
                      senderId: msg.senderId,
                      content: msg.text,
                      timestamp: msg.timestamp,
                      read: true,
                    }))}
                    currentUserId={user?.id || ""}
                  />

                  {!isLoading && currentMessages.length === 0 && (
                    <div className="h-full flex items-center justify-center text-center text-muted-foreground p-4">
                      <div>
                        <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-20" />
                        <p>No messages yet</p>
                        <p className="text-sm mt-2">
                          Send a message to start the conversation.
                        </p>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </ScrollArea>

                <div className="p-4 border-t mt-auto">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1"
                      disabled={isSending || !isConnected}
                    />
                    <Button
                      type="submit"
                      disabled={!messageInput.trim() || !isConnected || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Send
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground flex-1 flex flex-col items-center justify-center">
                <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Chat;
