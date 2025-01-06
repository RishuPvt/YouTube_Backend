import mongoose, { Schema } from "mongoose"; // Importing mongoose and Schema from mongoose
import jwt from "jsonwebtoken"; // Importing jsonwebtoken for token generation
import bcrypt from "bcrypt"; // Importing bcrypt for password hashing

// Defining the user schema
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true // Indexed for faster search
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true, // Corrected spelling: was 'lowecase'
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true // Indexed for faster search
        },
        avatar: {
            type: String, // URL to the user's avatar image stored in Cloudinary
            required: true,
        },
        coverImage: {
            type: String, // URL to the user's cover image stored in Cloudinary
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video" // References to Video documents
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String // Refresh token for maintaining session
        },
    },
    {
        timestamps: true // Automatically add createdAt and updatedAt timestamps
    }
);

// Middleware to hash the password before saving a user document
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // If password is not modified, skip

    this.password = await bcrypt.hash(this.password, 10); // Hash the password with a salt factor of 10
    next(); // Proceed to the next middleware
});

// Instance method to check if the entered password is correct
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password); // Compare entered password with the hashed password
};

// Instance method to generate an access token
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET, // Secret key for signing the token
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY // Token expiration time
        }
    );
};

// Instance method to generate a refresh token
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET, // Secret key for signing the token
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY // Token expiration time
        }
    );
};

// Exporting the User model based on the userSchema
export const User = mongoose.model("User", userSchema);
3