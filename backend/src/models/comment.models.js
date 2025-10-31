import mongoose,{Schema} from "mongoose";
import mongooseAggregateandpaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema({
    content:{
        type:String,
        required:true,
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:'Video',
        required:true,
    }
},{timestamps:true})

commentSchema.plugin(mongooseAggregateandpaginate);

export const Comment=mongoose.model('Comment',commentSchema);