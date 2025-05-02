const express = require("express")
const mongoose = require("mongoose")
const { User } = require("../models/user.model")
const bcrypt = require("bcryptjs")
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken")
require("dotenv").config()
const nodemailer = require("nodemailer")
const { sendEmail } = require("../utils/sendEmail")
require("dotenv").config()


const signupUser = async (req , res) => {
  try {
    const { name , email  , password , walletAddress } = req.body;


    if(!name || !email || !password || !walletAddress){
      return res.status(400).json({message : "Please Enter all necessary fields"})
    }

    const existingUser = await User.findOne({ email });
    if(existingUser){
      return res.status(400).json({message : "User already registered"})
    }
    

    // const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password , 10)
    const newUser = new User({name : name , email : email , password : hashedPassword ,walletAddress : walletAddress })
    await newUser.save()


  const verificationToken = jwt.sign({userId : newUser._id}, process.env.ACCESS_TOKEN_KEY , {expiresIn : '15m'})

  const url = `${process.env.FRONTEND_URL}/api/user/verify/${newUser._id}/${verificationToken}`
  await sendEmail(newUser.email , "Please Verify Your Email" , url)
  
    return res.status(201).json({
      success : true ,
      error : false ,
      message : 'User successfully registered , Please check your email to verify'
    })

  }

  catch(error) {
    return res.status(400).json({
      success : false ,
      error : true ,
      message : `Something went wrong  - Error registering user`,
      details : error.message
    })
  }
}

const loginUser = async (req , res ) => {
  try {
    const { email , password } = req.body;
 
    const findUser = await User.findOne({email})
   
    if(!findUser) {
      return res.status(400).json({message : "User is not registered"})
    }
    console.log(findUser)
    const checkPassword = await bcrypt.compare(password, findUser.password);

    console.log("Entered password:", password);
    console.log("Stored hash:", findUser.password);
    console.log("Password comparison result:", checkPassword);

    if(!checkPassword){
      return res.status(400).json({message : "Invalid Credentials"})
    }

 
    const accessToken = jwt.sign({ userId : findUser._id , role : findUser.role } , process.env.ACCESS_TOKEN_KEY , {expiresIn : '10m'})

    const refreshToken = jwt.sign({ userId : findUser._id , role : findUser.role} , process.env.REFRESH_TOKEN_KEY , {expiresIn : '7d'})

    const cookieOption  = {
      httpOnly : true , 
      secure : true ,
      sameSite : "None"
    }

    res.cookie('accessToken' , accessToken , cookieOption)
    res.cookie('refreshToken' , refreshToken ,  cookieOption)

   return  res.status(200).json({
      success : true  , 
      error : false ,
      message : `User successfully logged in` , 
      accessToken : accessToken ,
      refreshToken : refreshToken
    })

  }
  catch (error) {
      return res.status(400).json({
        success : false , 
        error : error, 
        message : 'Error logging in user',

      })
  }
}

const logoutUser = async (req , res) => {
  try {
      const cookieOption = {
        httpOnly : true ,
        secure : true , 
        sameSite : 'None'
      }
      res.clearCookie('accessToken' , cookieOption)
      res.clearCookie('refreshToken' , cookieOption)
    
      res.status(200).json({message : "User successfully logged out"})
  }
  catch (error){
    res.status(400).json({
      success : false,
      error : true,
      message : "Error logging out user"
    })
  }
 
}

const verifyUser = async (req, res) => {
  try {
    const user = await User.findOne({_id : req.params.id})
    if(!user){
      return res.status(400).json({message : "User not found"})
    }

    const token = await jwt.verify(req.params.token , process.env.ACCESS_TOKEN_KEY)
    if(!token){
      return res.status(400).json({message : "Invalid user"})
    }
    console.log(token)

    await User.updateOne({_id : user._id } , {verify_email : true})
    res.status(200).json({
      success : true , 
      error : false , 
      message : "User successfully verified"
    })
  }
  catch(error){
    res.status(400).send({
      success : false , 
      error : true , 
      message : "Error verifying user "
    })
  }
}



module.exports = {
  signupUser,
  loginUser,
  logoutUser,
  verifyUser
}