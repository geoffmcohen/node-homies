var express = require('express');
var ejs = require('ejs');
var port = process.env.PORT || 3000;

var app = express();
app.set('views', './views');
app.engine('html', ejs.renderFile);
app.listen(port);

// Connect to mongodb
var MongoClient = require('mongodb').MongoClient;
var mongoURI = process.env.MONGOLAB_URI;
MongoClient.connect(mongoURI, {useNewUrlParser: true}, function(err, db){
  if(err){
    console.log("Unable to connect to MongoDB!!!");
    console.log(err);
  } else {
    console.log("Succesfully connected to MongoDB.");
  }
});

// Route all requests to coming soon page
app.get('*', function(req, res){
  app.render('coming_soon.html', function(err, renderedData){
      res.send(renderedData);
      if(err){
        console.log(err);
      }
  })
});
