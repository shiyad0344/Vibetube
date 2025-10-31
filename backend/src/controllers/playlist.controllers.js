import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {Playlist} from "../models/playlist.models.js";

const createPlaylist= asyncHandler(async(req,res)=>{
    const {name,description}=req.body;
    const userId=req.user?._id;
    if(!userId){
        throw new ApiError(400,'User ID is required');
    }
    if(!name || !description){
        throw new ApiError(400,'Name and description are required');
    }

    const playlist =await Playlist.create({
        name,
        description,
        owner:req.user?._id,
    })
    if(!playlist){
        throw new ApiError(500,'Something went wrong while creating the playlist');
    }
    return res.status(201).json(
        new ApiResponse(201,playlist,'Playlist created successfully')
    )
})

const getUserPlaylists= asyncHandler(async(req,res)=>{
    const {userId}=req.params;
    if(!userId){
        throw new ApiError(400,'User ID is required');
    }
    const playlists=await Playlist.aggregate([
        {
            $match:{
                owner:mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
            }
        },
        {
            $addFields:{
                totalvideos:{
                    $size:"$videos"
                },
                thumbnail:{
                    $first:"$videos.thumbnail"
                }
            }
        },
        {
            $project:{
                name:1,
                description:1,
                totalvideos:1,
                thumbnail:1,
                
            }
        }
    ])
    if(!playlists || playlists.length===0){
        throw new ApiError(404,'No playlists found for this user');
    }
    return res.status(200).json(
        new ApiResponse(200,playlists,'Playlists fetched successfully')
    )
})

const getPlaylistById= asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    if(!playlistId){
        throw new ApiError(400,'Playlist ID is required');
    }
    const playlist=await Playlist.aggregate([
        {
            $match:{
                _id:mongoose.Types.ObjectId(playlistId),
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videoDetails",
            }
        },
        {
            $project:{
                name:1,
                description:1,
                "videoDetails.title":1,
                "videoDetails.thumbnail":1,
                "videoDetails.duration":1,

            }
        }
        
    ])
    if(!playlist || playlist.length===0){
        throw new ApiError(404,'No playlist found with this ID');
    }
    return res.status(200).json(
        new ApiResponse(200,playlist[0],'Playlist fetched successfully')
    )
})

const addVideoToPlaylist= asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.params;
    if(!playlistId || !videoId){
        throw new ApiError(400,'Playlist ID and video ID are required');
    }
    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push:{videos:videoId}
        },
        {new:true}
    )
    if(!playlist){
        throw new ApiError(500,'Something went wrong while adding the video to the playlist');
    }
    return res.status(200).json(
        new ApiResponse(200,playlist,'Video added to the playlist successfully')
    )
})

const removeVideoFromPlaylist= asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.params;
    if(!playlistId || !videoId){
        throw new ApiError(400,'Playlist ID and video ID are required');
    }
    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{videos:videoId}
        },
        {new:true}
    )
    if(!playlist){
        throw new ApiError(500,'Something went wrong while removing the video from the playlist');
    }
    return res.status(200).json(
        new ApiResponse(200,playlist,'Video removed from the playlist successfully')
    )
})

const deletePlaylist= asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    if(!playlistId){
        throw new ApiError(400,'Playlist ID is required');
    }
    const playlist=await Playlist.findByIdAndDelete(playlistId);
    if(!playlist){
        throw new ApiError(500,'Something went wrong while deleting the playlist');
    }
    return res.status(200).json( new ApiResponse(200,null,'Playlist deleted successfully')
    )
})

const updatePlaylist= asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    const {name,description}=req.body;
    if(!name || !description){
        throw new ApiError(400,'Name and description are required');
    }
    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{name,description}
        },
        {new:true}
    )
    if(!playlist){
        throw new ApiError(500,'Something went wrong while updating the playlist');
    }
    return res.status(200).json(
        new ApiResponse(200,playlist,'Playlist updated successfully')
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}