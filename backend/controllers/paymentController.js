const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const User = require('../models/User');

const getPaymentHistory = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const payments = await Payment.find(query);
    const populatedPayments = await Promise.all(payments.map(async (payment) => {
      const user = await User.findById(payment.userId);
      return {
        ...payment,
        userName: user ? user.name : 'Unknown',
        userEmail: user ? user.email : ''
      };
    }));

    // Sort by date descending
    populatedPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(populatedPayments);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

const updatePaymentMethod = async (req, res) => {
  try {
    const { brand, last4, expiry } = req.body;
    if (!brand || !last4 || !expiry) {
      return res.status(400).json({ message: 'Brand, last4 digits, and expiry date are required' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      paymentMethod: { brand, last4, expiry }
    }, { new: true });

    return res.json({
      message: 'Payment method updated successfully',
      paymentMethod: updatedUser.paymentMethod
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating payment method', error: error.message });
  }
};

// Smart Payment Retry & Dunning Management
// Users or admins can trigger a retry on a failed payment
const retryPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ message: 'Payment ID is required' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.status === 'success') {
      return res.status(400).json({ message: 'Payment was already processed successfully' });
    }

    const nextRetryCount = (payment.retryCount || 0) + 1;
    const maxRetries = 3;

    // Simulate smart payment retry logic
    const isSuccess = Math.random() > 0.3; // 70% success chance on manual retry

    if (isSuccess) {
      // Mark payment as success
      const updatedPayment = await Payment.findByIdAndUpdate(paymentId, {
        status: 'success',
        retryCount: nextRetryCount,
        failureReason: ''
      }, { new: true });

      // Mark Invoice as paid
      if (payment.invoiceId) {
        await Invoice.findByIdAndUpdate(payment.invoiceId, { status: 'paid' });
      }

      // Restore active subscription state if it was past due
      if (payment.subscriptionId) {
        await Subscription.findByIdAndUpdate(payment.subscriptionId, { status: 'active' });
      }

      await Notification.create({
        userId: payment.userId,
        title: 'Payment Recovered',
        message: `Excellent! Automated payment retry succeeded for $${payment.amount}. Your services are fully active.`,
        type: 'billing'
      });

      return res.json({
        message: 'Payment retry succeeded!',
        payment: updatedPayment
      });
    } else {
      const isExceeded = nextRetryCount >= maxRetries;
      const failureMsg = `Card declined. Attempt ${nextRetryCount} of ${maxRetries}`;

      const updatedPayment = await Payment.findByIdAndUpdate(paymentId, {
        status: 'failed',
        retryCount: nextRetryCount,
        failureReason: failureMsg
      }, { new: true });

      if (isExceeded) {
        // Suspend subscription (past_due)
        if (payment.subscriptionId) {
          await Subscription.findByIdAndUpdate(payment.subscriptionId, { status: 'past_due' });
        }

        await Notification.create({
          userId: payment.userId,
          title: 'Subscription Suspended (Dunning)',
          message: `All ${maxRetries} payment retry attempts failed. Your subscription is past due. Update your card to resume access.`,
          type: 'billing'
        });
      } else {
        await Notification.create({
          userId: payment.userId,
          title: 'Payment Retry Failed',
          message: `Payment attempt ${nextRetryCount} failed. We will try again soon or you can update your card manually.`,
          type: 'billing'
        });
      }

      return res.status(400).json({
        message: isExceeded ? 'Dunning cycle exceeded. Subscription suspended.' : 'Payment failed. Retry recorded.',
        payment: updatedPayment
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error processing payment retry', error: error.message });
  }
};

module.exports = {
  getPaymentHistory,
  updatePaymentMethod,
  retryPayment
};
