const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', planController.getAllPlans);
router.get('/admin', authMiddleware, adminMiddleware, planController.getAdminPlans);
router.get('/:id', planController.getPlanById);
router.post('/', authMiddleware, adminMiddleware, planController.createPlan);
router.put('/:id', authMiddleware, adminMiddleware, planController.updatePlan);
router.delete('/:id', authMiddleware, adminMiddleware, planController.deletePlan);

module.exports = router;
