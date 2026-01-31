// i need to creat 2 functionns here one for creating a transaction and another for getting all transactions from the database.
//createTranasaction(res,req)
//getAllTransactions(req,res)

import Transaction from "../models/Transaction.js";

export const createTransaction = async (req, res) => {
  try {
    // extract data from request
    const { type, amount, category, date, description } = req.body;

    //user data from auth middleware
    const userId = req.user.id; 

    //Basic request-level validation (presence only)
    if (!type || amount === undefined || !category || !date) {
      return res.status(400).json({
        message: "type, amount, category, and date are required",
      });
    }

    // Create and save in one step
    const transaction = await Transaction.create({
      userId,
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

//gets all transactions/ filtered transactions
export const getTransactions = async (req, res) => {
  try {
    //implementing filtering features by req,query, build a filter object dynamically
    // 1. extract query parameters: type, category, and month
    ///2. build filter object
    // if type is present in query, add to filter
    // if category is present in query, add to filter
    // if month is present in query, calculate start and end dates for that month and add to filter
    // query the database with the filter object
    const userId = req.user.id;
    const filter = {};
    const { type, category, month } = req.query;

    if (type) {
      filter.type = String(type).trim().toLowerCase();
    }
    if (category) {
      filter.category = String(category).trim().toLowerCase();
    }
    if (month) {
      // Expect month in "YYYY-MM" format
      // Example: "2026-01"
      const match = /^(\d{4})-(\d{2})$/.exec(month);

      if (!match) {
        return res.status(400).json({
          message: "month must be in YYYY-MM format (example: 2026-01)",
        });
      }

      const year = Number(match[1]);
      const monthNum = Number(match[2]); // 1..12

      if (monthNum < 1 || monthNum > 12) {
        return res.status(400).json({
          message: "month must be a valid month number 01 through 12",
        });
      }

      // JS Date months are 0-indexed (0=Jan)
      const startDate = new Date(year, monthNum - 1, 1);
      const nextMonthStart = new Date(year, monthNum, 1);

      // date >= startDate AND date < nextMonthStart
      filter.date = { $gte: startDate, $lt: nextMonthStart };
    }

    //Sort by date descending
    const transactions = await Transaction.find({ userId, ...filter }).sort({ date: -1 });
    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      message: "Failed to fetch transactions",
    });
  }
};

//update transaction
export const updateTransaction = async (req, res) => {
  try {
    //user id from auth middleware
    const userId = req.user.id;

    //get the id from req.params beacause it is coming from the url
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid transaction id" });
    }
    //build update with only the feilds user actually wants to update
    const update = {};
    const allowedFields = ["type", "amount", "category", "date", "description"];
    
    

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }

    //reject any empty update
    if (Object.keys(update).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    //find the transaction by id and update
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },        // filter: must match BOTH id and owner
      { $set: update },           // update
      { new: true, runValidators: true } // options
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    return res.status(200).json(transaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return res.status(500).json({ message: "Failed to update transaction" });
  }
};

//delete transaction
export async function deleteTransaction(req, res) {
  try {
    const id = req.params.id;
    const userId = req.user.id;


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid transaction id" });
    }
    const deletedTransaction = await Transaction.findOneAndDelete({ _id: id, userId });
    if (!deletedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    
    return res
      .status(200)
      .json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return res.status(500).json({ message: "Failed to delete transaction" });
  }
}
