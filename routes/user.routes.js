const express  = require("express");
const Router = require('router')

const { 
    signupUser 
  , loginUser 
  , logoutUser 
  , verifyUser 

} =  require('../controllers/user.controller')
const { auth } = require('../middlware/auth.middleware')
const userRouter = Router()

userRouter.post('/signup' , signupUser)
userRouter.post('/login' , loginUser)
userRouter.post('/logout' , auth ,  logoutUser)
userRouter.get('/verify/:id/:token' , verifyUser)

module.exports = userRouter
