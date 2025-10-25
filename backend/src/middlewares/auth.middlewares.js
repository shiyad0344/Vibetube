import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import {User} from "../models/user.models.js";

export const verifyJWT =asyncHandler(async(req,_,next)=>{
    //get token from cookies and headers
    //if no token send 401  
   try {
    const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    if(!token){
     throw new ApiError(401,'Unauthorized access, no token provided')
    }
     //verify token
     const decoded= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
     const user= await User.findById(decoded._id).select('-password -refreshToken');
     if(!user){
         throw new ApiError(401,'Unauthorized access, user not found')
     }
    req.user=user;   // add user to req object
    next();
} 
    catch (error) {
    throw new ApiError(401,'Unauthorized access, invalid token')
   }


})