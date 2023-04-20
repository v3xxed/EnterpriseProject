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
mongoose.set('strictQuery', false);
const uri = 'mongodb+srv://admin:Admin123@EnterpriseProject.qz3grsf.mongodb.net/project';

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
const serverPort = process.env.PORT || 8000;

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

//when the app calls UserAccount this function is run
app.get('/UserAccount', function(req, res){

  //if the user isnt logged in redirect them to the sign screen
    if (!req.session.loggedin) {
        res.render('pages/SignIn');
        return;
      }

      //if the user is logged in 
      else{
        
        //finds quotes where the author is the logged in user and returns them to an array called owned
        db.collection('quotes').find({"Author": req.session.currentuser}).toArray(function (err, owned) {
          if (err) throw err;

          //finds a single quote where the logged in user is the author and stores it in an array called quotefound
          db.collection('quotes').findOne({"Author": req.session.currentuser}, function (err, quotefound) {
            if (err) throw err;

            //renders the user account and passes in the quotes and username
            res.render('pages/UserAccount', {Quotes: owned, Contract: quotefound, User: req.session.currentuser})

          })
        });
      }
     })

//function gets called when quote is requested
app.get('/Quote', function(req, res){

  //checks if the user is logged in
  if (!req.session.loggedin) {

      //renders the sign in page
      res.render('pages/SignIn');
      return;
    }

    //if the user is logged in then quote is loaded
    else{
      res.render('pages/Quote');
    }
})

////Post Requests/////-------------------------------------------------------------------------------------------------------------

//when the login form is submitted this function is called 
app.post('/dologin', function (req, res) {
    console.log(JSON.stringify(req.body))
    //reads the username from the body into a constant
    const uname = req.body.username;
    //reads the password from the password field
    var pword = req.body.password;

    //searches for the user in the database
    db.collection('users').findOne({
        "username": uname
    }, function (err, result) {
        if (err) throw err;

        //redirects the user to the sign in page again if a user isnt found
        if (!result) {
            res.redirect('/SignIn');
            console.log("user not found :(")
            return
          }

        //checks if the users password matches the one stored in the database
        if (result.password == pword) {

            //logs the user in
            req.session.loggedin = true;

            //sets the current user to uname
            req.session.currentuser = uname;
            
            //redirects the user to their account
            res.redirect('/UserAccount');
            //message in the console to let us know someone logged in
            console.log("a user was recognised, horay!")
        
        //redirects the user to sign in again if the user isnt found
        }else{
            res.redirect('/SignIn')
            console.log("user not found :(")
        }
    });
});

//post request used to create a user, is called when a user creates an account
app.post('/createauser', function(req, res){
  console.log(JSON.stringify(req.body))
  var uname = req.body.username;
  var pword = req.body.password;

  //creates a variable holding the new users login details
  var newuser = {
      "username" : uname,
      "password" : pword
  }

  //checks if the username is already in the database
  db.collection('users').findOne({"username": uname}, function (err, result) {
      if (err) throw err;

      //if the username is not found in the collection create a new user and log them in
      if (!result) {
          //saves the new user into the database
          db.collection('users').insertOne(newuser, function (err, result){
              if (err) throw err;
              console.log("user created! :)")
              req.session.loggedin = true;
              req.session.currentuser = uname;
              res.redirect('/UserAccount');
          })
          return;
        }
        // if the user is found then they will be brought back to the signup screen
        else{
          console.log("user already exists!")
          res.render('pages/SignUp')
        }
      }
  )
});

//function called when the user creates a quote
app.post('/insertquote', function(req, res){

  //creates a variable to pass all the contract information to the database
  var newquote = {
  "ContractName" : req.body.name,
  "Person" : req.body.job,
  "Weeks" : req.body.weeks,
  "FinalPrice" : req.body.price,
  "Author" : req.session.currentuser
  }

  //reads the contracts name from the body parser
  var quotename = req.body.name

  //checks if the quote with the same name exists
  db.collection('quotes').findOne({"ContractName" : quotename, "Author": req.session.currentuser}, function (err, result){
    if (err) throw err;

    //if no quote is found the quote is created and the user is redirected to the user account screen
    if (!result){
      db.collection('quotes').insertOne(newquote, function(err, result){
        if (err) throw err;
        console.log('quote created!')
        res.redirect('/UserAccount')
    
      })
    }
    //if the contracts name is already in the database redirect to the event builder
    else{
      console.log("contract name already taken")
      res.redirect('/QuoteBuilder')

    }
  })
});

//function called when the user deletes a contract
app.post('/deleteContract', function(req, res){

  //gets the contracts name
  var contractnm = req.body.name
  //gets the contracts author
  var auth = req.session.currentuser

  //deletes the contract
  db.collection('quotes').deleteOne( { "ContractName": contractnm, "Author": auth} )

  //reloads the users account
  res.redirect("/UserAccount")

});
