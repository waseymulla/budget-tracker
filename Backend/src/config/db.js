import mangoose from 'mongoose';

export async function connectDB(url) {
    //try to see if the connect fails first which willl log the error on the teminal too
    try {
        if(! url) {
            throw new Error("MongoDB connection URL is not provided");
        }
        await mangoose.connect(url);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error; // rethrow the error after logging it
    }

}