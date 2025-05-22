import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Star, 
  Calendar, 
  ChevronLeft, 
  Info, 
  MapPin, 
  User,
  MessageCircle,
  Shield,
  Clock,
  Truck,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTool } from "@/contexts/ToolContext";
import { useChat } from "@/contexts/ChatContext";

const MAX_RENTAL_DAYS = 30;

const ToolDetail = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const { tool, isFetchingTool, fetchError, fetchTool } = useTool();
  const { user } = useAuth();
  const { toast } = useToast();
  const { createConversation } = useChat();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() + 3)));
  const [insurance, setInsurance] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    if (toolId) fetchTool(toolId);
  }, [toolId, fetchTool]);

  const rentalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const insuranceFee = insurance ? (tool?.price || 0) * 0.15 * rentalDays : 0;
  const subtotal = (tool?.price || 0) * rentalDays + insuranceFee;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  const handleContact = () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please login to contact the owner", variant: "destructive" });
      navigate('/login', { state: { from: `/tools/${toolId}` } });
      return;
    }
    
    if (messageInput.trim() && tool && tool.owner) {
      createConversation(tool.owner._id, tool.owner.name, tool.name)
        .then(conversationId => {
          if (conversationId) {
            navigate(`/chat?conversation=${conversationId}`);
            setMessageInput("");
          } else {
            toast({ title: "Error", description: "Failed to create conversation.", variant: "destructive" });
          }
        });
    } else if (!messageInput.trim()) {
      toast({ title: "Empty Message", description: "Please enter a message" });
    }
  };

  const handleBookNow = () => {
    setIsBooking(true);
    
    // Simulate booking process
    setTimeout(() => {
      setIsBooking(false);
      
      if (!user) {
        toast({ title: "Login Required", description: "Please login to book tools", variant: "destructive" });
        navigate('/login');
        return;
      }
      
      if (rentalDays > MAX_RENTAL_DAYS) {
        toast({ 
          title: "Max duration exceeded", 
          description: `Max rental period is ${MAX_RENTAL_DAYS} days`, 
          variant: "destructive" 
        });
        return;
      }
      
      addItem({
        id: tool._id,
        name: tool.name,
        price: tool.price,
        category: tool.category,
        condition: "New",
        image: tool.image,
        location: tool.location,
        owner: tool.owner,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        rentalDays,
        insurance,
        subtotal,
        serviceFee,
        total,
      });
      
      toast({ 
        title: "Added to Cart!", 
        description: ` ${tool.name} added to cart for booking from ${format(startDate, "MMM dd, yyyy")} to ${format(endDate, "MMM dd, yyyy")}` 
      });
      
      navigate("/cart");
    }, 1500);
  };

  const handleAddToCart = () => {
    if (!tool) return;
    
    addItem({
      id: tool._id,
      name: tool.name,
      price: tool.price,
      category: tool.category,
      condition: "New",
      image: tool.image,
      location: tool.location,
      owner: tool.owner,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      rentalDays,
      insurance,
      subtotal,
      serviceFee,
      total,
    });
    
    toast({ title: "Added to Cart", description: `${tool.name} added for booking.` });
  };

  if (isFetchingTool) return <div className="container mx-auto px-4 py-16 text-center">Loading Tool Details...</div>;
  if (fetchError) return <div className="container mx-auto px-4 py-16 text-center">Error: {fetchError}</div>;
  if (!tool) return <div className="container mx-auto px-4 py-16 text-center">Tool Not Found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/tools" className="inline-flex items-center text-primary hover:underline">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Tools
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tool Details */}
        <div className="lg:col-span-2">
          <div className="bg-muted rounded-lg overflow-hidden mb-6 aspect-video">
            <img src={tool.image} alt={tool.name} className="w-full h-full object-cover" />
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="mr-1 h-4 w-4" /><span>{tool.location}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 text-sm font-medium">{tool.rating} rating</span>
                </div>
              </div>
              <span className="text-2xl font-bold">₹{tool.price}/day</span>
            </div>
            
            <div className="flex gap-3 mb-6">
              <Button onClick={handleAddToCart} variant="outline">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <Link to="/cart">
                <Button variant="secondary">
                  View Cart
                </Button>
              </Link>
            </div>
            
            <p className="text-muted-foreground mb-6">{tool.description}</p>
            
            <Tabs defaultValue="specifications">
              <TabsList className="mb-4">
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="rules">Rental Rules</TabsTrigger>
              </TabsList>
              
              <TabsContent value="specifications">
                <Card>
                  <CardContent className="p-4">
                    <ul className="divide-y">
                      {tool.specifications && Object.entries(tool.specifications).map(([key, value]) => (
                        <li key={key} className="py-2 flex justify-between">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="rules">
                <Card>
                  <CardContent className="p-4">
                    <ul className="space-y-2">
                      {tool.rules?.map((rule, idx) => (
                        <li key={idx} className="flex items-start">
                          <Info className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Owner section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">About the Owner</h2>
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 rounded-full p-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                {tool.owner ? (
                  <>
                    <h3 className="font-semibold">{tool.owner?.name}</h3>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 text-sm">{tool.owner?.rating} rating</span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>Typically responds in few hours.</span>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="mr-2 h-4 w-4" /> Contact
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Contact {tool.owner?.name}</DialogTitle>
                            <DialogDescription>
                              Send a message to the owner about this tool.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="py-4">
                            <Input
                              placeholder="Write your message here..."
                              value={messageInput}
                              onChange={(e) => setMessageInput(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button 
                              onClick={handleContact} 
                              disabled={!messageInput.trim()}
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Send Message
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Link to="/chat">
                        <Button variant="ghost" size="sm">
                          View All Messages
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : <p>Owner information not available</p>}
              </div>
            </div>
          </div>
        </div>
        
        {/* Booking Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-6">Book This Tool</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "MMM dd, yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        disabled={(date) => date < new Date()}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "MMM dd, yyyy") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => date <= startDate}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={insurance} 
                    onChange={() => setInsurance(prev => !prev)}
                    className="rounded text-primary"
                  />
                  <span>Add Damage Protection Insurance (+₹{((tool.price || 0) * 0.15).toFixed(2)}/day)</span>
                </label>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    ₹{tool.price} × {rentalDays} day{rentalDays > 1 ? "s" : ""}
                  </span>
                  <span>₹{(tool.price * rentalDays).toFixed(2)}</span>
                </div>
                {insurance && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Insurance</span>
                    <span>₹{insuranceFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service fee (10%)</span>
                  <span>₹{serviceFee.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full" disabled={isBooking}>
                    {isBooking ? "Processing..." : "Book Now"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm adding to cart.</AlertDialogTitle>
                    <AlertDialogDescription>
                     The item will be added to cart.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBookNow}>Confirm Booking</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <div className="mt-4 flex items-center justify-center text-sm text-muted-foreground">
                <Shield className="mr-2 h-4 w-4" />
                <span>Secure payment protection</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ToolDetail;