import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  ChevronLeft,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { useChat, Conversation } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import ChatConversationList, { ConversationUI } from "@/components/chat/ChatConversationList";
import ChatMessageList from "@/components/chat/ChatMessageList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

const Chat = () => {
  const { conversations, currentConversation, sendMessage, setCurrentConversation } = useChat();
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState<string>("conversations");
  const [messages, setMessages] = useState<any>([]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentConversation) return;

    sendMessage(currentConversation.participantId, messageInput);
    setMessageInput("");
  };

  const handleConversationSelect = (conversation: ConversationUI) => {
    setCurrentConversation({
      participantId: conversation.id,
      participantName: conversation.participantName,
      toolName: conversation.toolName,
    });
    setActiveTab("messages");
  };

  const handleBack = () => {
    setCurrentConversation(null);
    setActiveTab("conversations");
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  // useEffect to update messages when currentConversation changes
  useEffect(() => {
    if (currentConversation) {
      // Find the selected conversation and update the messages
      const selectedConversation = conversations.find(
        (conv) => conv._id === currentConversation.participantId
      );
      if (selectedConversation) {
        setMessages(selectedConversation.messages);
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [currentConversation, conversations]);

  // Convert Conversation type to ConversationUI type
  const conversationsUI: ConversationUI[] = conversations.map((conversation) => ({
    id: conversation._id,
    participantName: conversation.participantName,
    toolName: conversation.toolName,
    lastMessage: conversation.messages.length > 0 ? conversation.messages[conversation.messages.length - 1].text : undefined,
    lastMessageTime: conversation.messages.length > 0 ? new Date(conversation.messages[conversation.messages.length - 1].timestamp) : undefined,
    unreadCount: conversation.unreadCount,
  }));

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

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
            <TabsTrigger
              value="messages"
              disabled={!currentConversation}
            >
              {currentConversation ? `Chat with ${currentConversation.participantName}` : "Messages"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="m-0">
            <ScrollArea className="h-[70vh]">
              <ChatConversationList
                conversations={conversationsUI}
                onSelect={handleConversationSelect}
              />

              {conversations.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-20" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start chatting with a tool owner from their listing.</p>
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
                  >
                    <ChevronLeft />
                  </Button>

                  <div className="bg-primary/10 rounded-full p-2">
                    <User className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <p className="font-medium">{currentConversation.participantName}</p>
                    {currentConversation.toolName && (
                      <p className="text-xs text-muted-foreground">
                        Re: {currentConversation.toolName}
                      </p>
                    )}
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <ChatMessageList
                    messages={messages}
                    currentUserId={user?.id || ""}
                  />

                  {messages.length === 0 && (
                    <div className="h-full flex items-center justify-center text-center text-muted-foreground p-4">
                      <div>
                        <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-20" />
                        <p>No messages yet</p>
                        <p className="text-sm mt-2">Send a message to start the conversation.</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>

                <div className="p-4 border-t mt-auto">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!messageInput.trim()}>
                      <Send className="h-4 w-4 mr-2" />
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
