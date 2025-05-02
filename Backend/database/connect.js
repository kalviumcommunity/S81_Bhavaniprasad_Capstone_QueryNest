const mongoose=require('mongoose')
require('dotenv').config()

const connect=mongoose.connect(process.env.mongodb)
    .then(()=>console.log(`connected to database 🚀`))
    .catch((error)=>console.error(`connection Failed 💨`,error.message))

module.exports={connect}