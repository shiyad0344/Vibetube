import dotenv from 'dotenv'
dotenv.config({path: '../.env'});
import connectDB from "./db/index.js";
import app from './app.js'




connectDB()
.then(()=>{
    app.listen(process.env.PORT || 5000,()=>{
        console.log(`Mongodb connectedon port :${process.env.PORT}`);
        
    })
})
.catch((error)=>{
  console.error('MongoDB connection error',error)
  throw error
})




























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