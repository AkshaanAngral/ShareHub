import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/NotificationsContext";
import { Badge } from "@/components/ui/badge";

interface NotificationBellProps {
  variant?: "default" | "ghost" | "outline";
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  variant = "ghost" 
}) => {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
    <Button 
      variant={variant} 
      size="icon" 
      className="relative"
      onClick={() => navigate("/notifications")}
    >
      <Bell className="h-[1.2rem] w-[1.2rem]" />
      {unreadCount > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 min-w-[1.2rem] h-[1.2rem] p-0 flex items-center justify-center text-xs" 
          variant="destructive"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationBell;
