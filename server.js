// Create the app
var express = require('express');
var app = express();

// Use EJS to render pages
var ejs = require('ejs');
app.set('views', './views');
app.engine('html', ejs.renderFile);

// Use the body parser for POST requests
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Use the cookie parser
var cookieParser = require('cookie-parser');
var cookieSecret = process.env.COOKIE_SECRET || "cookiemonsterlovecookies";
app.use(cookieParser(cookieSecret));

// Use express session
var expressSession = require('express-session');
var sessionSecret = process.env.SESSION_SECRET || "superdupersecret"
app.use(expressSession({
  resave: true,
  saveUninitialized: true,
  secret: sessionSecret,
}));

// Connect to mongodb and fail if unable to connect
// TODO: Move this to generic database module (?)
var MongoClient = require('mongodb').MongoClient;
var mongoURI = process.env.MONGOLAB_URI;
MongoClient.connect(mongoURI, {useNewUrlParser: true}, function(err, db){
  if(err){
    console.log("Unable to connect to MongoDB!!!");
    throw err;
  } else {
    console.log("Succesfully connected to MongoDB.");
  }
});

// Route blog requests to blog page
app.get('/blog', function(req, res){
  var blog = require("./modules/blog.js");
  var dateformat = require('dateformat');

  // Retreive the blog posts from the database
  blog.getBlogPosts(function(err, blogPosts){
      if(err){
        console.log(err);
        // TODO: Figure out what to send back in case of error
        res.status(500);
      }

      // Display the page with the posts
      res.render('blog.html', {blog: blog, blogPosts: blogPosts, dateformat: dateformat});
  });
});

// Route to the admin pages
app.get('/admin', function(req, res){
  if(req.session.adminUser){
    // Show the admin page
    res.render('admin.html', {session: req.session});
  } else {
    // Redirect to login
    res.redirect('/admin/login')
  }
});

// Show a login form for the admin access
app.get('/admin/login', function(req, res){
  // TODO: Create an actual page for this and display wrong user/pass error upon auth failure
  var response = '<form method="POST">' +
    'Username: <input type="text" name="username"><br>' +
    'Password: <input type="password" name="password"><br>' +
    '<input type="submit" value="Submit"></form>';
  if(req.session.adminUser){
    res.redirect('/admin');
  } else {
    res.type('html');
    res.send(response);
  }
});

// Handle post request for admin login
app.post('/admin/login', function(req, res){
  var admin = require("./modules/admin.js");
  admin.authenticateAdminUser(req.body.username, req.body.password, function(err, authResult){
    if(authResult){
      req.session.regenerate(function(){
        console.log("Admin user '%s' logged in.", req.body.username);
        req.session.adminUser = req.body.username;
        req.session.success = 'Authenticated as ' + req.body.username;
        res.redirect('/admin');
      });
    } else {
      req.session.regenerate(function(){
        console.log("Failed attempt to login admin user '%s.'", req.body.username );
        req.session.error = 'Authentication failed.';
        res.redirect('/admin');
      });
    }
  });
});

// Create admin logout capability as well
app.get('/admin/logout', function(req, res){
  var username = req.session.adminUser;
  req.session.destroy(function(){
    console.log("Admin user '%s' logged out.", username);
    res.redirect('/admin/login');
  });
});

// Route all other requests to coming soon page
app.get('*', function(req, res){
  res.render('coming_soon.html');
});

// Start the server
var port = process.env.PORT || 3000;
app.listen(port);
