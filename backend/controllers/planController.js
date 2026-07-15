const Plan = require('../models/Plan');

const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ active: true });
    return res.json(plans);
  } catch (error) {
    console.error('Error in getAllPlans:', error);
    return res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
};

const getAdminPlans = async (req, res) => {
  try {
    const plans = await Plan.find({});
    return res.json(plans);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching admin plans', error: error.message });
  }
};

const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    return res.json(plan);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching plan', error: error.message });
  }
};

const createPlan = async (req, res) => {
  try {
    const { name, price, billingCycle, description, features, trialDays, active, usageLimit } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Plan name and price are required' });
    }

    const newPlan = await Plan.create({
      name,
      price: Number(price),
      billingCycle: billingCycle || 'monthly',
      description: description || '',
      features: features || [],
      trialDays: Number(trialDays) || 0,
      active: active !== undefined ? active : true,
      usageLimit: usageLimit || { users: 1, projects: 5, apiCalls: 1000 }
    });

    return res.status(201).json({ message: 'Plan created successfully', plan: newPlan });
  } catch (error) {
    console.error('Error creating plan:', error);
    return res.status(500).json({ message: 'Error creating plan', error: error.message });
  }
};

const updatePlan = async (req, res) => {
  try {
    const { name, price, billingCycle, description, features, trialDays, active, usageLimit } = req.body;

    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (price !== undefined) updateData.price = Number(price);
    if (billingCycle) updateData.billingCycle = billingCycle;
    if (description !== undefined) updateData.description = description;
    if (features) updateData.features = features;
    if (trialDays !== undefined) updateData.trialDays = Number(trialDays);
    if (active !== undefined) updateData.active = active;
    if (usageLimit) updateData.usageLimit = usageLimit;

    const updatedPlan = await Plan.findByIdAndUpdate(req.params.id, updateData, { new: true });
    return res.json({ message: 'Plan updated successfully', plan: updatedPlan });
  } catch (error) {
    console.error('Error updating plan:', error);
    return res.status(500).json({ message: 'Error updating plan', error: error.message });
  }
};

const deletePlan = async (req, res) => {
  try {
    // We typically perform soft delete or set to inactive so current users aren't disrupted
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    await Plan.findByIdAndUpdate(req.params.id, { active: false });
    return res.json({ message: 'Plan marked as inactive successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting plan', error: error.message });
  }
};

module.exports = {
  getAllPlans,
  getAdminPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
};
