import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLODINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary= async (localFilePath)=>{
        try {
            if(!localFilePath) return null;
            const response= await cloudinary.uploader.upload(localFilePath,
                {
                    resource_type:'auto',
                }
            )
            //console.log('Successfully upload on Clodinary',response.url);
            fs.unlinkSync(localFilePath)
            return response;
                
        } catch (error) {
            fs.unlinkSync(localFilePath)
            console.error('cloudinary upload error',error)
            return null;
        }
}

export default uploadOnCloudinary;
