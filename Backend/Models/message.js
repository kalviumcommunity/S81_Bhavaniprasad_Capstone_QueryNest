const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
      },
      commenter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
      content: {
        type: String,
        required: true
      },
      photo:{
        type:String,
      },
      upvote: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      }],
      share: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      }]
    },
    {
      timestamps: true // adds createdAt and updatedAt
    }
  );
const Question =mongoose.model("Message",messageSchema)
module.exports = {Question}
