
import mongoose,{Schema} from "mongoose";

const subscriptionSchema = new Schema(
    {
     subscriber:{
        type:mongoose.Schema.types.ObjectId,
        ref: "User",
     },
     channel:{
        type:mongoose.Schema.types.ObjectId,
        ref: "User",
     }
      
},{timestamps:true}
)


export const Subscription= mongoose.model("subscription",subscriptionSchema)

