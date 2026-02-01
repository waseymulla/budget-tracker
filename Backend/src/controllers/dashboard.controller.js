//need to create a dashboard controller to get summary data for the dashboard
// total income, total expense, balance, recent transactions
// i will be impmenting endpoints for pie chart that shows expense distribution by category anf filtered by monthly and yearly basis
// also bar chart for income and expense over time for each month in a year and filter by year

//for new users with no transactions handle that case too, so no query parameters needed
// if no transactions, return zeros for income, expense, balance, and empty array for recent transactions
// error only for input is invalid date formats

import Transaction from "../models/Transaction.js";
import buildDateRangeFilter from "./dashboardFilter.controllerHelper.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const dateInfo = buildDateRangeFilter(req.query);

    if (dateInfo?.error) {
      return res
        .status(dateInfo.error.status || 400)
        .json({ message: dateInfo.error.message || "Invalid date filter" });
    }

    const match = { userId };

    //adds a date range filter (year or month)
    if (dateInfo?.dateFilter?.date) {
      match.date = dateInfo.dateFilter.date;
    }

    // Aggregate into a row with conditional sums
    const result = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
          transactionCount: { $sum: 1 },
        },
      },
      {
        // Clean output shape (no _id)
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpenses: 1,
          transactionCount: 1,
        },
      },
    ]);

    // If no transactions matched, aggregate returns []
    const summary = result[0] || {
      totalIncome: 0,
      totalExpenses: 0,
      transactionCount: 0,
    };

    const balance = summary.totalIncome - summary.totalExpenses;

    return res.status(200).json({
      ...summary,
      balance,
      // include range info only when a filter was applied
      ...(dateInfo?.range ? { range: dateInfo.range } : {}),
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch dashboard summary" });
  }

};

// pie chart data controller

export const getPieChartData = async (req, res) => {
  try {
    const userId = req.user.id;
    const dateInfo = buildDateRangeFilter(req.query);

    if (dateInfo?.error) {
      return res
        .status(dateInfo.error.status || 400)
        .json({ message: dateInfo.error.message || "Invalid date filter" });
    }

    const match = { userId, type: "expense" };

    // Add date range filter (year or month)
    if (dateInfo?.dateFilter?.date) {
      match.date = dateInfo.dateFilter.date;
    }

    // Aggregate expenses by category (largest first)
    const grouped = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { totalAmount: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalAmount: 1,
        },
      },
    ]);

    const totalExpenses = grouped.reduce((sum, item) => sum + item.totalAmount, 0);

    // Avoid divide-by-zero; if no expenses, return empty breakdown
    const breakdown =
      totalExpenses === 0
        ? []
        : grouped.map((item) => ({
            ...item,
            percent: Number(((item.totalAmount / totalExpenses) * 100).toFixed(2)),
          }));

    return res.status(200).json({
      totalExpenses,
      breakdown,
      ...(dateInfo?.range ? { range: dateInfo.range } : {}),
    });
  } catch (error) {
    console.error("Error fetching pie chart data:", error);
    return res.status(500).json({ message: "Failed to fetch pie chart data" });
  }
};


// bar chart data controller
// yearly income and expense totals for each month in a given year
//userId from auth middleware
//always returns 12 months with zeroes if no data for that month

export const getBarChartData = async (req, res) => {
  try {
    const userId = req.user.id;
    const yearParam = req.query.year;

    // Default to current year if not provided
    let year;
    if (yearParam !== undefined) {
      year = Number(String(yearParam).trim());
      if (!Number.isInteger(year) || year < 1900 || year > 3000) {
        return res
          .status(400)
          .json({ message: "year must be a 4-digit number (example: 2026)" });
      }
    } else {
      year = new Date().getFullYear();
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    // Aggregate income + expenses per month 
    const grouped = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$date" } },
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      { $sort: { "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          income: 1,
          expense: 1,
        },
      },
    ]);

    // Always return 12 months
    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    for (const item of grouped) {
      const idx = item.month - 1;
      if (idx >= 0 && idx < 12) {
        monthly[idx].income = item.income;
        monthly[idx].expense = item.expense;
      }
    }

    const yearTotalIncome = monthly.reduce((sum, m) => sum + m.income, 0);
    const yearTotalExpenses = monthly.reduce((sum, m) => sum + m.expense, 0);
    const yearBalance = yearTotalIncome - yearTotalExpenses;

    return res.status(200).json({
      year,
      yearTotalIncome,
      yearTotalExpenses,
      yearBalance,
      monthly, // each month has income + expense bars
    });
  } catch (error) {
    console.error("Error fetching bar chart data:", error);
    return res.status(500).json({ message: "Failed to fetch bar chart data" });
  }
};
