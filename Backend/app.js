const express = require('express')
const ErrorMiddleware=require('./middleware/error')
const {userRoute} = require('./controllers/userRoute')
const {messageRoute}=require('./controllers/messageRoute')
const app=express()
const path = require('path');
app.use(express.json())
const cors=require('cors')
require('./config/passport')

app.use(cors({
  origin:"http://localhost:5173",
  credentials:true,
}))

app.get('/',(req,res)=>{
    try {
      res.status(200).send(`it is now working properly 😉`)
    } catch (error) {
        res.status(500).json(`some thing is worng 🥳 hurry 💩`)
    }
})

app.use('/user',userRoute)
app.use('/ask',messageRoute)
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use(ErrorMiddleware)

module.exports={app}