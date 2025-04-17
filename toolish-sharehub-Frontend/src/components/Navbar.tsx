import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import Input component
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  ShoppingCart,
  Menu,
  LogOut,
  User,
  Settings,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useChat } from "@/contexts/ChatContext";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isMobile?: boolean;
  onClick?: () => void;
}

const NavLink = ({ href, children, isMobile, onClick }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  const className = cn(
    isMobile
      ? "block px-4 py-2 text-lg font-medium"
      : "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
    isActive
      ? isMobile
        ? "text-primary"
        : "bg-primary text-primary-foreground"
      : isMobile
      ? "hover:text-primary"
      : "hover:bg-primary/10"
  );

  return (
    <Link to={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
};

const Navbar = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const { items } = useCart();
  const { conversations } = useChat();

  // Calculate total unread messages
  const unreadMessages = conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0
  );
  const totalItems = items.length; // Assuming cartItems is an array of items

  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <img
              src="/logo.svg" // Replace with your logo path
              alt="ToolShare Logo"
              className="h-8"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/tools">Tools</NavLink>
            <NavLink href="/how-it-works">How It Works</NavLink>
            <NavLink href="/about">About</NavLink>
          </nav>
        </div>

        <div className="hidden md:flex-1 md:block">
          {" "}
          {/* flex-1 makes it take available space */}
          <Input type="search" placeholder="Search for tools..." />{" "}
          {/* Use Shadcn Input component */}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link to="/chat" className="mr-2 relative">
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-5 w-5" />
                    {unreadMessages > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadMessages}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <Link to="/cart" className="relative">
                  <Button variant="outline">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart
                    {totalItems > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {totalItems}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="ml-2">
                      <User className="mr-2 h-4 w-4" />
                      {user?.name }
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="w-full cursor-pointer">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/chat" className="w-full cursor-pointer">
                        Messages
                        {unreadMessages > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {unreadMessages}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="w-full cursor-pointer">
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/cart" className="relative">
                  <Button variant="outline">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart
                    {totalItems > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {totalItems}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link to="/signin">
                  <Button variant="default">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline">Register</Button>
                </Link>
              </>
            )}
          </div>
          <div className="hidden md:flex items-center">
          </div>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Toggle Menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className="mb-4">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <div className="flex flex-col space-y-2">
                <NavLink
                  href="/"
                  isMobile
                  onClick={() => setIsSheetOpen(false)}
                >
                  Home
                </NavLink>
                <NavLink
                  href="/tools"
                  isMobile
                  onClick={() => setIsSheetOpen(false)}
                >
                  Tools
                </NavLink>
                <NavLink
                  href="/how-it-works"
                  isMobile
                  onClick={() => setIsSheetOpen(false)}
                >
                  How It Works
                </NavLink>
                <NavLink
                  href="/about"
                  isMobile
                  onClick={() => setIsSheetOpen(false)}
                >
                  About
                </NavLink>

                {isLoggedIn ? (
                  <>
                    <NavLink
                      href="/dashboard"
                      isMobile
                      onClick={() => setIsSheetOpen(false)}
                    >
                      Dashboard
                    </NavLink>
                    <NavLink
                      href="/chat"
                      isMobile
                      onClick={() => setIsSheetOpen(false)}
                    >
                      Messages {unreadMessages > 0 && `(${unreadMessages})`}
                    </NavLink>
                    <NavLink
                      href="/cart"
                      isMobile
                      onClick={() => setIsSheetOpen(false)}
                    >
                      Cart {totalItems > 0 && `(${totalItems})`}
                    </NavLink>
                    {isAdmin && (
                      <NavLink
                        href="/admin"
                        isMobile
                        onClick={() => setIsSheetOpen(false)}
                      >
                        Admin Panel
                      </NavLink>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-lg font-medium hover:text-primary"
                      onClick={() => {
                        logout();
                        setIsSheetOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <NavLink
                      href="/cart"
                      isMobile
                      onClick={() => setIsSheetOpen(false)}
                    >
                      Cart {totalItems > 0 && `(${totalItems})`}
                    </NavLink>
                    <NavLink
                      href="/signin"
                      isMobile
                      onClick={() => setIsSheetOpen(false)}
                    >
                      Sign In
                    </NavLink>
                    <NavLink
                      href="/register"
                      isMobile
                      onClick={() => setIsSheetOpen(false)}
                    >
                      Register
                    </NavLink>
                  </>
                )}

                <div className="px-4 pt-4 pb-2">
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
