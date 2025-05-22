import React from "react";
import { useNotifications, Notification } from "@/contexts/NotificationsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  ShoppingCart,
  CreditCard,
  Bell,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const NotificationItem: React.FC<{
  notification: Notification;
  onRead: (id: string) => void;
}> = ({ notification, onRead }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onRead(notification.id);
    if (notification.type === "chat" && notification.relatedId) {
      navigate("/chat");
    } else if (notification.type === "order" && notification.relatedId) {
      navigate(`/tools/${notification.relatedId}`);
    } else if (notification.type === "payment" && notification.relatedId) {
      navigate("/dashboard");
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "chat":
        return <MessageCircle className="h-5 w-5" />;
      case "order":
        return <ShoppingCart className="h-5 w-5" />;
      case "payment":
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <Card
      className={`mb-3 cursor-pointer ${notification.read ? "opacity-70" : "border-primary"}`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${notification.read ? "bg-muted" : "bg-primary/10"}`}>
            {getIcon()}
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <h4 className="font-medium">{notification.title}</h4>
              <span className="text-xs text-muted-foreground">
                {format(new Date(notification.createdAt), "MMM d, h:mm a")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
          </div>
          {!notification.read && (
            <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  const chatNotifications = notifications.filter(n => n.type === "chat");
  const orderNotifications = notifications.filter(n => n.type === "order");
  const paymentNotifications = notifications.filter(n => n.type === "payment");

  // Set a min-height so tab content doesn't shift (adjust as needed)
  const tabContentMinHeight = "min-h-[300px]"; // Tailwind: min-height: 300px

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
          <Button variant="outline" size="sm" onClick={clearNotifications}>
            Clear All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="chat">Chat ({chatNotifications.length})</TabsTrigger>
          <TabsTrigger value="order">Orders ({orderNotifications.length})</TabsTrigger>
          <TabsTrigger value="payment">Payments ({paymentNotifications.length})</TabsTrigger>
        </TabsList>

        {/* Wrap all TabsContent in a div with min-height for alignment */}
        <div className={`w-full ${tabContentMinHeight} pt-2`}>
          <TabsContent value="all">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                <Bell className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>No notifications yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat">
            {chatNotifications.length > 0 ? (
              chatNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>No chat notifications</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="order">
            {orderNotifications.length > 0 ? (
              orderNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>No order notifications</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payment">
            {paymentNotifications.length > 0 ? (
              paymentNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>No payment notifications</p>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Notifications;
