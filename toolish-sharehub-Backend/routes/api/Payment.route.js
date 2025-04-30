const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/payment.controller');
const authenticateUser = require('../../middleware/authMiddleware'); // <-- notice change here

router.post('/create-order', authenticateUser, paymentController.createOrder);
router.post('/verify', authenticateUser, paymentController.verifyPayment);

module.exports = router;
