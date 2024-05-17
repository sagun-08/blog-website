const mongoose=require("mongoose");
const User=require("./user.js")
const  Schema=mongoose.Schema;
const blogSchema=new Schema({
    description:{
        type:String,
        required:true,
    },
    thought:{
        type:String,
        required:true,
    },
    image:{
        url:String,
       filename:String,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:'User',
    },
});

const Blog=mongoose.model('Blog',blogSchema);
module.exports=Blog;
