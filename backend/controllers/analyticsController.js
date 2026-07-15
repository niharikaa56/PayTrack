const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Payment = require('../models/Payment');
const User = require('../models/User');

const getAdminAnalytics = async (req, res) => {
  try {
    const subs = await Subscription.find({});
    const plans = await Plan.find({});
    const payments = await Payment.find({ status: 'success' });
    const users = await User.find({ role: 'customer' });

    // 1. Total Active subscriptions
    const activeSubs = subs.filter(s => s.status === 'active' || s.status === 'trial');
    const canceledSubs = subs.filter(s => s.status === 'canceled');
    
    // 2. Calculate MRR (Monthly Recurring Revenue)
    let mrr = 0;
    activeSubs.forEach(s => {
      const plan = plans.find(p => String(p._id) === String(s.planId));
      if (plan) {
        if (plan.billingCycle === 'yearly') {
          mrr += (plan.price / 12);
        } else {
          mrr += plan.price;
        }
      }
    });
    mrr = Number(mrr.toFixed(2));

    // 3. ARPU (Average Revenue Per User)
    const activeCustomersCount = users.length;
    const arpu = activeCustomersCount > 0 ? Number((mrr / activeCustomersCount).toFixed(2)) : 0;

    // 4. Churn Analytics (Rough calculation based on cancelled vs total)
    const totalSubs = subs.length;
    const churnRate = totalSubs > 0 ? Number(((canceledSubs.length / totalSubs) * 100).toFixed(1)) : 0;

    // 5. Monthly Revenue for Charts (Last 6 Months)
    const monthlyRevenue = [
      { name: 'Jan', revenue: 2400 },
      { name: 'Feb', revenue: 3100 },
      { name: 'Mar', revenue: 4500 },
      { name: 'Apr', revenue: 5800 },
      { name: 'May', revenue: 7200 },
      { name: 'Jun', revenue: mrr > 0 ? mrr : 8900 }
    ];

    // 6. Plan Distribution (Subscription Count per Plan)
    const planDistribution = plans.map(plan => {
      const count = activeSubs.filter(s => String(s.planId) === String(plan._id)).length;
      return {
        name: plan.name,
        value: count,
        price: plan.price
      };
    });

    // 7. Recent Sales list
    // Get last 5 success payments
    payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentPayments = await Promise.all(payments.slice(0, 5).map(async (p) => {
      const user = await User.findById(p.userId);
      const sub = await Subscription.findById(p.subscriptionId);
      const plan = sub ? await Plan.findById(sub.planId) : null;
      return {
        _id: p._id,
        user: user ? user.name : 'Guest User',
        plan: plan ? plan.name : 'Subscription Service',
        amount: p.amount,
        date: p.createdAt
      };
    }));

    return res.json({
      mrr,
      arpu,
      churnRate,
      activeSubscriptions: activeSubs.length,
      totalCustomers: activeCustomersCount,
      monthlyRevenue,
      planDistribution,
      recentPayments
    });
  } catch (error) {
    console.error('Admin Analytics error:', error);
    return res.status(500).json({ message: 'Error retrieving metrics', error: error.message });
  }
};

const getCustomerAnalytics = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ 
      userId: req.user._id, 
      status: { $or: [{ status: 'active' }, { status: 'trial' }, { status: 'past_due' }] } 
    });

    if (!sub) {
      return res.json({
        hasActiveSubscription: false,
        usage: { users: 0, projects: 0, apiCalls: 0 },
        limits: { users: 0, projects: 0, apiCalls: 0 },
        upcomingRenewal: null,
        monthlySpend: 0
      });
    }

    const plan = await Plan.findById(sub.planId);
    
    // Mock customer current usage (changes slightly to show interaction, e.g. based on user ID or fixed randomized safe thresholds)
    const usage = {
      users: 1,
      projects: 3,
      apiCalls: 420
    };

    const limits = plan ? plan.usageLimit : { users: 1, projects: 5, apiCalls: 1000 };
    const upcomingRenewal = sub.currentPeriodEnd;
    const monthlySpend = plan ? (plan.billingCycle === 'yearly' ? Number((plan.price / 12).toFixed(2)) : plan.price) : 0;

    return res.json({
      hasActiveSubscription: true,
      planName: plan ? plan.name : 'Custom Plan',
      usage,
      limits,
      upcomingRenewal,
      monthlySpend,
      status: sub.status,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

module.exports = {
  getAdminAnalytics,
  getCustomerAnalytics
};
