import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

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

    const existedUser= User.findOne({
        $or:[{email},{userName}]
    })
    if(existedUser){
        throw new ApiError(409,'User already exists with this email or username')
    }

    const avatarLocalPath= req.files?.avatar[0]?.path;
    const coverImageLocalPath= req.files?.coverImage[0]?.path;

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
        userName:userName.tolowerCase(),
        password
    })

    const createdUser= await user.findById(user._id).select('-password -refreshToken'); //remove password and refreshToken from response
    
    if(!createdUser){
        throw new ApiError(500,'Unable to create user, please try again later')
    }
 
    return res.status(201).json(
        new ApiResponse(200,createdUser,'User created successfully')
    )

    
})

export {registerUser};