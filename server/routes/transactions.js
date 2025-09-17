const express = require('express');
const transactionService = require('../services/transactionService');
const router = express.Router();

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await transactionService.getAllTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transactions by customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const transactions = await transactionService.getTransactionsByCustomer(req.params.customerId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
router.post('/', async (req, res) => {
  try {
    const transaction = await transactionService.createTransaction(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Make payment
router.post('/:id/payment', async (req, res) => {
  try {
    const { amount } = req.body;
    const transaction = await transactionService.makePayment(req.params.id, amount);
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;