import Notification from "../models/notificationModel.js";
import {
  makeErrorResponse,
  makeSuccessResponse,
  getPaginatedData,
} from "../services/apiService.js";

const getListNotifications = async (req, res) => {
  try {
    const { user } = req;
    const { status } = req.query;
    const query = { user };
    if (status === "1" || status === "2") {
      query.status = status;
    }
    const result = await Notification.find(query).sort({
      createdAt: -1,
    });
    return makeSuccessResponse({
      res,
      data: result,
    });
  } catch (error) {
    return makeErrorResponse({ res, message: error.message });
  }
};

const readNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: user._id },
      { status: 2 },
      { new: true }
    );
    if (!notification) {
      return makeErrorResponse({ res, message: "Notification not found" });
    }
    const result = await Notification.find({ user: user._id }).sort({
      createdAt: -1,
    });
    return makeSuccessResponse({
      res,
      message: "Notification marked as read",
      data: result,
    });
  } catch (error) {
    return makeErrorResponse({ res, message: error.message });
  }
};

const readAllNotifications = async (req, res) => {
  try {
    const { user } = req;
    await Notification.updateMany({ user: user._id, status: 1 }, { status: 2 });
    const result = await Notification.find({ user: user._id }).sort({
      createdAt: -1,
    });
    return makeSuccessResponse({
      res,
      data: result,
      message: "All notifications marked as read",
    });
  } catch (error) {
    return makeErrorResponse({ res, message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: user._id,
    });
    if (!notification) {
      return makeErrorResponse({ res, message: "Notification not found" });
    }
    const result = await Notification.find({ user: user._id }).sort({
      createdAt: -1,
    });
    return makeSuccessResponse({
      res,
      data: result,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    return makeErrorResponse({ res, message: error.message });
  }
};

const deleteAllNotifications = async (req, res) => {
  try {
    const { user } = req;
    await Notification.deleteMany({ user: user._id });
    const result = await Notification.find({ user: user._id }).sort({
      createdAt: -1,
    });
    return makeSuccessResponse({
      res,
      data: result,
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    return makeErrorResponse({ res, message: error.message });
  }
};

export {
  getListNotifications,
  readNotification,
  readAllNotifications,
  deleteNotification,
  deleteAllNotifications,
};