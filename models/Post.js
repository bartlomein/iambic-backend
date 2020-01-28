const { model, Schema } = require("mongoose");

const postSchema = new Schema({
  title: String,
  body: [String],
  username: String,
  createdAt: String,
  type: String,

  comments: [
    {
      body: String,
      username: String,
      createdAt: String
    }
  ],

  likes: [
    {
      username: String,
      createdAt: String
    }
  ],
  likesCount: Number,
  commentsCount: Number,
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  }
});

module.exports = model("Post", postSchema);
