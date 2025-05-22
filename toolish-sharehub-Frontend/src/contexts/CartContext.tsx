import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the address interface
interface DeliveryAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// Define the cart item interface
interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  condition: string;
  rentalDays: number;
  image: string; // Added the image property
  insurance: boolean;
  subtotal: number; 
  total?: number;
  location?: string;
  startDate?: string;
  serviceFee: number;
  endDate?: string;
  owner?: {
    _id: string;
    name: string;
    rating: number;
  };
}

// Define the cart context interface
interface CartContextType {
  items: CartItem[];
  address: DeliveryAddress;
  subtotal: number;
  serviceFee: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateAddress: (addressField: keyof DeliveryAddress, value: string) => void;
  getItemCount: () => number;
}

// Create context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  address: {
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  },
  subtotal: 0,
  serviceFee: 0,
  total: 0,
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
  updateAddress: () => {},
  getItemCount: () => 0
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// CartProvider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<DeliveryAddress>({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const [subtotal, setSubtotal] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [total, setTotal] = useState(0);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedAddress = localStorage.getItem('deliveryAddress');
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
    
    if (savedAddress) {
      try {
        const parsedAddress = JSON.parse(savedAddress);
        setAddress(parsedAddress);
      } catch (error) {
        console.error('Failed to parse address from localStorage:', error);
      }
    }
  }, []);

  // Calculate totals whenever items change
  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => {
      const itemTotal = item.price * (item.rentalDays || 1);
      return sum + itemTotal;
    }, 0);
    
    const newServiceFee = newSubtotal * 0.1; // 10% service fee
    const newTotal = newSubtotal + newServiceFee;
    
    setSubtotal(newSubtotal);
    setServiceFee(newServiceFee);
    setTotal(newTotal);
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Save address to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('deliveryAddress', JSON.stringify(address));
  }, [address]);

  // Add item to cart
  const addItem = (item: CartItem) => {
    setItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex !== -1) {
        // Replace existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = item;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, item];
      }
    });
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
  };

  // Update address
  const updateAddress = (addressField: keyof DeliveryAddress, value: string) => {
    setAddress(prev => ({
      ...prev,
      [addressField]: value
    }));
  };

  // Get item count
  const getItemCount = () => {
    return items.length;
  };

  // Context value
  const contextValue: CartContextType = {
    items,
    address,
    subtotal,
    serviceFee,
    total,
    addItem,
    removeItem,
    clearCart,
    updateAddress,
    getItemCount
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;