import mongoose, {Aggregate, Schema} from "mongoose";
import mongooseAggregateandpaginate from "mongoose-aggregate-paginate-v2";


const videoSchema =new Schema(
    {
      tile:{
        type:String,
        required:true,
        trim:true
      },
      description:{
        type:String,
        required:true,
        trim:true
      },
      duration:{
        type:Number
      },
      views:{
        type:Number,
        default:0
      },
      thumbnail:{
        type:String,
        required:true
        },
      owner:{
            type:Schema.types.ObjectId,
            ref:'User',
            required:true
        },
        videoFile:{
            type:String,
            required:true
        },
        isPublished:{
            type:Boolean,
            default:true
        }
    },{timestamps:true})

   videoSchema.plugin(mongooseAggregateandpaginate);
   


    export const Video=mongoose.model('Video',videoSchema);