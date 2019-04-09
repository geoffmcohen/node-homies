// Function used to insert a new post into the database
exports.insertBlogPost = function(blogPost, callback){
  console.log("Publishing blog post ''%s'...", blogPost.title);

  // Connect to the database
  var MongoClient = require('mongodb').MongoClient;
  var mongoURI = process.env.MONGOLAB_URI;
  MongoClient.connect(mongoURI, {useNewUrlParser: true}, function(err, db){
    // Callback with error if unable to connect
    if(err){
      console.log("Unable to connect to MongoDB!!!");
      return callback(err, false);
    }
    // Create the blog post object
    var dbo = db.db();

    if(!blogPost.entryTime) {
      blogPost.entryTime = Date.now();
    }

    // Add the blog post
    dbo.collection("blog").insertOne(blogPost, function(err, res){
      if(err) {
        return callback(err, false);
      } else {
        console.log("Successfully inerted new blog post!");
        db.close();
        callback(err, true);
      }
    });
  });
}

// Function to retrieve blog posts
// TODO: Add paging as inputs to this function
exports.getBlogPosts = function(callback) {
  // Connect to the database
  var MongoClient = require('mongodb').MongoClient;
  var mongoURI = process.env.MONGOLAB_URI;
  MongoClient.connect(mongoURI, {useNewUrlParser: true}, function(err, db){
    // Callback with error if unable to connect
    if(err){
      console.log("Unable to connect to MongoDB!!!");
      return callback(err, null);
    }
    // Get the collection
    var dbo = db.db();
    dbo.collection("blog", function(err, coll){
      if(err){
        console.log("Unable to get collection blog!!!");
        return callback(err, null);
      }
      // Find all records sorted last to first
      coll.find({}, {sort:{entryTime: -1}}, function(err, items){
        if(err){
          console.log("Unable to execute find on blog collection");
          return callback(err, null);
        }
        // Convert the cursor to an array and return
        items.toArray(function(err, arr){
          console.log("Retreived %d blog posts", arr.length);
          return callback(err, arr);
        });
      });
    });
  });
}
