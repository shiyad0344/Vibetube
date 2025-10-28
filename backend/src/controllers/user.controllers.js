import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens= async(userId)=>{
    try {
        const user= await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false}); //to avoid password re-hashing use validateBeforeSave:false

        return {accessToken,refreshToken}
        
    } catch (error) {
        throw new ApiError(500,'Unable to generate tokens, please try again later')
    }
}

const registerUser= asyncHandler(async(req,res)=>{
   //get user details from req.body
   //validate user details
    //check if user already exists
    //check avatar image in req.files
    //upload image to cloudinary
    //create user in db
    //remove password and refreshToken from response
    //check for user creation success
    //return response
    const {userName, fullName, email, password }=req.body;
    if(
        [userName,fullName,email,password].some((field)=>{
           return field?.trim()===""
        })
    ){
        throw new ApiError(400,'All fields are required');
    }

    const existedUser=await  User.findOne({
        $or:[{email},{userName}]
    })
    if(existedUser){
        throw new ApiError(409,'User already exists with this email or username')
    }

    //const avatarLocalPath= req.files?.avatar[0]?.path;
    let avatarLocalPath;
    try {
        avatarLocalPath= req.files?.avatar[0]?.path;
    } catch (error) {
        avatarLocalPath=null;
    }
    //const coverImageLocalPath= req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    try {
        coverImageLocalPath= req.files?.coverImage[0]?.path;
    } catch (error) {
        coverImageLocalPath=null;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,'Avatar image is required')
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage= await uploadOnCloudinary(coverImageLocalPath);
    
    if(!avatar){
        throw new ApiError(500,'Unable to upload avatar image, please try again later')
    }

    const user= await User.create({
        fullName,
        email,
        avatar:avatar.url,
        coverImage:coverImage?.url || '',
        userName:userName.toLowerCase(),
        password
    })

    const createdUser= await User.findById(user._id).select('-password -refreshToken'); //remove password and refreshToken from response
    
    if(!createdUser){
        throw new ApiError(500,'Unable to create user, please try again later')
    }
 
     res.status(201).json(
        new ApiResponse(200,createdUser,'User created successfully')
    )

    
})


const loginUser= asyncHandler(async(req,res)=>{
    //get email and password from req.body
    //find user 
    //validate email and password
    //generate tokens
    //send through cookies
    
    const {email, userName,password}= req.body;

    if(!userName && !email){
        throw new ApiError(400, "username and email is required")
    }
    if(!password){
        throw new ApiError(400,'password is required')
    }

   const user= await User.findOne({
        $or: [{userName},{email}]
    })
    if(!user){
        throw new ApiError(404,'User not found with this email or username')
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,'Invalid password')
    }
   
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

    const loggedInUser= await User.findById(user._id).select('-password -refreshToken'); // again I have to search user because after token generation refreshToken is updated in db

   // set cookie options to httpOnly and secure, it can be accessed only by the server not by client side js
   const options={
    httpOnly:true,
    secure:true
   }

   return res.status(200).
       cookie("accessToken",accessToken,options).
       cookie("refreshToken",refreshToken,options).
       json(
        new ApiResponse(
            200,
            {
                user:loggedInUser, accessToken, refreshToken
            },
            'User logged in successfully'
         )  
            )

})

const logoutUser= asyncHandler(async(req,res)=>{
    //get user from req.user
    //remove refreshToken from db
    //clear cookies
    const userId= req.user._id;
    await User.findByIdAndUpdate(
        userId,
        {
          $set:{
            refreshToken:null
          } 
        },
        {new:true, validateBeforeSave:false}
    )

   const options={
        httpOnly:true,
        secure:true
       }
    return res.status(200).
           clearCookie("accessToken",options).
           clearCookie("refreshToken",options).
           json(
            new ApiResponse(200,null,'User logged out successfully')
           )
   
})

const refreshAccessToken= asyncHandler(async(req,res)=>{
    const incomingRefreshToken= req.cookie.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,'No refresh token provided')
    }
    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user= await User.findById(decodedToken._id);
    
        if(!user || user.refreshToken !== incomingRefreshToken){
            throw new ApiError(401,'Invalid refresh token')
        }
         const {accessToken,newRefreshToken}=generateAccessAndRefreshTokens(user._id);
        const options={
            httpOnly:true,
            secure:true
           }    
           return res.status(200).
           cookie("accessToken",accessToken,options).
           cookie("refreshToken",newRefreshToken,options).
           json(
            new ApiResponse(
                200,
                {accessToken,refreshToken: newRefreshToken},
                'Access token refreshed successfully'
            )
           )
    } catch (error) {
        new ApiError(401,'Invalid refresh token')
    }

})

const changeCurrentPassword= asyncHandler(async(req,res)=>{
    //get user from req.user
    //get oldPassword and newPassword from req.body
    //validate oldPassword
    //update with newPassword
    const {oldPassword,newPassword} =req.body;

    const user= await User.findById(req.user._id)
    const isPasswordMatch= await user.isPasswordCorrect(oldPassword)

    if(!isPasswordMatch){
        throw new ApiError(400,"old password incorrect")
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false});

    return res.status(200).json(
        new ApiResponse(200,null,'Password changed successfully')
    )

})

const getCurrentUser=asyncHandler(async(req,res)=>{
    //get user from req.user
    return res.status(200).json(
        new ApiResponse(200,req.user,'Current user fetched successfully')
    )
})

const updateAccountDetails= asyncHandler(async(req,res)=>{
    //get user from req.user
    //get update fields from req.body
    //update user in db
    //return response
    const {fullName,email}= req.body;
    if(!fullName?.trim() || !email?.trim()){
        throw new ApiError(400,'Full name and email are required')
    }
    const user= await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new:true}
    ).select('-password -refreshToken');

    return res.status(200).json(
        new ApiResponse(200,user,'User details updated successfully')
    )
})

const updateAvatar= asyncHandler(async(req,res)=>{
    //get user from req.user
    //get avatar image from req.files 
    //upload image to cloudinary
    //update user in db
    //return response   
   let localPath= req.file.path      
   if(!localPath){
    throw new ApiError(400,'Avatar image is required')
   }
    const avatar= await uploadOnCloudinary(localPath);
    if(!avatar){
        throw new ApiError(500,'Unable to upload avatar image, please try again later')
    }
    const user= User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select('-password -refreshToken');

    return res.status(200).json(
        new ApiResponse(200,user,'Avatar updated successfully')
    )

})

const updateCoverImage= asyncHandler(async(req,res)=>{
    //get user from req.user
    //get avatar image from req.files 
    //upload image to cloudinary
    //update user in db
    //return response   
   let localPath= req.file.path      
   if(!localPath){
    throw new ApiError(400,'CoverImage image is required')
   }
    const coverImage= await uploadOnCloudinary(localPath);
    if(!coverImage){
        throw new ApiError(500,'Unable to upload CoverImage , please try again later')
    }
    const user= User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
               coverImage:coverImage.url
            }
        },
        {new:true}
    ).select('-password -refreshToken');

    return res.status(200).json(
        new ApiResponse(200,user,'coverImage updated successfully')
    )

})

export {registerUser, 
        loginUser, 
        logoutUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountDetails,
        updateAvatar,
        updateCoverImage
};