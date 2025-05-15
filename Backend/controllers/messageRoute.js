const express = require("express");
const messageRoute = express.Router();
const { Question } = require("../Models/message");
const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorhandlers");
// const {upload}=require('../middleware/multer')
const multer = require("multer");
const path =require('path')
// POST /message



  const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'uploads/questions'); 
      },
      filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext); 
      }
    });
    
    const upload = multer({ storage });




  messageRoute.post(
    "/questions",
     upload.single("photo"), // ✅ handle file upload with key `photo`
    catchAsyncError(async (req, res, next) => {
      const { title, content, sender } = req.body;
  
      if (!title || !content || !sender) {
        return next(new ErrorHandler("Title, content, and sender are required", 400));
      }
  
      // Save photo filename if it exists
      let photoFilename = "";
      if (req.file) {
        photoFilename = req.file.filename;
      }
  
      const newQuestion = new Question({
        title,
        content,
        sender,
          photo: photoFilename, // ✅ Save photo info in the question document
      });
  
      const savedQuestion = await newQuestion.save();
  
      res.status(201).json({ success: true, savedQuestion });
    })
  );
  

messageRoute.get('/questions', catchAsyncError(async (req, res, next) => {
    const questions = await Question.find()
      .populate('sender', 'name') 
      .sort({ createdAt: -1 });
  
    if (!questions || questions.length === 0) {
      return next(new ErrorHandler('No questions found', 404));
    }
  
    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  }));


      messageRoute.put('/questions/upvote/:id', catchAsyncError(async (req, res, next) => {
        const question = await Question.findById(req.params.id);
        if (!question) {
          return next(new ErrorHandler('Question not found', 404));
        }
      
        const userId = req.body.id;

        const hasUpvoted = question.upvote.includes(userId);

        if (hasUpvoted) {
          question.upvote.pull(userId);
        } else {
          question.upvote.push(userId);
        }
      
        await question.save();
      
        res.status(200).json({
          success: true,
          message: hasUpvoted ? 'Upvote removed' : 'Upvoted successfully',
          totalUpvotes: question.upvote.length
        });
      }));


    messageRoute.delete(
      '/questions/delete/:id',
      catchAsyncError(async (req, res, next) => {
        const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    
        if (!deletedQuestion) {
          return next(new ErrorHandler('Question not found', 404));
        }
    
        res.status(200).json({
          success: true,
          message: 'Question deleted successfully'
        });
      })
    );

module.exports = { messageRoute };
