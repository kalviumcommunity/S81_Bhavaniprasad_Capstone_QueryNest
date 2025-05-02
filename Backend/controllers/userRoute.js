const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { UserModel } = require('../Models/userModel');
const catchAsyncError = require('../middleware/catchAsyncError');
const Errorhadler = require('../utils/errorhandlers');
const sendMail = require('../utils/mail');
require('dotenv').config();

const userRoute = express.Router();
const otpStore = new Map();

const generateToken = (id, role, name, email) => {
  return jwt.sign({ id, role, name, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

userRoute.post("/signup", catchAsyncError(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return next(new Errorhadler("name, email, and password required", 400));
  }

  let existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return next(new Errorhadler("User already exists", 409));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new UserModel({ name, email, password: hashedPassword, role });

  const otp = crypto.randomInt(100000, 999999).toString();
  otpStore.set(email, {
    otp,
    name,
    expiresAt: Date.now() + 3 * 60 * 1000,
  });

  try {
    await sendMail({
      email,
      subject: "Your OTP for Signup in Querynest",
      message: `Your OTP is: ${otp}. It is valid for 3 minutes.`
    });

    await user.save();

    setTimeout(async () => {
      try {
        const user = await UserModel.findOne({ email });
        if (user && !user.isActivated) {
          await UserModel.deleteOne({ email });
          otpStore.delete(email);
          console.log(`Deleted unverified user and OTP: ${email}`);
        }
      } catch (err) {
        console.error(`Error deleting unverified user ${email}:`, err.message);
      }
    }, 3 * 60 * 1000);

    res.status(200).json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    return next(new Errorhadler("Failed to send OTP", 500));
  }
}));



userRoute.post("/otp-verify", catchAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new Errorhadler("Email and OTP are required", 400));
  }

  const storedData = otpStore.get(email);

  if (!storedData || Date.now() > storedData.expiresAt) {
    otpStore.delete(email);
    return next(new Errorhadler("OTP expired or not requested", 404));
  }

  if (storedData.otp !== otp) {
    return next(new Errorhadler("Invalid OTP", 400));
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new Errorhadler("Please start signup again", 404));
  }

  await UserModel.findByIdAndUpdate(user._id, { isActivated: true });
  otpStore.delete(email);

  res.status(200).json({ success: true, message: "Signup successful" });
}));




userRoute.post("/login", catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new Errorhadler("Email and password are required", 400));
  }

  let user = await UserModel.findOne({ email });

  if (!user || !user.isActivated) {
    return next(new Errorhadler("Please Signup", 400));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new Errorhadler("Password is incorrect", 400));
  }

  const token = generateToken(user._id, user.role, user.name, user.email);

  res.cookie("accesstoken", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ success: true, message: "Login successful", token });
}));

userRoute.post("/message", catchAsyncError(async (req, res, next) => {
  const { message } = req.body;

  if (!message) {
    return next(new Errorhadler("Please write your question", 400));
  }

  const newMessage = new messageModel({ message });
  await newMessage.save();

  try {
    await sendMail({
      email: process.env.ADMIN_NAME,
      subject: "New Question Posted",
      message: `A new question has been posted: ${message}`,
    });
    res.status(200).json({ success: true, message: "Message posted and email sent" });
  } catch (error) {
    return next(new Errorhadler("Failed to send notification email", 500));
  }
}));

userRoute.get("/users", catchAsyncError(async (req, res, next) => {
  const token = req.cookies.accesstoken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new Errorhadler("Access denied: No token provided", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new Errorhadler("Invalid token", 401));
  }

  if (decoded.role !== 'admin') {
    return next(new Errorhadler("Access denied: Admins only", 403));
  }

  const users = await UserModel.find().select("-password"); // exclude password from result
  res.status(200).json({ success: true, users });
}));






module.exports = { userRoute };
