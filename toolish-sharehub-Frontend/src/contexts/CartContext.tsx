import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  condition: string;
  image?: string;
  location?: string;
  owner?: {
    _id: string;
    name: string;
    rating: number;
    responseTime: string;
  };
  startDate: Date;
  endDate: Date;
  rentalDays: number;
  insurance: boolean;
  subtotal: number;
  serviceFee: number;
  total: number;
  address?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  serviceFee: number;
  total: number;
  updateAddress: (address: string) => void;
  address: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem("cart-items");
    return stored ? JSON.parse(stored, (key, value) => {
      if (key === "startDate" || key === "endDate") return new Date(value);
      return value;
    }) : [];
  });
  const [address, setAddress] = useState(() => localStorage.getItem("cart-address") || "");

  useEffect(() => {
    localStorage.setItem("cart-items", JSON.stringify(items));
  }, [items]);
  useEffect(() => {
    localStorage.setItem("cart-address", address);
  }, [address]);

  const addItem = (item: CartItem) => {
    setItems(prev =>
      prev.some(i => i.id === item.id) ? prev : [...prev, item]
    );
  };
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setItems([]);
  const updateAddress = (addr: string) => setAddress(addr);

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const serviceFee = items.reduce((sum, i) => sum + i.serviceFee, 0);
  const total = items.reduce((sum, i) => sum + i.total, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, clearCart,
      subtotal, serviceFee, total, updateAddress, address
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
