import React, { useContext } from "react";
import { ChatContext, Conversation } from "@/contexts/ChatContext";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Wrench } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

export interface ConversationUI {
  id: string;
  participantName: string;
  toolName?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

interface ChatConversationListProps {
  conversations: ConversationUI[];
  onSelect: (conversation: ConversationUI) => void;
}

const ChatConversationList = ({ conversations, onSelect }: ChatConversationListProps) => {
  const formatTime = (date?: Date) => {
    if (!date) return "";

    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };

  return (
    <div className="divide-y">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onSelect(conversation)}
        >
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div className="bg-primary/10 rounded-full p-3">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">{conversation.participantName}</div>
                {conversation.toolName && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Wrench className="h-3 w-3 mr-1" />
                    {conversation.toolName}
                  </div>
                )}
                {conversation.lastMessage && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                    {conversation.lastMessage}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              {conversation.lastMessageTime && (
                <span className="text-xs text-muted-foreground">
                  {formatTime(conversation.lastMessageTime)}
                </span>
              )}
              {conversation.unreadCount > 0 && (
                <Badge variant="destructive" className="px-2 py-0.5">
                  {conversation.unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatConversationList;
