const Blog=require("./models/blog.js")
module.exports.isLogeedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","you must be logged in to create blog!")
        return res.redirect("/login")
    }
    next();
}
module.exports.isOwner= async(req,res,next)=>{
    let {id}=req.params;
    let blog=await Blog.findById(id)
    if(!blog.owner.equals(res.locals.currUser._id)){
        req.flash("error","you are not the owner of this blog ")
        return res.redirect(`/blog/${id}`)
    }
    next()
}