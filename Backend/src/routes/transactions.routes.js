//get the controller implemntations 
// create the routers, and export the router

import express from 'express';
import { createTransaction, getTransactions } from '../controllers/transactions.controller.js';

const router = express.Router();

// Route for creating a new transaction
router.post('/', createTransaction);

// Route for getting all transactions
router.get('/', getTransactions);

export default router;