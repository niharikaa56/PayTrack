const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, invoiceController.getInvoices);
router.get('/:id', authMiddleware, invoiceController.getInvoiceById);
router.post('/:id/email', authMiddleware, invoiceController.emailInvoice);
router.post('/webhook', invoiceController.handleWebhook); // Publicly accessible webhook endpoint

module.exports = router;
