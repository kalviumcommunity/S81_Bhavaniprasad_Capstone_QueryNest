const express = require('express')
const {userRoute} = require('./controllers/userRoute')
const app=express()
app.use(express.json())


app.get('/',(req,res)=>{
    try {
      res.status(200).send(`it is now working properly 😉`)
    } catch (error) {
        res.status(500).json(`some thing is worng 🥳 hurry 💩`)
    }
})

app.use('/user',userRoute)






module.exports={app}