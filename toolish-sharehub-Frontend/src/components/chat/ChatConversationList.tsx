import React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { User, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Updated ConversationUI interface to match the existing data structure
export interface ConversationUI {
  id: string;
  participantId: string;  // This needs to be required for compatibility
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

const ChatConversationList: React.FC<ChatConversationListProps> = ({
  conversations,
  onSelect,
}) => {
  // Sort conversations by last message time (newest first)
  const sortedConversations = [...conversations].sort((a, b) => {
    if (!a.lastMessageTime) return 1;
    if (!b.lastMessageTime) return -1;
    return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
  });

  // Format date consistently with the rest of the application
  const formatMessageDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return format(date, "MMM d");
    }
  };

  return (
    <div className="divide-y">
      {sortedConversations.map((conversation) => (
        <div
          key={conversation.id}
          className="p-4 hover:bg-muted cursor-pointer transition-colors"
          onClick={() => onSelect(conversation)}
        >
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 rounded-full p-2 mt-1">
              {conversation.toolName ? (
                <Wrench className="h-5 w-5 text-primary" />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-medium truncate">{conversation.participantName}</h3>
                {conversation.lastMessageTime && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatMessageDate(conversation.lastMessageTime)}
                  </span>
                )}
              </div>
              
              {conversation.toolName && (
                <p className="text-xs text-muted-foreground mb-1">
                  Re: {conversation.toolName}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                {conversation.lastMessage ? (
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No messages yet</p>
                )}
                
                {conversation.unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {sortedConversations.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <p>No conversations yet</p>
        </div>
      )}
    </div>
  );
};

export default ChatConversationList;