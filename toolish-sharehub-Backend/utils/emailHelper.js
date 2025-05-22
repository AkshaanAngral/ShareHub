const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send email to a user
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.html - Email HTML content
 * @returns {Promise} - Email sending result
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send order confirmation email to the renter (tool owner)
 * @param {Object} options - Email data
 * @param {Object} options.renter - Renter details
 * @param {Object} options.tool - Tool details
 * @param {Object} options.user - User (buyer) details
 * @param {Object} options.payment - Payment details
 * @param {Object} options.cartItem - Cart item details
 */
const sendRenterOrderConfirmation = async (options) => {
  const { renter, tool, user, payment, cartItem } = options;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568;">New Tool Rental Order</h2>
      <p>Hello ${renter.name},</p>
      <p>Your tool "${tool.name}" has been rented by ${user.name || user.email}.</p>
      
      <div style="background: #f7fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Order Details</h3>
        <p><strong>Tool:</strong> ${tool.name}</p>
        <p><strong>Rental Days:</strong> ${cartItem.rentalDays}</p>
        <p><strong>Insurance:</strong> ${cartItem.insurance ? 'Yes' : 'No'}</p>
        <p><strong>Price:</strong> ₹${cartItem.price} per day</p>
        <p><strong>Total:</strong> ₹${cartItem.price * cartItem.rentalDays}</p>
        <p><strong>Payment ID:</strong> ${payment.razorpayPaymentId || 'Processing'}</p>
      </div>
      
      <div style="background: #f7fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Renter Information</h3>
        <p><strong>Name:</strong> ${user.name || 'Not provided'}</p>
        <p><strong>Email:</strong> ${user.email}</p>
      </div>
      
      <p>Thank you for using our platform!</p>
      <p style="color: #718096; font-size: 14px;">This is an automated message, please do not reply.</p>
    </div>
  `;

  return sendEmail({
    to: renter.email,
    subject: `Your tool "${tool.name}" has been rented`,
    html
  });
};

/**
 * Send order confirmation email to the user (buyer)
 * @param {Object} options - Email data
 * @param {Object} options.user - User details
 * @param {Object} options.tools - Array of tools details with owners
 * @param {Object} options.payment - Payment details
 * @param {Object} options.cartItems - Cart items details
 * @param {Object} options.address - Delivery address
 */
const sendUserOrderConfirmation = async (options) => {
    const { user, tools, payment, cartItems, address } = options;
    
    // Generate tool items HTML
    let toolItemsHtml = '';
    let totalAmount = 0;
    
    tools.forEach((tool, index) => {
      const cartItem = cartItems.find(item => item.toolId.toString() === tool._id.toString());
      if (cartItem) {
        const itemTotal = cartItem.price * cartItem.rentalDays;
        totalAmount += itemTotal;
        
        toolItemsHtml += `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0;">${index + 1}</td>
            <td style="padding: 10px 0;">${tool.name}</td>
            <td style="padding: 10px 0;">${cartItem.rentalDays} days</td>
            <td style="padding: 10px 0;">₹${cartItem.price}/day</td>
            <td style="padding: 10px 0;">₹${itemTotal.toFixed(2)}</td>
          </tr>
        `;
      }
    });
  
    // Generate address HTML - handle the case where address might be a string or missing entirely
    let addressHtml = '';
    if (address) {
      if (typeof address === 'string') {
        // If address is a string, just display it directly
        addressHtml = `<p>${address}</p>`;
      } else {
        // If address is an object, format it properly
        addressHtml = `
          <p>${address.line1 || ''}</p>
          ${address.line2 ? `<p>${address.line2}</p>` : ''}
          <p>${address.city || ''}, ${address.state || ''} ${address.pincode || ''}</p>
          <p>${address.country || ''}</p>
        `;
      }
    } else {
      addressHtml = '<p>No address provided</p>';
    }
  
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">Your Order Confirmation</h2>
        <p>Hello ${user.name || user.email},</p>
        <p>Thank you for your order! Your payment has been processed successfully.</p>
        
        <div style="background: #f7fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">Order Summary</h3>
          <p><strong>Order ID:</strong> ${payment._id}</p>
          <p><strong>Payment ID:</strong> ${payment.razorpayPaymentId || 'Processing'}</p>
          <p><strong>Date:</strong> ${new Date(payment.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>
        
        <h3 style="color: #2d3748;">Items Rented</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0; text-align: left;">
              <th style="padding: 10px 0;">No.</th>
              <th style="padding: 10px 0;">Tool</th>
              <th style="padding: 10px 0;">Duration</th>
              <th style="padding: 10px 0;">Price</th>
              <th style="padding: 10px 0;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${toolItemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="padding: 10px 0; text-align: right;"><strong>Total:</strong></td>
              <td style="padding: 10px 0;"><strong>₹${totalAmount.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
        
        <div style="background: #f7fafc; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="margin-top: 0; color: #2d3748;">Delivery Address</h3>
          ${addressHtml}
        </div>
        
        <p>If you have any questions about your order, please contact our support team.</p>
        <p style="color: #718096; font-size: 14px;">This is an automated message, please do not reply.</p>
      </div>
    `;
  
    return sendEmail({
      to: user.email,
      subject: 'Your Order Confirmation',
      html
    });
  };

// Export the functions so they can be imported by other files
module.exports = {
  sendEmail,
  sendRenterOrderConfirmation,
  sendUserOrderConfirmation
};