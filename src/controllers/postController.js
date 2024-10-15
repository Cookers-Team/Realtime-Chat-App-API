import Friendship from "../models/friendshipModel.js";
import Notification from "../models/notificationModel.js";
import Post from "../models/postModel.js";
import {
  deleteFileByUrl,
  isValidUrl,
  makeErrorResponse,
  makeSuccessResponse,
} from "../services/apiService.js";
import { formatPostData, getListPosts } from "../services/postService.js";

const createPost = async (req, res) => {
  try {
    const { content, imageUrls, status = 1, kind } = req.body;
    const { user } = req;
    const validImageUrls =
      imageUrls?.map((url) => (isValidUrl(url) ? url : null)).filter(Boolean) ||
      [];
    const post = await Post.create({
      user: user._id,
      content,
      imageUrls: validImageUrls,
      status,
      kind,
    });
    const friendships = await Friendship.find({
      $or: [{ sender: user._id }, { receiver: user._id }],
      status: 2,
    });
    const allFriendNotifications = friendships.map((friendship) => {
      const friendId = friendship.sender.equals(user._id)
        ? friendship.receiver
        : friendship.sender;
      return {
        user: friendId,
        data: {
          user: { _id: user._id },
          post: { _id: post._id },
        },
        message: `${user.displayName} đã đăng bài viết mới`,
      };
    });
    if (allFriendNotifications.length > 0) {
      await Notification.insertMany(allFriendNotifications);
    }
    return makeSuccessResponse({
      res,
      message: "Create post success",
    });
  } catch (error) {
    return makeErrorResponse({ res, message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id, content, imageUrls, kind } = req.body;
    const post = await Post.findById(id).populate("user");
    if (!post) {
      return makeErrorResponse({ res, message: "Post not found" });
    }
    const oldImageUrls = post.imageUrls || [];
    const imagesToDelete = oldImageUrls.filter(
      (url) => !imageUrls.includes(url)
    );
    for (const imageUrl of imagesToDelete) {
      await deleteFileByUrl(imageUrl);
    }
    await post.updateOne({
      content,
      kind,
      status: post.status === 3 ? 1 : post.status,
      isUpdated: 1,
      imageUrls: imageUrls
        ? imageUrls
            .map((imageUrl) => (isValidUrl(imageUrl) ? imageUrl : null))
            .filter((url) => url !== null)
        : [],
    });
    return makeSuccessResponse({ res, message: "Post updated" });
  } catch (error) {
    return makeErrorResponse({ res, message: error.message });
  }
};

const changeStatusPost = async (req, res) => {
  try {
    const { id, status, reason } = req.body;
    const { user } = req;
    const post = await Post.findById(id).populate("user");
    if (!post) {
      return makeErrorResponse({ res, message: "Post not found" });
    }
    await post.updateOne({ status });
    if (!post.user._id.equals(user._id)) {
      await Notification.create({
        user: post.user._id,
        data: {
          post: {
            _id: post.id,
          },
        },
        kind: status === 2 ? 2 : 3,
        message:
          status === 2
            ? "Bài đăng của bạn đã được xét duyệt thành công"
            : `Bài đăng của bạn đã bị từ chối!\nLý do: ${reason}`,
      });
    }
    return makeSuccessResponse({ res, message: "Post status changed" });
  } catch (error) {
    return makeErrorResponse({ res, message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const id = req.params.id;
    const { reason } = req.body;
    const { user } = req;
    const post = await Post.findById(id).populate("user");
    if (!post) {
      return makeErrorResponse({ res, message: "Post not found" });
    }
    await post.deleteOne();
    if (!post.user._id.equals(user._id) && reason) {
      await Notification.create({
        user: post.user._id,
        kind: 3,
        message: `Bài đăng của bạn đã bị gỡ bỏ\nLý do: ${reason}`,
      });
    }
    return makeSuccessResponse({
      res,
      message: "Delete user success",
    });
  } catch (error) {
    return makeErrorResponse({ res, message: error.message });
  }
};

const getPost = async (req, res) => {
  try {
    const id = req.params.id;
    const currentUser = req.user;
    const post = await Post.findById(id).populate("user");
    if (!post) {
      return makeErrorResponse({ res, message: "Post not found" });
    }
    return makeSuccessResponse({
      res,
      data: await formatPostData(post, currentUser),
    });
  } catch (error) {
    return makeErrorResponse({ res, message: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const result = await getListPosts(req);
    return makeSuccessResponse({
      res,
      data: result,
    });
  } catch (error) {
    return makeErrorResponse({ res, message: error.message });
  }
};

export {
  createPost,
  updatePost,
  deletePost,
  getPost,
  getPosts,
  changeStatusPost,
};
