const mongoose = require('mongoose')

const userSchema =new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:"user",
        enum:["user","admin"]
    },
    isActivated:{
        type:Boolean,
        default:false
    },
})




const UserModel =mongoose.model("user",userSchema)


module.exports={UserModel}