if(process.env.NODE_ENV!= "production"){
require("dotenv").config();
}



const express=require("express");
const app=express();
const mongoose=require('mongoose');
const port=8080;
const path=require('path');
const Blog = require("./models/blog");
const User=require('./models/user.js')
const methodOverride= require('method-override');
const ejsMate=require("ejs-mate");
const flash=require('connect-flash')
app.use(flash());
const session=require('express-session')
const passport=require('passport');
const LocalStrateey=require('passport-local');
const {isLogeedIn,isOwner}=require('./middleware.js')
const multer=require('multer')
const {storage}=require("./cloudConfig.js")
const upload=multer({storage})

// app.post(upload.single("blog[image]"),(req,res)=>{
//     res.send(req.file)
// })

const sessionOptions={
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    Cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true 
    },
};
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrateey(User.authenticate()));
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(methodOverride('_method'));

const Db_URL=process.env.ATLASDB_URL;

main()
.then(()=>{
    console.log("connect to DB")
})
.catch((err)=>{
    console.log(err)
});
async function main(){
    await mongoose.connect(Db_URL)
};

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));
app.engine('ejs',ejsMate)

app.get('/',(req,res)=>{
    res.send("hello iam root")
});
app.use((req,res,next)=>{
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")
    res.locals.currUser=req.user;
    next()
});

// index route
app.get('/blog' ,async(req,res)=>{
    const allBlogs=await Blog.find({});
    res.render('blogs/index.ejs',{allBlogs});

});

// create new route
app.get("/blog/new",isLogeedIn,(req,res)=>{
    res.render("blogs/new.ejs");
});

// app.post('/blog',upload.single('blog[image]'),(req,res)=>{
//     res.send(req.file)
// })

// show route
app.get('/blog/:id',async(req,res)=>{
    let {id}=req.params;
    const blog=await Blog.findById(id).populate("owner");
    console.log(blog)
    res.render('blogs/show.ejs',{blog});
});
// create blog route
app.post('/blog',isLogeedIn,upload.single('blog[image]'),async(req,res)=>{
    let url=req.file.path;
    let filename=req.file.filename
    console.log(url , filename)
    let blog=req.body.blog;
    const newBlog=new Blog(blog);
    newBlog.owner=req.user._id;
    newBlog.image={url,filename}
    let savedBlog=await newBlog.save();
    console.log(savedBlog);
    req.flash("success","new blog is created ")
    res.redirect("/blog") ;
});
// edit
app.get("/blog/:id/edit",isLogeedIn,isOwner,async(req,res)=>{
    let {id}=req.params;
    const blog=await Blog.findById(id);
    res.render("blogs/edit.ejs",{blog});
});
// update route
app.put('/blog/:id',isLogeedIn,isOwner,async(req,res)=>{
    let {id}=req.params;
    let blog=await Blog.findByIdAndUpdate(id,{...req.body.blog});
    await blog.save();
    req.flash("success"," blog is updated ")
    res.redirect(`/blog/${id}`);
});
// delete route
app.delete("/blog/:id",isLogeedIn,isOwner,async(req,res)=>{
    let {id}=req.params;
    let blog=await Blog.findByIdAndDelete(id);
    console.log(blog);
    req.flash("success"," blog is deleted! ")
    res.redirect("/blog");
});


// signup page
app.get('/signup',(req,res)=>{
    res.render('users/Signup.ejs');
});

app.post('/signup',async(req,res)=>{
    try{
        let {username,email,password}=req.body;
    const newUser= new User({username,email});
     const registerUser=await User.register(newUser,password);
    console.log(registerUser);
    req.login(registerUser,(err)=>{
        if(err){
            return next(err)
        }
        req.flash("success","user registered sucessfully ")
        res.redirect("/blog");
    })
    
    } catch(e){
        req.flash("error",e.message);
        res.redirect('/signup')
    }
    
});

// login page
app.get('/login',(req,res)=>{
    res.render('users/Login.ejs');
});

app.post("/login",passport.authenticate('local',{faiureRedirect:'/login',failureFlash:true}),  async(req,res)=>{
    req.flash("success","welcome to blog website! you are logged in")
    res.redirect('/blog');

});
app.get("/logout",(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","you are logged out!")
        res.redirect('/blog')
    })
})


app.listen(port,()=>{
    console.log(`server is listing to port ${port}`);
});
