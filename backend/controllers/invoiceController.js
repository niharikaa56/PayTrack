const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Notification = require('../models/Notification');

const getInvoices = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const invoices = await Invoice.find(query);
    const populatedInvoices = await Promise.all(invoices.map(async (invoice) => {
      const user = await User.findById(invoice.userId);
      return {
        ...invoice,
        userName: user ? user.name : 'Unknown',
        userEmail: user ? user.email : ''
      };
    }));

    // Sort by creation date descending
    populatedInvoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(populatedInvoices);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving invoices', error: error.message });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (req.user.role !== 'admin' && String(invoice.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(invoice.userId);
    return res.json({
      ...invoice,
      userName: user ? user.name : 'Unknown',
      userEmail: user ? user.email : '',
      userCompany: user ? user.company : '',
      userCountry: user ? user.country : 'US'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching invoice', error: error.message });
  }
};

const emailInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (req.user.role !== 'admin' && String(invoice.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark email as sent
    await Invoice.findByIdAndUpdate(invoice._id, { emailSent: true });

    const user = await User.findById(invoice.userId);

    await Notification.create({
      userId: invoice.userId,
      title: 'Invoice Emailed',
      message: `PDF receipt for invoice ${invoice.invoiceNumber} ($${invoice.total}) was successfully emailed to ${user ? user.email : 'your address'}.`,
      type: 'billing'
    });

    return res.json({ message: 'Invoice successfully emailed', emailSent: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error emailing invoice', error: error.message });
  }
};

// Webhook handling simulation
const handleWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;
    console.log(`📡 Webhook Received: Event [${event}]`);

    if (!event || !data) {
      return res.status(400).json({ message: 'Invalid webhook payload structure' });
    }

    // Process simulated events
    switch (event) {
      case 'payment_intent.succeeded': {
        const { email, amount, subscriptionId } = data;
        const user = await User.findOne({ email });
        if (user) {
          // Log payment
          await Payment.create({
            userId: user._id,
            subscriptionId: subscriptionId || 'webhook-sync',
            amount: Number(amount),
            status: 'success',
            paymentMethod: 'Stripe Webhook',
            transactionId: `TXN-W-${Date.now()}`
          });
          console.log(`✅ Webhook processed successfully for ${email}`);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const { email, subscriptionId, reason } = data;
        const user = await User.findOne({ email });
        if (user && subscriptionId) {
          await Subscription.findByIdAndUpdate(subscriptionId, { status: 'past_due' });
          await Notification.create({
            userId: user._id,
            title: 'Action Required: Webhook Payment Failure',
            message: `Recurring automated charge failed due to: ${reason || 'Card declined'}.`,
            type: 'billing'
          });
          console.log(`⚠️ Handled payment failure webhook for ${email}`);
        }
        break;
      }
      default:
        console.log(`ℹ️ Webhook event [${event}] unhandled but acknowledged.`);
    }

    return res.json({ status: 'received', message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ message: 'Error handling webhook event', error: error.message });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  emailInvoice,
  handleWebhook
};
