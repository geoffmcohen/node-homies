var express = require('express');
var ejs = require('ejs');
var port = process.env.PORT || 3000;

var app = express();
app.set('views', './views');
app.engine('html', ejs.renderFile);
app.listen(port);

// Testing stuff here - DELETEME
// var blog = require("./modules/blog.js");
// // blog.insertBlogPost("Test Post", "This is a test blog post about nothing.");
//
// // Need to do a callback here somehow
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
// FIXME: This was working but not now???
app.get('/blog', function(req, res){
    app.render('blog.html', function(err, renderedData){
      if(err){
        res.send(renderedData);
        console.log(err);
      }
    });
});

// Route all other requests to coming soon page
app.get('*', function(req, res){
  app.render('coming_soon.html', function(err, renderedData){
      res.send(renderedData);
      if(err){
        console.log(err);
      }
  })
});
