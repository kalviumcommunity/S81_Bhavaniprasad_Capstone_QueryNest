const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
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
      upvote: {
          type:Number,
      },
      share: {
          type:Number,
      }
      
    },
    {
      timestamps: true // adds createdAt and updatedAt
    }
  );

module.exports = mongoose.model('Message', messageSchema);
