require('dotenv').config();
const { sendRenterOrderConfirmation, sendUserOrderConfirmation } = require('../utils/emailHelper');

async function testEmails() {
  try {
    console.log('Testing email functionality...');

    // Mock data for testing
    const mockUser = {
      _id: '60d21b4667d0d8992e610c88',
      name: 'Test User',
      email: process.env.TEST_USER_EMAIL || process.env.EMAIL_USER // Use your email for testing
    };

    const mockRenter = {
      _id: '60d21b4667d0d8992e610c87',
      name: 'Test Renter',
      email: process.env.TEST_RENTER_EMAIL || process.env.EMAIL_USER // Use your email for testing
    };

    const mockTool = {
      _id: '60d21b4667d0d8992e610c86',
      name: 'Electric Drill',
      category: 'Power Tools',
      description: 'Professional grade electric drill',
      price: 250,
      image: 'https://example.com/drill.jpg'
    };

    const mockPayment = {
      _id: '60d21b4667d0d8992e610c85',
      razorpayOrderId: 'order_123456789',
      razorpayPaymentId: 'pay_123456789',
      amount: 750,
      currency: 'INR',
      status: 'paid',
      createdAt: new Date(),
      deliveryAddress: {
        line1: '123 Test Street',
        line2: 'Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      }
    };

    const mockCartItem = {
      toolId: mockTool._id,
      price: mockTool.price,
      rentalDays: 3,
      insurance: true
    };

    // Test sending email to renter (tool owner)
    console.log('Sending test email to renter...');
    await sendRenterOrderConfirmation({
      renter: mockRenter,
      tool: mockTool,
      user: mockUser,
      payment: mockPayment,
      cartItem: mockCartItem
    });
    console.log('✓ Email sent to renter successfully!');

    // Test sending email to user (buyer)
    console.log('Sending test email to user...');
    await sendUserOrderConfirmation({
      user: mockUser,
      tools: [mockTool],
      payment: mockPayment,
      cartItems: [mockCartItem],
      address: mockPayment.deliveryAddress
    });
    console.log('✓ Email sent to user successfully!');

    console.log('All email tests completed successfully!');
  } catch (error) {
    console.error('Error testing emails:', error);
  }
}

// Run the test
testEmails();