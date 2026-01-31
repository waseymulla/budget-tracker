import "dotenv/config";
import mongoose from "mongoose";
import Transaction from "./src/models/Transaction.js";

async function normalizeTransactions() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGO_URI not found in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const result = await Transaction.updateMany(
    {},
    [
      {
        $set: {
          category: { $toLower: "$category" },
          type: { $toLower: "$type" },
        },
      },
    ],
    { updatePipeline: true },
  );

  console.log(`Updated ${result.modifiedCount} transactions`);
  await mongoose.disconnect();
}

normalizeTransactions().catch((err) => {
  console.error(err);
  process.exit(1);
});
