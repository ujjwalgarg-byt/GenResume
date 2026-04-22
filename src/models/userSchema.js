const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        unique:[true,"Already taken"],
        required:true,
    },
    email:{
        type:String,
        unique:[true,"Account already exists with this email address"],
        required:true,
    },
    password:{
        type:String,
        required:true,
    }
});

const User = mongoose.model("users",userSchema);

module.exports = User;