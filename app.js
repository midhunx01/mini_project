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

mongoose.connect("mongodb://localhost:27017/userData",{useNewUrlParser: true});


const userSchema = new mongoose.Schema({
  username : String,
  email : String,
  password : String,
});

userSchema.plugin(passportLocalMongoose);

//userSchema.plugin(encrypt,{secret : process.env.API_KEY,encryptedFields:["password"]});

const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req,res){
 res.render("index")
 });

app.get("/homepage",function (req,res){
  if (req.isAuthenticated()){
    res.render("homepage")
  } else {
    res.redirect("/login")
  }
  
});

app.get("/signup", function(req,res){
  res.render("signup")
});


app.get("/login", function(req,res){
  res.render("login")
});

app.get("/success",function(req,res){
  res.render("success")
})


app.post("/signup",function(req,res){
 
  User.register({username : req.body.username, email : req.body.email},req.body.password , function (err, user){
      if (err) {
        console.log(err);
        res.redirect("/login");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/homepage");
        });
      }
    });
});

app.post("/login",function(req,res){

  const user = new User({
    username : req.body.username,
    password : req.body.password,
  });
   
   req.login(user , function (err){
     if (err){
       console.log(err);
     }else {
       passport.authenticate("local")(req,res,function (){
         res.redirect("/homepage");
       })
     }
    })
   });

   app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { 
        return next(err); }
      res.redirect('/');
    });
  });





app.listen(3000,function(){
  console.log("server started on port 3000")
});
