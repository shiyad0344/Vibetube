import mongoose from "mongoose";
//import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";

//dotenv.config({path: './.env'});

const connectDB=async()=>{
try {
    const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`"MongoDB connection established": ${connectionInstance.connection.host}`);
   
} catch (error) {
    console.error("ConnectDB failed", error)
    process.exit(1)
}

}

export default connectDB;