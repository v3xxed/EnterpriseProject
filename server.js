//Setup Express ------------------------------------------------------------------------- 
const express = require('express');
const app = express();

//sets up express session so that the user can remain signed in
const session = require('express-session'); 

//sets up the body parser
const bodyParser = require('body-parser');

app.use(express.urlencoded({extended: true}))

//sets the view engine to ejs so we can make use of templates
app.set('view engine', 'ejs');

//allows the use of static elements
app.use(express.static('public'));

//variable to hold the database
var db;

app.use(session({
    secret : 'example',
    resave: true,
    saveUninitialized: true
  }));

  
//tells express we want to read posted forms
app.use(bodyParser.urlencoded({
    extended: true
  }))

app.use(bodyParser.json());

app.use(function(req, res, next){
  res.locals.username = req.session.currentuser
  next();
  })

//Setup MongoDB--------------------------------------------------------------------------------
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb+srv://admin:Admin123@enterpriseproject.qz3grsf.mongodb.net/test';

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
  console.log('DB connected');
//defines db as our database
  db = mongoose.connection;
})
.catch(err => console.log(err));

//Start Server--------------------------------------------------------------------------------
const serverPort = 8080;

//tells the application to listen on port 8080 and logs it
app.listen(serverPort, () => console.log(`Using port ${serverPort}`));
