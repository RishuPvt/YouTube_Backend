import mongoose, { Schema } from "mongoose"; // Importing mongoose and Schema from mongoose
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // Importing the pagination plugin

// Defining the video schema
const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // URL to the video file stored in Cloudinary
            required: true
        },
        thumbnail: {
            type: String, // URL to the thumbnail image stored in Cloudinary
            required: true
        },
        title: {
            type: String, 
            required: true
        },
        description: {
            type: String, 
            required: true
        },
        duration: {
            type: Number, // Duration of the video in seconds
            required: true
        },
        views: {
            type: Number,
            default: 0 // Default views count is 0
        },
        isPublished: {
            type: Boolean,
            default: true // Default isPublished status is true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User" // Reference to the User model
        }
    }, 
    {
        timestamps: true // Automatically add createdAt and updatedAt timestamps
    }
);

// Adding the pagination plugin to the video schema
videoSchema.plugin(mongooseAggregatePaginate);

// Exporting the Video model based on the videoSchema
export const Video = mongoose.model("Video", videoSchema);
