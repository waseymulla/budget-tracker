//get the controller implemntations 
// create the routers, and export the router

import express from 'express';
import { createTransaction, getTransactions, updateTransaction, deleteTransaction } from '../controllers/transactions.controller.js';
import { authenticate } from '../Middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

// Route for creating a new transaction
router.post('/', createTransaction);

// Route for getting all transactions
router.get('/', getTransactions);

router.put('/:id', updateTransaction);

router.delete('/:id', deleteTransaction);

export default router;