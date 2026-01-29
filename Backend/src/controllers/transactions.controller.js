// i need to creat 2 functionns here one for creating a transaction and another for getting all transactions from the database.
//createTranasaction(res,req)
//getAllTransactions(req,res)

import Transaction from "../models/Transaction.js";

export const createTransaction = async (req, res) => {
  try {
    // xtract data from request
    const { type, amount, category, date, description } = req.body;

    //Basic request-level validation (presence only)
    if (!type || !amount || !category || !date) {
      return res.status(400).json({
        message: "type, amount, category, and date are required",
      });
    }

    // Create and save in one step
    const transaction = await Transaction.create({
      type,
      amount,
      category,
      date,
      description,
    });

    //Respond with created resource
    return res.status(201).json(transaction);

  } catch (error) {
    console.error("Error creating transaction:", error);

    //Handle validation errors cleanly
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    //Fallback: unexpected server error
    return res.status(500).json({
      message: "Failed to create transaction",
    });
  }
};

export const getTransactions = async (req, res) => {
    try {
        //Sort by date descending
        const transactions = await Transaction.find().sort({ date: -1 }); 
        return res.status(200).json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return res.status(500).json({
            message: "Failed to fetch transactions",
        });
    }
};
