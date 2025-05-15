const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { UserModel } = require('../Models/userModel');
const catchAsyncError = require('../middleware/catchAsyncError');
const Errorhadler = require('../utils/errorhandlers');
const sendMail = require('../utils/mail');
const passport = require('passport');
// const messageModel=require('../Models/message')
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

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return next(new Errorhadler("User already exists", 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store user data temporarily
    otpStore.set(email, {
      otp,
      name,
      email,
      password: hashedPassword,
      role,
      expiresAt: Date.now() + 3 * 60 * 1000,
    });

    try {
      await sendMail({
        email,
        subject: "Your OTP for Signup in QueryNest",
        message: `Your OTP is: ${otp}. It is valid for 3 minutes.`,
      });

      res.status(200).json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
      otpStore.delete(email);
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

    const { name, password, role } = storedData;

    const newUser = new UserModel({
      name,
      email,
      password,
      role,
      isActivated: true,
    });

    await newUser.save();
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



userRoute.post("/forgot-password", catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new Errorhadler("Email is required", 400));
  }

  const user = await UserModel.findOne({ email });
  if (!user || !user.isActivated) {
    return next(new Errorhadler("No active user found with this email", 404));
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  otpStore.set(`forgot-${email}`, {
    otp,
    expiresAt: Date.now() + 3 * 60 * 1000,
  });

  try {
    await sendMail({
      email,
      subject: "OTP to Reset Your Password",
      message: `Your OTP for resetting your password is: ${otp}. It is valid for 3 minutes.`,
    });

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    otpStore.delete(`forgot-${email}`);
    return next(new Errorhadler("Failed to send OTP", 500));
  }
}));

userRoute.post("/verify-forgot-otp", catchAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) return next(new Errorhadler("Email and OTP are required", 400));

  const storedData = otpStore.get(`forgot-${email}`);
  if (!storedData || Date.now() > storedData.expiresAt) {
    otpStore.delete(`forgot-${email}`);
    return next(new Errorhadler("OTP expired or not found", 404));
  }

  if (storedData.otp !== otp)
    return next(new Errorhadler("Invalid OTP", 400));

  storedData.isVerified = true;
  otpStore.set(`forgot-${email}`, storedData); // re-save with verified flag

  res.status(200).json({ success: true, message: "OTP verified. You can now reset your password." });
}));

userRoute.put("/update-password", catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new Errorhadler("Email and new password are required", 400));

  const storedData = otpStore.get(`forgot-${email}`);
  if (!storedData || !storedData.isVerified)
    return next(new Errorhadler("OTP verification required", 403));

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await UserModel.findOneAndUpdate(
    { email },
    { password: hashedPassword }
  );

  if (!user) return next(new Errorhadler("User not found", 404));

  otpStore.delete(`forgot-${email}`);

  res.status(200).json({ success: true, message: "Password updated successfully" });
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




  const googleAuthCallback = async (req, res) => {
    try {
      const { profile, user } = req.user;

      const { displayName, emails } = profile;

      if (!emails || emails.length === 0) {
        return res.status(400).json({ message: 'Email is required for authentication' });
      }


      const email = emails[0].value;
      const name = displayName;

      

      let existingUser = await UserModel.findOne({ email });

      if (!existingUser) {
        existingUser = new UserModel({
          name,
          email,
          password: null,
          role: ['user'] ,
          isActivated: true,
        });
        await existingUser.save();
      }


    
      const token = jwt.sign({ id: existingUser._id, role: existingUser.role }, process.env.JWT_SECRET, { expiresIn: "24h" });

      res.cookie("accesstoken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });

      res.redirect(`http://localhost:5173/google-success?token=${token}`);

    } catch (err) {
      console.error("Google Auth Error:", err);
      res.status(500).json({ message: "Failed to authenticate with Google", error: err.message });
    }
  };




    userRoute.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));


    userRoute.get(
      "/google/callback",
      passport.authenticate("google", { session: false, failureRedirect: "http://localhost:5173/login" }),

      (req, res, next) => {
      
        console.log("User object:", req.user);
        next();
      },
      googleAuthCallback
    );



module.exports = { userRoute };
