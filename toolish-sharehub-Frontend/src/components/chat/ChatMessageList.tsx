import React, { useEffect, useRef } from "react";
import { Message as MessageContext } from "@/contexts/ChatContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface ChatMessageListProps {
  messages: Message[];
  currentUserId: string;
}

const ChatMessageList = ({ messages, currentUserId }: ChatMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Group messages by date
  const groupedMessages: { [date: string]: Message[] } = {};

  messages.forEach((message) => {
    const date = format(new Date(message.timestamp), "yyyy-MM-dd");
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return "Today";
    } else if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) {
      return "Yesterday";
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="text-center">
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
              {formatDate(date)}
            </span>
          </div>

          {dateMessages.map((message) => {
            const isSentByCurrentUser = message.senderId === currentUserId;

            return (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  isSentByCurrentUser ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg px-4 py-2",
                    isSentByCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs opacity-70">
                      {format(new Date(message.timestamp), "h:mm a")}
                    </span>
                    {isSentByCurrentUser && message.read && (
                      <CheckCheck className="h-3 w-3 opacity-70" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
