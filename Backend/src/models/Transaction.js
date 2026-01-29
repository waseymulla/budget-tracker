// creating a schema for defining the structure of transaction documents in MongoDB for transactions.
// i will include type: enum income/expense, amount: number and minimum 0.01, category: trim white space (ex: Food, Rent, Salary)and required and string, date: required and date type, description: trim and default empty string, timestamp: createdAt and updatedAt automatically managed by mongoose 

import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0.01
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true // automatically manage createdAt and updatedAt fields
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;