declare global {
  interface Window {
    Razorpay: any;
  }
}

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, ChevronLeft, Plus, Minus, CreditCard } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
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

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // --- FIX: Declare and calculate serviceFee and total ---
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  // Ensure Razorpay script is loaded
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
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

    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const token = localStorage.getItem('token');
const { data } = await axios.post(
  '/api/payment/create-order',
  {},
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      const { order, key, paymentId } = data;

      // 2. Check if Razorpay is loaded
      if (!window.Razorpay) {
        toast({
          title: "Payment failed",
          description: "Payment gateway is not loaded. Please refresh the page.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      // 3. Configure Razorpay options
      const options = {
        key,
        amount: order.amount, // Amount in paise from backend
        currency: order.currency,
        name: "Toolish ShareHub",
        description: "Tool rental payment",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            await axios.post("/api/payment/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentId
            }, { withCredentials: true });

            toast({
              title: "Payment successful!",
              description: "Your order has been placed.",
            });
            clearCart();
            navigate("/dashboard");
          } catch (err: any) {
            toast({
              title: "Payment verification failed",
              description: err.response?.data?.message || "Something went wrong",
              variant: "destructive"
            });
          }
        },
        prefill: {},
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
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay error:", err);
      toast({
        title: "Payment failed",
        description: err.response?.data?.message || "Something went wrong",
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
                            <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 flex justify-between">
                            <div>
                              <p>{item.category}</p>
                              <Badge variant="outline" className="mt-1">{item.condition}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                <Minus className="h-5 w-5" />
                              </button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                <Plus className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
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
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee (10%)</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
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
