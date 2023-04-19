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

///Get Routes///----------------------------------------------------------------------------------------------------------------------------------------------------------------

//sets up routes for navigation
app.get('/', function(req, res){
    
    //renders the SignIn page, this means that the user will always be brought here when the site is loaded
      res.render('pages/SignIn');
  
  })
  
//decides what to serve when /Signup is retrieved
app.get('/SignUp', function(req,res){

    //Renders the Signup page
      res.render('pages/SignUp');
  })
  
  //gets the sign in function, calls req and res
  app.get('/SignIn', function(req, res){
  
    //checks if the user has logged in
      if (req.session.loggedin) {
  
        //sets logs the user out of the session
          req.session.loggedin = false;
  
        //clears the current user
          req.session.currentuser = '';
        
        //renders the SignIn page
          res.render('pages/SignIn');
        }
      
      //if the user isnt logged in just render the sign in screen
      else{
          res.render('pages/SignIn');
      }
  })
  
  