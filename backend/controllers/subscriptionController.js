const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Coupon = require('../models/Coupon');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const User = require('../models/User');

const getActiveSubscription = async (req, res) => {
  try {
    // Find active subscription for the logged-in user
    const sub = await Subscription.findOne({ 
      userId: req.user._id, 
      status: { $or: [{ status: 'active' }, { status: 'trial' }, { status: 'past_due' }] } 
    });
    
    if (!sub) {
      return res.json(null);
    }

    const plan = await Plan.findById(sub.planId);
    return res.json({
      ...sub,
      planDetails: plan || {}
    });
  } catch (error) {
    console.error('Error getting active subscription:', error);
    return res.status(500).json({ message: 'Error fetching subscription', error: error.message });
  }
};

const getSubscriptionsList = async (req, res) => {
  try {
    let query = {};
    // Admins can see all, customers only see their own
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }
    
    const subs = await Subscription.find(query);
    const populatedSubs = await Promise.all(subs.map(async (sub) => {
      const plan = await Plan.findById(sub.planId);
      const user = await User.findById(sub.userId);
      return {
        ...sub,
        planDetails: plan || { name: 'Unknown Plan', price: 0 },
        userDetails: user ? { name: user.name, email: user.email } : { name: 'Unknown User', email: '' }
      };
    }));

    return res.json(populatedSubs);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching subscriptions', error: error.message });
  }
};

const getSubscriptionDetails = async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (req.user.role !== 'admin' && String(sub.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const plan = await Plan.findById(sub.planId);
    const payments = await Payment.find({ subscriptionId: sub._id });
    const invoices = await Invoice.find({ subscriptionId: sub._id });

    return res.json({
      subscription: sub,
      plan: plan || {},
      payments: payments || [],
      invoices: invoices || []
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving details', error: error.message });
  }
};

const createSubscription = async (req, res) => {
  try {
    const { planId, couponCode, paymentMethodDetails } = req.body;

    if (!planId) {
      return res.status(400).json({ message: 'Plan ID is required' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Selected plan not found' });
    }

    // Check if user already has an active subscription
    const existingSub = await Subscription.findOne({ 
      userId: req.user._id, 
      status: { $or: [{ status: 'active' }, { status: 'trial' }, { status: 'past_due' }] } 
    });
    if (existingSub) {
      return res.status(400).json({ message: 'You already have an active subscription. Use upgrade/downgrade instead.' });
    }

    let discount = 0;
    let couponId = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon) {
        if (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date()) {
          couponId = coupon._id;
          if (coupon.discountType === 'percentage') {
            discount = (plan.price * coupon.discountValue) / 100;
          } else {
            discount = Math.min(plan.price, coupon.discountValue);
          }
          // Increment redemption count
          await Coupon.findByIdAndUpdate(coupon._id, { redemptionsCount: (coupon.redemptionsCount || 0) + 1 });
        }
      }
    }

    // Mock Card Setup in Profile if provided
    if (paymentMethodDetails) {
      await User.findByIdAndUpdate(req.user._id, {
        paymentMethod: {
          brand: paymentMethodDetails.brand || 'Visa',
          last4: paymentMethodDetails.last4 || '4242',
          expiry: paymentMethodDetails.expiry || '12/28'
        }
      });
    }

    // Free Trial support
    const hasTrial = plan.trialDays > 0;
    const status = hasTrial ? 'trial' : 'active';
    const trialDays = plan.trialDays || 0;
    const now = new Date();
    
    const trialEndsAt = hasTrial ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : null;
    const currentPeriodStart = now;
    const currentPeriodEnd = plan.billingCycle === 'yearly' 
      ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
      : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    const sub = await Subscription.create({
      userId: req.user._id,
      planId: plan._id,
      status: status,
      startDate: now,
      trialEndsAt: trialEndsAt,
      currentPeriodStart,
      currentPeriodEnd,
      couponId,
      cancelAtPeriodEnd: false
    });

    const taxRate = 0.08; // 8% Tax
    const basePrice = hasTrial ? 0 : plan.price;
    const discountAmount = hasTrial ? 0 : discount;
    const afterDiscount = Math.max(0, basePrice - discountAmount);
    const tax = Number((afterDiscount * taxRate).toFixed(2));
    const total = Number((afterDiscount + tax).toFixed(2));

    // Create Invoice
    const invoiceNumber = `INV-${Date.now().toString().substring(6)}`;
    const invoice = await Invoice.create({
      userId: req.user._id,
      subscriptionId: sub._id,
      invoiceNumber,
      amount: basePrice,
      tax,
      discount: discountAmount,
      total,
      status: hasTrial ? 'open' : 'paid',
      dueDate: hasTrial ? trialEndsAt : new Date(),
      lineItems: [
        { description: `${plan.name} Subscription - Billing Cycle: ${plan.billingCycle}`, amount: basePrice }
      ]
    });

    // Create Payment Log
    if (!hasTrial) {
      await Payment.create({
        userId: req.user._id,
        subscriptionId: sub._id,
        invoiceId: invoice._id,
        amount: total,
        currency: 'USD',
        status: 'success',
        paymentMethod: paymentMethodDetails ? `${paymentMethodDetails.brand} ****${paymentMethodDetails.last4}` : 'Saved Payment Card',
        transactionId: `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`
      });
    }

    // Send Notification
    await Notification.create({
      userId: req.user._id,
      title: 'Subscription Activated',
      message: hasTrial 
        ? `Your ${plan.name} trial is active. You will be billed $${total} on ${trialEndsAt.toLocaleDateString()}.`
        : `Thank you for subscribing to ${plan.name}! Your invoice ${invoiceNumber} is fully paid.`,
      type: hasTrial ? 'trial' : 'billing'
    });

    return res.status(201).json({
      message: 'Subscription created successfully',
      subscription: sub,
      invoice
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ message: 'Error processing subscription', error: error.message });
  }
};

const upgradeDowngradeSubscription = async (req, res) => {
  try {
    const { newPlanId, couponCode } = req.body;
    
    if (!newPlanId) {
      return res.status(400).json({ message: 'New Plan ID is required' });
    }

    const newPlan = await Plan.findById(newPlanId);
    if (!newPlan) {
      return res.status(404).json({ message: 'Selected plan not found' });
    }

    const currentSub = await Subscription.findOne({ 
      userId: req.user._id, 
      status: { $or: [{ status: 'active' }, { status: 'trial' }, { status: 'past_due' }] } 
    });

    if (!currentSub) {
      return res.status(404).json({ message: 'No active subscription found to modify.' });
    }

    const currentPlan = await Plan.findById(currentSub.planId);
    
    if (String(currentSub.planId) === String(newPlanId)) {
      return res.status(400).json({ message: 'You are already subscribed to this plan.' });
    }

    // Proration Credit Calculation
    const now = new Date();
    const periodStart = new Date(currentSub.currentPeriodStart);
    const periodEnd = new Date(currentSub.currentPeriodEnd);
    
    const totalPeriodMs = periodEnd.getTime() - periodStart.getTime();
    const remainingMs = periodEnd.getTime() - now.getTime();
    const pctRemaining = Math.max(0, Math.min(1, remainingMs / totalPeriodMs));

    // Remaining value in dollars
    const unusedCredit = Number(( (currentPlan ? currentPlan.price : 0) * pctRemaining ).toFixed(2));

    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon && (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date())) {
        if (coupon.discountType === 'percentage') {
          discount = (newPlan.price * coupon.discountValue) / 100;
        } else {
          discount = Math.min(newPlan.price, coupon.discountValue);
        }
      }
    }

    // Calculate final due amount for upgrade (cannot be below zero)
    const afterDiscount = Math.max(0, newPlan.price - discount);
    const dueAmount = Math.max(0, afterDiscount - unusedCredit);
    const taxRate = 0.08;
    const tax = Number((dueAmount * taxRate).toFixed(2));
    const total = Number((dueAmount + tax).toFixed(2));

    // Update subscription period and plan
    const newPeriodStart = now;
    const newPeriodEnd = newPlan.billingCycle === 'yearly'
      ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
      : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    const isUpgrade = newPlan.price > (currentPlan ? currentPlan.price : 0);

    const updatedSub = await Subscription.findByIdAndUpdate(currentSub._id, {
      planId: newPlan._id,
      status: 'active', // Ensure active status if in trial previously
      currentPeriodStart: newPeriodStart,
      currentPeriodEnd: newPeriodEnd,
      trialEndsAt: null, // Wipe trial upon upgrade/downgrade
      prorationCredit: unusedCredit
    }, { new: true });

    // Generate Invoice
    const invoiceNumber = `INV-${Date.now().toString().substring(6)}`;
    const invoice = await Invoice.create({
      userId: req.user._id,
      subscriptionId: currentSub._id,
      invoiceNumber,
      amount: newPlan.price,
      tax,
      discount: discount + (dueAmount === 0 ? unusedCredit : 0), // Include unused credit as proration discount if fully covered
      total,
      status: 'paid',
      dueDate: new Date(),
      lineItems: [
        { description: `Change to ${newPlan.name} (Prorated adjustment)`, amount: newPlan.price },
        { description: `Prorated unused credit from ${currentPlan ? currentPlan.name : 'previous plan'}`, amount: -unusedCredit }
      ]
    });

    // Generate payment if amount > 0
    if (total > 0) {
      await Payment.create({
        userId: req.user._id,
        subscriptionId: currentSub._id,
        invoiceId: invoice._id,
        amount: total,
        currency: 'USD',
        status: 'success',
        paymentMethod: 'Saved Payment Card',
        transactionId: `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`
      });
    }

    // Notify User
    await Notification.create({
      userId: req.user._id,
      title: isUpgrade ? 'Subscription Upgraded' : 'Subscription Downgraded',
      message: `Successfully switched to ${newPlan.name}. Paid prorated amount of $${total}. Unused credit of $${unusedCredit} was applied.`,
      type: 'billing'
    });

    return res.json({
      message: 'Plan modified successfully',
      subscription: updatedSub,
      invoice
    });
  } catch (error) {
    console.error('Prorated modification error:', error);
    return res.status(500).json({ message: 'Error upgrading/downgrading subscription', error: error.message });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const { instant } = req.body; // Check if instant cancel is selected

    const sub = await Subscription.findOne({ 
      userId: req.user._id, 
      status: { $or: [{ status: 'active' }, { status: 'trial' }, { status: 'past_due' }] } 
    });

    if (!sub) {
      return res.status(404).json({ message: 'No active subscription to cancel' });
    }

    if (instant) {
      // Instant Cancellation
      const updatedSub = await Subscription.findByIdAndUpdate(sub._id, {
        status: 'canceled',
        endDate: new Date()
      }, { new: true });

      await Notification.create({
        userId: req.user._id,
        title: 'Subscription Cancelled',
        message: 'Your plan was cancelled instantly. We hope to see you back soon!',
        type: 'system'
      });

      return res.json({ message: 'Subscription cancelled instantly', subscription: updatedSub });
    } else {
      // Cancel at period end
      const updatedSub = await Subscription.findByIdAndUpdate(sub._id, {
        cancelAtPeriodEnd: true
      }, { new: true });

      await Notification.create({
        userId: req.user._id,
        title: 'Auto-renew disabled',
        message: `Your subscription auto-renew is disabled. You will have access until ${new Date(sub.currentPeriodEnd).toLocaleDateString()}.`,
        type: 'renewal'
      });

      return res.json({ message: 'Subscription set to cancel at billing period end', subscription: updatedSub });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error cancelling subscription', error: error.message });
  }
};

const resumeSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id, cancelAtPeriodEnd: true });
    if (!sub) {
      return res.status(400).json({ message: 'No subscription set to cancel found' });
    }

    const updatedSub = await Subscription.findByIdAndUpdate(sub._id, {
      cancelAtPeriodEnd: false
    }, { new: true });

    await Notification.create({
      userId: req.user._id,
      title: 'Subscription Resumed',
      message: 'Excellent choice! Your subscription auto-renew is active again.',
      type: 'renewal'
    });

    return res.json({ message: 'Subscription resumed successfully', subscription: updatedSub });
  } catch (error) {
    return res.status(500).json({ message: 'Error resuming subscription', error: error.message });
  }
};

module.exports = {
  getActiveSubscription,
  getSubscriptionsList,
  getSubscriptionDetails,
  createSubscription,
  upgradeDowngradeSubscription,
  cancelSubscription,
  resumeSubscription
};
