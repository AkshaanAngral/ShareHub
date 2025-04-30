import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string; // MongoDB ObjectId as string
  name: string;
  price: number;
  category: string;
  condition: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const getToken = () => localStorage.getItem("token");

  // --- Error handler using res.clone() ---
  const handleResponseError = async (res: Response) => {
    if (!res.ok) {
      let errorMessage = "Something went wrong";
      try {
        const data = await res.clone().json();
        errorMessage = data.message || errorMessage;
      } catch {
        try {
          errorMessage = await res.clone().text() || errorMessage;
        } catch {
          // ignore
        }
      }
      throw new Error(errorMessage);
    }
  };

  // --- Fetch cart from backend on mount ---
  useEffect(() => {
    const fetchCart = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const res = await fetch("/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 404) {
          setItems([]); // Cart not found is not an error, just empty
          return;
        }
        await handleResponseError(res);
        const cart = await res.json();
        if (cart && cart.items) {
          setItems(
            cart.items.map((item: any) => ({
              id: item.toolId._id,
              name: item.toolId.name,
              price: item.toolId.price,
              category: item.toolId.category || "",
              condition: item.toolId.condition || "",
              quantity: item.quantity,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };
    fetchCart();
  }, []);

  // --- Add item to cart ---
  const addItem = useCallback(
    async (item: Omit<CartItem, "quantity">) => {
      const token = getToken();
      if (!token) {
        toast({ title: "Please login to add items to cart" });
        return;
      }
      try {
        const res = await fetch("/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ toolId: item.id, quantity: 1 }),
        });

        await handleResponseError(res);

        const updatedCart = await res.json();
        setItems(
          updatedCart.items.map((item: any) => ({
            id: item.toolId._id,
            name: item.toolId.name,
            price: item.toolId.price,
            category: item.toolId.category || "",
            condition: item.toolId.condition || "",
            quantity: item.quantity,
          }))
        );

        toast({
          title: "Item added to cart",
          description: `${item.name} has been added to your cart.`,
        });
      } catch (error: any) {
        toast({ title: "Failed to add item to cart", description: error.message });
        console.error(error);
      }
    },
    [toast]
  );

  // --- Remove item from cart ---
  const removeItem = useCallback(
    async (id: string) => {
      const token = getToken();
      if (!token) {
        toast({ title: "Please login to modify cart" });
        return;
      }
      try {
        const res = await fetch(`/api/cart/remove/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        await handleResponseError(res);

        const updatedCart = await res.json();
        setItems(
          updatedCart.items.map((item: any) => ({
            id: item.toolId._id,
            name: item.toolId.name,
            price: item.toolId.price,
            category: item.toolId.category || "",
            condition: item.toolId.condition || "",
            quantity: item.quantity,
          }))
        );

        toast({
          title: "Item removed",
          description: "The item has been removed from your cart.",
        });
      } catch (error: any) {
        toast({ title: "Failed to remove item from cart", description: error.message });
        console.error(error);
      }
    },
    [toast]
  );

  // --- Update quantity ---
  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (quantity < 1) return;
      const token = getToken();
      if (!token) {
        toast({ title: "Please login to modify cart" });
        return;
      }
      try {
        const res = await fetch(`/api/cart/update/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        });

        await handleResponseError(res);

        const updatedCart = await res.json();
        setItems(
          updatedCart.items.map((item: any) => ({
            id: item.toolId._id,
            name: item.toolId.name,
            price: item.toolId.price,
            category: item.toolId.category || "",
            condition: item.toolId.condition || "",
            quantity: item.quantity,
          }))
        );
      } catch (error: any) {
        toast({ title: "Failed to update cart quantity", description: error.message });
        console.error(error);
      }
    },
    [toast]
  );

  // --- Clear cart ---
  const clearCart = useCallback(async () => {
    const token = getToken();
    if (!token) {
      toast({ title: "Please login to clear cart" });
      return;
    }
    try {
      const res = await fetch("/api/cart/clear", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      await handleResponseError(res);

      const updatedCart = await res.json();
      setItems(
        updatedCart.items.map((item: any) => ({
          id: item.toolId._id,
          name: item.toolId.name,
          price: item.toolId.price,
          category: item.toolId.category || "",
          condition: item.toolId.condition || "",
          quantity: item.quantity,
        }))
      );

      toast({ title: "Cart cleared" });
    } catch (error: any) {
      toast({ title: "Failed to clear cart", description: error.message });
      console.error(error);
    }
  }, [toast]);

  // --- Totals ---
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
