import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import {Subscription} from '../models/subscription.models.js';
import {User} from '../models/user.models.js';

const toggleSubscription= asyncHandler(async(req,res)=>{
    const {channelId}=req.params;
    const userId=req.user?._id;
    if(!(userId && channelId)){
        throw new ApiError(400,'User ID and Channel ID are required');
    }

    const subscription = await Subscription.findOne({subscriber:userId,channel:channelId});

    if(!subscription){
        await Subscription.create({subscriber:userId,channel:channelId});
    }
    else{
        await Subscription.findByIdAndDelete(subscription._id);
    }
    
    return res.status(200).json(
        new ApiResponse(200,null,'Subscription toggled successfully')
    )
})

const getUserChannelSubcriber= asyncHandler(async(req,res)=>{
    const {channelId}=req.params;
    if(!channelId){
        throw new ApiError(400,'Channel ID is required');
    }

    const userId=req.user?._id;
    if(!userId){
        throw new ApiError(400,'User ID is required');
    }
    const newChannelId=mongoose.Types.ObjectId(channelId);
    if(!newChannelId.equals(userId)){                       //mongo ids are not equal to javascript ids so we use equals to compare them
        throw new ApiError(400,'this channel is not yours');
    }

    const subscribers=await Subscription.aggregate([
        {
            $match:{
                channel:newChannelId
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriber",
                pipeline:[
                    {
                        $project:{
                            userName:1,
                            fullName:1,
                            avatar:1,
                            _id:1
                        }
                    }
                ]
            }
        },
            {
                $addFields:{
                    subscriber:{
                        $first:"$subscriber"
                    }
                }
            }
    ])
    if(!subscribers || subscribers.length===0){
        throw new ApiError(404,'No subscribers found for this channel');
    }
    return res.status(200).json(
        new ApiResponse(200,subscribers,'Subscribers fetched successfully')
    )
})

const getSubscribedChannels= asyncHandler(async(req,res)=>{
    const {subscriberId}=req.params;
    if(!subscriberId){
        throw new ApiError(400,'Subscriber ID is required');
    }
    const channel=await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channel",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullname:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                channel:{
                    $first:"$channel"
                }
            }
        }
    ])

    if(!channel){
        throw new ApiError(400,"Error encountered while fetching channel list")
    }

    return res.status(201).json(new ApiResponse(200,channel,"Channel list fetched successfully"))


})



export{
    toggleSubscription,
    getUserChannelSubcriber,
    getSubscribedChannels
}