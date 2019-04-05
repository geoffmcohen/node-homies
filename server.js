var express = require('express');
var ejs = require('ejs');
var port = process.env.PORT || 3000;

var app = express();
app.set('views', './views');
app.engine('html', ejs.renderFile);
app.listen(port);

// Testing stuff here - DELETEME
// var blog = require("./modules/blog.js");
// blog.insertBlogPost("Test Post 2", "This is a second blog post.");
// blog.getBlogPosts(function(err, blogPosts){
//   console.log(blogPosts);
// });

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

// Route all other requests to coming soon page
app.get('*', function(req, res){
  res.render('coming_soon.html');
});
