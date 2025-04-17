import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    Star, Calendar, ChevronLeft, Info, MapPin, User, MessageCircle, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTool } from "@/contexts/ToolContext";

interface Owner {
    _id: string;
    name: string;
    rating: number;
    responseTime: string;
}

interface Tool {
    _id: string;
    name: string;
    description: string;
    price: number;
    rating: number;
    image: string;
    category: string;
    location: string;
    owner?: Owner;
    createdAt: Date;
    website?: string;
    specifications?: { [key: string]: string };
    rules: string[];
}

const ToolDetail = () => {
    const { toolId } = useParams<{ toolId: string }>();
    const { tool, isFetchingTool, fetchError, fetchTool } = useTool();
    const isLoading = isFetchingTool;
    const error = fetchError;
    const { user } = useAuth();
    const { toast } = useToast();
    const { createConversation } = useChat();
    const navigate = useNavigate();

    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(
        new Date(new Date().setDate(new Date().getDate() + 3))
    );
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        if (toolId) {
            fetchTool(toolId);
        }
    }, [toolId, fetchTool]);

    const handleContact = async () => {
        if (tool && tool.owner && tool.owner._id && user) {
            console.log("Here is the tool ", tool)
            try {
                // const conversationId = await createConversation(tool.owner._id);
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        senderId: user.email,
                        receiverId: tool.owner._id,
                        message: `I am interested in ${tool.name}`,
                    }),
                });
                if (response.ok) {
                  const data = await response.json();
                  navigate(`/chat?conversation=${data.roomId}`);
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to create conversation.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error("Error creating conversation:", error);
                toast({
                    title: "Error",
                    description: "Failed to contact the owner.",
                    variant: "destructive",
                });
            }
        } else {
            toast({
                title: "Error",
                description: "Tool is null or the owner information is missing, or you must be logged in to contact the owner.",
                variant: "destructive",
            });
        }
    };


    const handleBookNow = () => {
        setIsBooking(true);

        // Simulate API call
        setTimeout(() => {
            setIsBooking(false);

            toast({
                title: "Booking Successful!",
                description: `You've booked ${tool?.name} from ${startDate ? format(startDate, "MMM dd, yyyy") : "today"} to ${endDate ? format(endDate, "MMM dd, yyyy") : ""}`,
            });
        }, 1500);
    };

    // Calculate rental duration and total cost
    const calculateDays = () => {
        if (!startDate || !endDate) return 1;

        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays || 1;
    };

    const rentalDays = calculateDays();
    const subtotal = (tool?.price || 0) * rentalDays;
    const serviceFee = subtotal * 0.1; // 10% service fee
    const total = subtotal + serviceFee;

  if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Loading Tool Details...</h1>
            </div>
        );
    }

  if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Error</h1>
                <p className="mb-8">There was an error fetching the tool details: {error}</p>
                <Button asChild>
                    <Link to="/tools">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Tools
                    </Link>
                </Button>
            </div>
        );
    }

    if (!tool) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Tool Not Found</h1>
                <p className="mb-8">The tool you're looking for doesn't exist or has been removed.</p>
                <Button asChild>
                    <Link to="/tools">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Tools
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link to="/tools" className="inline-flex items-center text-primary hover:underline">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Tools
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tool Image and Details */}
                <div className="lg:col-span-2">
                    <div className="bg-muted rounded-lg overflow-hidden mb-6 aspect-video">
                        <img
                            src={tool.image}
                            alt={tool.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="mb-8">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{tool.name}</h1>
                                <div className="flex items-center text-sm text-muted-foreground mb-2">
                                    <MapPin className="mr-1 h-4 w-4" />
                                    <span>{tool.location}</span>
                                </div>
                                <div className="flex items-center">
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                    <span className="ml-1 text-sm font-medium">
                                        {tool.rating} rating
                                    </span>
                                </div>
                            </div>
                            <span className="text-2xl font-bold">${tool.price}/day</span>
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
                                            {tool.specifications &&
                                                Object.entries(tool.specifications).map(([key, value]) => (
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
                                            {tool.rules?.map((rule, index) => (
                                                <li key={index} className="flex items-start">
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

                    {/* About the owner section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4">About the Owner</h2>
                        <div className="flex items-start space-x-4">
                            <div className="bg-primary/10 rounded-full p-3">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                {/* Check if tool.owner exists before accessing its properties */}
                                {tool.owner ? (
                                    <>
                                        <h3 className="font-semibold">{tool.owner?.name}</h3>
                                        <div className="flex items-center mt-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                            <span className="ml-1 text-sm">{tool.owner?.rating} rating</span>
                                        </div>
                                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                            <Clock className="mr-1 h-4 w-4" />
                                            <span>Typically responds in {tool.owner?.responseTime}</span>
                                        </div>
                                        <Button variant="outline" className="mt-3" size="sm" onClick={handleContact}>
                                            <MessageCircle className="mr-2 h-4 w-4" /> Contact
                                        </Button>
                                    </>
                                ) : (
                                    <p>Owner information not available</p>
                                )}
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
                                    <label className="block text-sm font-medium mb-1">
                                        Start Date
                                    </label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {startDate
                                                    ? format(startDate, "MMM dd, yyyy")
                                                    : "Select date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={startDate}
                                                onSelect={setStartDate}
                                                initialFocus
                                                disabled={(date) => date < new Date()}
                                                className={cn("p-3 pointer-events-auto")}
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
                                                initialFocus
                                                disabled={(date) =>
                                                    startDate ? date < startDate : date < new Date()
                                                }
                                                className={cn("p-3 pointer-events-auto")}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Rental Duration
                                </label>
                                <p className="text-muted-foreground">
                                    {startDate && endDate
                                        ? `${rentalDays} days`
                                        : "Select start and end dates"}
                                </p>
                            </div>

                            <div className="mb-4">
                                <Separator className="my-2" />
                                <div className="flex justify-between mb-2">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Service Fee</span>
                                    <span>${serviceFee.toFixed(2)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="w-full" disabled={isBooking}>
                                        {isBooking ? (
                                            <>
                                                <Clock className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            "Book Now"
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. Please confirm your booking
                                            details.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleBookNow}>
                                            Confirm
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ToolDetail;
