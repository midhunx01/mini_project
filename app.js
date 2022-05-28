require('dotenv').config()
const express = require("express")
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

const app = express();


app.set("view engine","ejs")

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(session({
      secret : "our little secret",
      resave : false,
      saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userData",{useNewUrlParser:true});


const userSchema = new mongoose.Schema({
  firstName : String,
  lastName : String,
  username : String,
  password : String
});

userSchema.plugin(passportLocalMongoose);

//userSchema.plugin(encrypt,{secret : process.env.API_KEY,encryptedFields:["password"]});

const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req,res){
  if (req.isAuthenticated()){
    res.redirect("/homepage");
  } else {
    res.redirect("/login")
  }
 
});

app.get("/homepage",function (req,res){
  res.render("homepage")
})

app.get("/signup", function(req,res){
  res.render("signup")
});


app.get("/login", function(req,res){
  res.render("login")
});



app.post("/signup",function(req,res){
 
  User.register({username : req.body.email},req.body.password,function (err,user){
    if (err){
      console.log(err);
      res.render("signup");
    }else {
      passport.authenticate("local") (req,res,function(){
        res.redirect("/");
      });
    }
  })
});

app.post("/login",function(req,res){
   const username = req.body.email;
   const password = req.body.password;

   User.findOne({email : username},function(err,foundUser){
     if (err){
       console.log(err);
     }else {
       if (foundUser){
         if (foundUser.password === password){
           res.render("homepage")
         }
       }
     }
   })
})





app.listen(3000,function(){
  console.log("server started on port 3000")
});
