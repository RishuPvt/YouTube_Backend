import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asynchandler.js";
import { Subscription } from "../Models/Subscription.model.js";

// controller to  subscribe list of a channel
const subscribeToChannel = asyncHandler(async (req, res) => {
  const { userId, channelId } = req.body;

  try {
    
     // Prevent self-subscription
    if (userId.toString() === channelId.toString()) {
        throw new ApiError(400, "User cannot subscribe to themselves");
    }
  
    const existingSubscription = await Subscription.findOne({
      subscriber: userId,
      channel: channelId,
    });

    if (existingSubscription) {
      throw new ApiError(404, "User already subscribed");
    }

    // Create a new subscription
    const subscription = new Subscription({
      subscriber: userId,
      channel: channelId,
    });

    await subscription.save();

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          subscription,
          "Subscribed successfully",
          subscription,
        ),
      );
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// controller to  Unsubscribe list of a channel
const unsubscribeFromChannel = asyncHandler(async (req, res) => {
  const { userId, channelId } = req.body;
  try {
    const subscription = await Subscription.findOne({
      subscriber: userId,
      channel: channelId,
    });

    if (!subscription) {
      throw new ApiError(404, "subscription not found");
    }

    await Subscription.findByIdAndDelete(subscription._id);

    return res.status(200).json(new ApiResponse(200, "Unsubscribed successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  
  try {
    const channel   = await Subscription.findById(channelId ).populate(
      "subscriber",
      "username fullName",
    )
    
    if (!channel  ) {
      throw new ApiError(404, "subscribers  not found");
    }
   
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Subscribers fetch succesfully",
        ),
      );
  } catch (error) {
    res
      .status(500)
      .json(new ApiError(500, error, "subscriber fetch unsuccesfully"));
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  try {
    const channel = await Subscription.find({
      subscribers: subscriberId,
    }).select("username");
    if (!channel || channel.length === 0) {
      throw new ApiError(404, "No subscriptions found for this user");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { subscribers: channel.subscriber },
          "Subscribers fetch succesfully",
        ),
      );
  } catch (error) {}
});

// controller to  check Subscription Status of a channel
const checkSubscriptionStatus = asyncHandler(async (req, res) => {});

// controller to  get Subscriber Count of a channel
const getSubscriberCount = asyncHandler(async (req, res) => {});

// toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
});

export {
  subscribeToChannel,
  unsubscribeFromChannel,
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
};
