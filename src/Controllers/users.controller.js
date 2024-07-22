import {asyncHandler} from '../Utils/asynchandler.js'
import {ApiError} from "../Utils/ApiError.js"
import {User} from "../Models/User.Model.js"
import {uploadOnCloudinary} from "../Utils/Cloudinary.js"
import {ApiResponse} from "../Utils/ApiResponse.js"


const registerUser=asyncHandler( async (req , res )=>{
    
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


  // get user details from frontend
    const {fullName, email, username, password } = req.body
   // console.log("email:", email)
    //console.log("FullName:", fullName)
    //console.log("req.body from useercontroller:", req.body)

  
    // validation - not empty
    //Advance syntax to check
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    
    //console.log(existedUser)

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;

    //console.log(req.files);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // check for images, check for coverImage

    //const coverImageLocalPath = req.files?.coverImage[0]?.path;    
    const coverImageLocalPath=req.files.coverImage[0].path
    /* if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    } */

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)

   

    // upload them to cloudinary, coverImage
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})












export {registerUser}







//to test the code on postman
/* const registerUser=asyncHandler( async (req , res )=>{
    res.status(200).json({
        message:"ok"
    })
})
 */

 // validation - not empty
/* if(fullName===""){
    throw new ApiError(400,"FullName is Req")
} */