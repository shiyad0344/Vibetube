import dotenv from 'dotenv'
dotenv.config({path: '../.env'});
import connectDB from "./db/index.js";




connectDB()




























// const connectDB= async ()=>{
//       try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         console.log('MongoDB connection Established')
//       } catch (error) {
//         console.error('connectDB error',error)
//         throw error
//       }
// }

//connectDB()