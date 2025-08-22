import mongoose from "mongoose";
import { config as configDotenv } from "dotenv";
configDotenv();

const db_URL = process.env.DB_URL

const ConnectDb = async () => {
    try {
        await mongoose.connect(db_URL)
        console.log("mongdb connected");
    } catch (err) {
        console.log("error", err);
        process.exit(1)

    }
}
/* hello */
export default ConnectDb