import React, { useEffect, useRef, useMemo } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";

export interface Message {
  id?: string;
  senderId: string;
  content?: string;
  text?: string;
  timestamp: Date | string;
  read?: boolean;
}

interface ChatMessageListProps {
  messages: Message[];
  currentUserId: string;
}

const ChatMessageList = ({ messages, currentUserId }: ChatMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);

  // Use a stable ID for each message and normalize the structure
  const normalizedMessages = useMemo(
    () =>
      messages.map((message) => ({
        id:
          message.id ||
          `${message.senderId}-${new Date(message.timestamp).getTime()}`,
        senderId: message.senderId,
        content: message.content || message.text || "",
        timestamp:
          message.timestamp instanceof Date
            ? message.timestamp
            : new Date(message.timestamp),
        read: message.read || false,
      })),
    [messages]
  );

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { [date: string]: any[] } = {};
    normalizedMessages.forEach((message) => {
      const date = format(message.timestamp, "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  }, [normalizedMessages]);

  useEffect(() => {
    const shouldScrollToBottom = prevMessagesLengthRef.current < messages.length;
    if (shouldScrollToBottom && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

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

  if (normalizedMessages.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No messages yet
      </div>
    );
  }

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
            const isCurrentUser = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  isCurrentUser ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg px-4 py-2",
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs opacity-70">
                      {format(message.timestamp, "h:mm a")}
                    </span>
                    {isCurrentUser && message.read && (
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