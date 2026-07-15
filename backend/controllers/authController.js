const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Coupon = require('../models/Coupon');
const { JWT_SECRET } = require('../middleware/auth');

// Seed default plans and coupons if the database is empty
async function seedDefaultData() {
  try {
    const plansCount = await Plan.countDocuments();
    if (plansCount === 0) {
      console.log('🌱 Seeding default plans...');
      await Plan.create({
        name: 'Basic Starter',
        price: 19,
        billingCycle: 'monthly',
        description: 'Perfect for small teams and growing personal projects.',
        features: ['1 User Account', '5 active projects', '1,000 API calls/mo', 'Email support'],
        trialDays: 7,
        active: true,
        usageLimit: { users: 1, projects: 5, apiCalls: 1000 }
      });
      await Plan.create({
        name: 'Pro Growth',
        price: 49,
        billingCycle: 'monthly',
        description: 'Ideal for professionals, scaling teams, and mid-sized businesses.',
        features: ['5 User Accounts', '25 active projects', '10,000 API calls/mo', 'Priority Support', 'Usage Analytics'],
        trialDays: 14,
        active: true,
        usageLimit: { users: 5, projects: 25, apiCalls: 10000 }
      });
      await Plan.create({
        name: 'Enterprise Scale',
        price: 149,
        billingCycle: 'monthly',
        description: 'Dedicated enterprise infrastructure with custom scalability integrations.',
        features: ['Unlimited Users', 'Unlimited projects', '1M API calls/mo', 'Dedicated Account Manager', 'SLA Gurantee', 'Advanced Churn Tracking'],
        trialDays: 30,
        active: true,
        usageLimit: { users: 999, projects: 999, apiCalls: 1000000 }
      });
      await Plan.create({
        name: 'Pro Annual',
        price: 480,
        billingCycle: 'yearly',
        description: 'Best price for pro teams on an annual cycle.',
        features: ['5 User Accounts', '25 active projects', '10,000 API calls/mo', 'Priority Support', 'Usage Analytics', 'Save 20% compared to monthly'],
        trialDays: 14,
        active: true,
        usageLimit: { users: 5, projects: 25, apiCalls: 10000 }
      });
    }

    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      console.log('🌱 Seeding default coupons...');
      await Coupon.create({
        code: 'SAVE20',
        discountType: 'percentage',
        discountValue: 20,
        active: true,
        maxRedemptions: 100,
        redemptionsCount: 0
      });
      await Coupon.create({
        code: 'HALFPRICE',
        discountType: 'percentage',
        discountValue: 50,
        active: true,
        maxRedemptions: 50,
        redemptionsCount: 0
      });
      await Coupon.create({
        code: 'FLAT15',
        discountType: 'fixed',
        discountValue: 15,
        active: true,
        maxRedemptions: 200,
        redemptionsCount: 0
      });
    }

    // Seed default admin user
    const adminExists = await User.findOne({ email: 'admin@paytrack.com' });
    if (!adminExists) {
      console.log('🌱 Seeding default admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'System Admin',
        email: 'admin@paytrack.com',
        password: hashedPassword,
        role: 'admin',
        company: 'PayTrack Inc',
        phone: '+1 (555) 019-2831'
      });
    }
  } catch (err) {
    console.error('Error seeding data:', err);
  }
}

// Invoke seed logic right away on load
setTimeout(seedDefaultData, 1000);

const register = async (req, res) => {
  try {
    const { name, email, password, company, phone, country } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'customer',
      company: company || '',
      phone: phone || '',
      country: country || 'US'
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Exclude password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      phone: user.phone,
      country: user.country,
      paymentMethod: user.paymentMethod,
      preferences: user.preferences
    };

    return res.status(201).json({ token, user: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      phone: user.phone,
      country: user.country,
      paymentMethod: user.paymentMethod,
      preferences: user.preferences
    };

    return res.json({ token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      phone: user.phone,
      country: user.country,
      paymentMethod: user.paymentMethod,
      preferences: user.preferences
    };

    return res.json(userResponse);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Error getting user profile', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, company, phone, country, emailNotifications, monthlyReports } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (company !== undefined) updateData.company = company;
    if (phone !== undefined) updateData.phone = phone;
    if (country !== undefined) updateData.country = country;
    
    updateData.preferences = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : req.user.preferences.emailNotifications,
      monthlyReports: monthlyReports !== undefined ? monthlyReports : req.user.preferences.monthlyReports
    };

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });

    const userResponse = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      company: updatedUser.company,
      phone: updatedUser.phone,
      country: updatedUser.country,
      paymentMethod: updatedUser.paymentMethod,
      preferences: updatedUser.preferences
    };

    return res.json({ message: 'Profile updated successfully', user: userResponse });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    // Exclude password from list
    const usersResponse = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      company: u.company,
      phone: u.phone,
      createdAt: u.createdAt
    }));
    return res.json(usersResponse);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers
};
