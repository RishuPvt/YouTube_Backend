import { ApiError } from "../Utils/ApiError";
import { ApiResponse } from "../Utils/ApiResponse";
import { asyncHandler } from "../Utils/asynchandler";
import { Subscription } from "../Models/Subscription.model";



// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

})
export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}