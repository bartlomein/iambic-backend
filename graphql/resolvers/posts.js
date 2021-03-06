const { AuthenticationError, UserInputError } = require("apollo-server");

const Post = require("../../models/Post");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    async getPosts(_, { offset, limit }) {
      try {
        const posts = await Post.find({ type: "poem" })
          .sort({
            createdAt: -1,
          })
          .limit(limit)
          .skip(offset);
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getRapPosts(_, { offset, limit }) {
      try {
        const posts = await Post.find({ type: "rap" })
          .sort({
            createdAt: -1,
          })
          .limit(limit)
          .skip(offset);
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPostsSortedByLikes(_, { offset, limit }) {
      try {
        const posts = await Post.find({ type: "poem" })
          .sort({ likesCount: -1 })
          .limit(limit)
          .skip(offset);
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPostsSortedByComments(_, { offset, limit }) {
      try {
        const posts = await Post.find({ type: "poem" })
          .sort({ commentsCount: -1 })
          .limit(limit)
          .skip(offset);
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createPost(_, { title, body, type }, context) {
      const user = checkAuth(context);
      //   console.log(args);
      //   if (args.body.trim() === '') {
      //     throw new Error('Post body must not be empty');
      //   }

      const newPost = new Post({
        title,
        body,
        type,
        user: user.id,
        likesCount: 0,
        commentsCount: 0,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();

      context.pubsub.publish("NEW_POST", {
        newPost: post,
      });

      return post;
    },
    async deletePost(_, { postId }, context) {
      const user = checkAuth(context);
      console.log(postId);
      try {
        const post = await Post.findById(postId);
        if (user.username === post.username) {
          await post.delete();
          return "Post deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async likePost(_, { postId }, context) {
      const { username } = checkAuth(context);

      const post = await Post.findById(postId);
      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          // Post already likes, unlike it
          post.likes = post.likes.filter((like) => like.username !== username);
          post.likesCount = post.likesCount - 1;
        } else {
          // Not liked, like post
          post.likes.push({
            username,
            createdAt: new Date().toISOString(),
          });
          post.likesCount = post.likesCount + 1;
        }

        await post.save();
        return post;
      } else throw new UserInputError("Post not found");
    },
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_POST"),
    },
  },
};
