import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {Comment} from "../models/comment.models.js";
import {User} from "../models/user.models.js";

const getVideoComments= asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    if(!videoId){
        throw new ApiError(400,'Video ID is required');
    }
    const comments=await Comment.aggregate([
        {
            $match:{
                video:mongoose.Types.ObjectId(videoId),
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
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
                owner:{
                    $first:"$owner"
                }
            }
        }
    ])
    if(!comments || comments.length===0){
        throw new ApiError(404,'No comments found for this video');
    }
    return res.status(200).json(
        new ApiResponse(200,comments,'Comments fetched successfully')
    )
})

const addComment= asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    const {content}=req.body;
    if(!videoId || !content){
        throw new ApiError(400,'Video ID and content are required');
    }
    if(content.trim() === ''){
        throw new ApiError(400,'Comment content cannot be empty');
    }

    if(req.user?._id){
        throw new ApiError(400,'You are not authorized to add a comment');
    }

    const comment=await Comment.create({
        content,
        owner:req.user?._id,
        video:mongoose.Types.ObjectId(videoId),
    })
    if(!comment){
        throw new ApiError(500,'Something went wrong while adding the comment');
    }
    return res.status(200).json(
        new ApiResponse(200,comment,'Comment added successfully')
    )
})

const updateComment= asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    const {content:newContent}=req.body;

    if(!commentId || !newContent){
        throw new ApiError(400,'Comment ID and content are required');
    }
    if(content.trim() === ''){
        throw new ApiError(400,'Comment content cannot be empty');
    }

    const comment=await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content:newContent
            }
        },
        {new:true}
    )
    if(!comment){
        throw new ApiError(500,'Something went wrong while updating the comment');
    }
    return res.status(200).json(
        new ApiResponse(200,comment,'Comment updated successfully')
    )
})

const deleteComment= asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    if(!commentId){
        throw new ApiError(400,'Comment ID is required');
    }
    const comment=await Comment.findOne({_id:commentId,owner:req.user?._id});
    
    if(!comment){
        throw new ApiError(404,'you are not authorized to delete this comment');
    }

    const deletedComment=await Comment.findByIdAndDelete(commentId,{new:true});
    if(!deletedComment){
        throw new ApiError(500,'Something went wrong while deleting the comment');
    }
    return res.status(200).json(
        new ApiResponse(200,deletedComment,'Comment deleted successfully')
    )   
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}