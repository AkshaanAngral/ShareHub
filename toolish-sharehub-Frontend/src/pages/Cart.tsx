import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Trash2, ChevronLeft, CreditCard, MapPin, Calendar, Star, MessageCircle, User
} from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input"; // Import Input component
import { Label } from "@/components/ui/label"; // Import Label component
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

// Define address interface to match our backend structure
interface DeliveryAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Cart = () => {
  const { items, removeItem, clearCart, subtotal, serviceFee, total } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Create structured address state
  const [address, setAddress] = useState<DeliveryAddress>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: ""
  });

  // Update address field handler
  const updateAddressField = (field: keyof DeliveryAddress, value: string) => {
    setAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if address is valid
  const isAddressValid = () => {
    return address.line1 && address.city && address.state && address.pincode;
  };

  // Ensure Razorpay script is loaded
  useEffect(() => {
    const loadRazorpayScript = async () => {
      // Check if script is already loaded or loading
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        return;
      }
      
      return new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => {
          console.log("Razorpay script loaded successfully");
          resolve();
        };
        script.onerror = () => {
          console.error("Failed to load Razorpay script");
          resolve(); // Resolve anyway to not block the app
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  const handleRazorpayPayment = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Login required",
        description: "Please sign in to complete your order",
      });
      navigate("/signin");
      return;
    }

    if (!isAddressValid()) {
      toast({
        title: "Address required",
        description: "Please enter a complete delivery address with Line 1, City, State and PIN code before proceeding to payment.",
        variant: "destructive"
      });
      return;
    }

    // Check if there are items in the cart
    if (items.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Verify Razorpay is available
      if (typeof window.Razorpay === 'undefined') {
        throw new Error("Razorpay SDK failed to load");
      }

      // 1. Create order on backend
      const token = localStorage.getItem('token');
      
      // Format request data properly
      const orderData = {
        items: items, // Send the entire items array
        address: address, // Now sending structured address object
        total: Number(total) // Ensure total is a number
      };
      
      console.log("Order data being sent:", orderData);
      const { data } = await axios.post(
        '/api/payment/create-order',
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      // Extract required data from response
      const { order, key, paymentId } = data;

      if (!order || !order.id || !key) {
        throw new Error("Invalid response from server. Missing order details.");
      }

      // 3. Configure Razorpay options
      const options = {
        key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Toolish ShareHub",
        description: "Tool rental payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify the payment
            const verifyData = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentId
            };

            await axios.post(
              "/api/payment/verify",
              verifyData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
              }
            );

            toast({
              title: "Payment successful!",
              description: "Your order has been placed.",
            });
            clearCart();
            navigate("/dashboard");
          } catch (err) {
            console.error("Payment verification error:", err);
            toast({
              title: "Payment verification failed",
              description: err.response?.data?.message || "Something went wrong",
              variant: "destructive"
            });
          }
        },
        prefill: {
          name: "", // Can be populated if user info is available
          email: "",
          contact: ""
        },
        notes: {
          address: `${address.line1}, ${address.city}, ${address.state} ${address.pincode}`,
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: function () {
            toast({
              title: "Payment cancelled",
              description: "You closed the payment window",
            });
            setIsProcessing(false);
          }
        }
      };

      // 4. Create and open Razorpay instance
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast({
          title: "Payment failed",
          description: response.error.description || "Your payment has failed",
          variant: "destructive"
        });
        setIsProcessing(false);
      });
      
      rzp.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      
      let errorMessage = "Something went wrong with payment initialization";
      
      if (err.response) {
        // Server responded with an error
        errorMessage = err.response.data?.message || 
                      `Server error: ${err.response.status} ${err.response.statusText}`;
        console.log("Server error details:", err.response.data);
      } else if (err.request) {
        // Request was made but no response
        errorMessage = "No response from server. Please check your connection.";
      } else if (err.message) {
        // Something else happened
        errorMessage = err.message;
      }
      
      toast({
        title: "Payment failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/tools" className="inline-flex items-center text-primary hover:underline">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Tools
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShoppingCart className="h-8 w-8" />
          Your Cart
        </h1>
        {items.length > 0 && (
          <p className="text-muted-foreground mt-2">
            You have {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Your cart is empty</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Looks like you haven't added any tools to your cart yet. Browse our available tools and find what you need.
              </p>
              <Button asChild size="lg" className="mt-4">
                <Link to="/tools">Browse Tools</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Cart Items</CardTitle>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-1" /> Clear Cart
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove all items from your cart. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearCart}>Clear Cart</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {items.map((item) => (
                    <li key={item.id} className="py-4">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">
                              <Link to={`/tools/${item.id}`} className="hover:text-primary">
                                {item.name}
                              </Link>
                            </h3>
                            <span className="font-semibold">₹{item.total?.toFixed(2) || item.price.toFixed(2)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 flex justify-between">
                            <div>
                              <p>{item.category}</p>
                              <Badge variant="outline" className="mt-1">{item.condition}</Badge>
                            </div>
                            <span className="font-medium">
                              {item.rentalDays ? `Rental: ${item.rentalDays} days` : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            {item.location && (<><MapPin className="h-4 w-4" /> {item.location}</>)}
                            {item.startDate && item.endDate && (
                              <>
                                <Calendar className="h-4 w-4 ml-4" /> {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                              </>
                            )}
                          </div>
                          {item.insurance && <div className="text-green-600 mt-1">Damage Insurance Included</div>}
                          {item.owner && (
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              <User className="h-4 w-4" /> {item.owner.name}
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {item.owner.rating}
                              <Link
                              to={`/chat/${item.owner._id}`} // Replace with appropriate dynamic chat path
                             className="text-blue-600 hover:underline cursor-pointer"
                               >
                             Contact via chat
                              </Link>
                            </div>
                          )}
                        </div>
                        <Button variant="link" size="sm" className="text-destructive" onClick={() => removeItem(item.id)}>
                          Remove
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="sticky top-16">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee (10%)</span>
                    <span>₹{serviceFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Updated structured address form */}
                <div className="mt-4 space-y-3">
                  <h3 className="font-medium">Delivery Address</h3>
                  
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="address-line1">Address Line 1 *</Label>
                      <Input 
                        id="address-line1"
                        placeholder="Street address, P.O. box"
                        value={address.line1}
                        onChange={(e) => updateAddressField('line1', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address-line2">Address Line 2</Label>
                      <Input 
                        id="address-line2"
                        placeholder="Apartment, suite, unit, building, floor, etc."
                        value={address.line2}
                        onChange={(e) => updateAddressField('line2', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="address-city">City *</Label>
                        <Input 
                          id="address-city"
                          placeholder="City"
                          value={address.city}
                          onChange={(e) => updateAddressField('city', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address-state">State *</Label>
                        <Input 
                          id="address-state"
                          placeholder="State"
                          value={address.state}
                          onChange={(e) => updateAddressField('state', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="address-pincode">PIN Code *</Label>
                        <Input 
                          id="address-pincode"
                          placeholder="PIN code"
                          value={address.pincode}
                          onChange={(e) => updateAddressField('pincode', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address-country">Country</Label>
                        <Input 
                          id="address-country"
                          placeholder="Country"
                          value={address.country || "India"}
                          onChange={(e) => updateAddressField('country', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="default"
                  onClick={handleRazorpayPayment}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? "Processing..." : "Pay with Razorpay"}
                  <CreditCard className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;