const express = require("express")
const bodyParser = require("body-parser")
const ejs = require('ejs')
const mongoose = require('mongoose');
const req = require("express/lib/request");


const app = express();


app.set("view engine","ejs")

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userData",{useNewUrlParser:true});


app.get("/", function(req,res){
  res.render("homepage")
});

app.get("/signup", function(req,res){
  res.render("signup")
});


app.get("/login", function(req,res){
  res.render("login")
});

app.post("/signup",function(req,res){
  const user = new User ({
    firstName : req.body.firstname,
    lastName : req.body.lastname,
    email : req.body.email,
    password : req.body.password
});

user.save(function(err){
  if (err){
    console.log(err);
  }else{
    res.render("success")
  }
});
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

const userSchema = new mongoose.Schema({
     firstName : String,
     lastName : String,
     email : String,
     password : String
});

const User = mongoose.model("user",userSchema);





app.listen(3000,function(){
  console.log("server started on port 3000")
});
