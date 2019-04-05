// Function used to insert a new post into the database
exports.insertBlogPost = function(title, body, imgLink = null, entryTime = Date.now()){
  console.log("Publishing blog post ''%s'...", title);

  // Connect to the database
  var MongoClient = require('mongodb').MongoClient;
  var mongoURI = process.env.MONGOLAB_URI;
  MongoClient.connect(mongoURI, {useNewUrlParser: true}, function(err, db){
    // Throw error if unable to connect
    if(err){
      console.log("Unable to connect to MongoDB!!!");
      throw err;

    }
    // Create the blog post object
    var dbo = db.db();
    var blogPost = {title: title, body: body, entryTime: entryTime};
    if(imgLink != null){
      blogPost.imgLink = imgLink;
    }

    // Add the blog post
    dbo.collection("blog").insertOne(blogPost, function(err, res){
      if(err) throw err;
      console.log("Successfully inerted new blog post!");
      db.close();
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
    // Throw error if unable to connect
    if(err){
      console.log("Unable to connect to MongoDB!!!");
      throw err;
    }
    // Get the collection
    var dbo = db.db();
    dbo.collection("blog", function(err, coll){
      if(err){
        console.log("Unable to get collection blog!!!");
        throw err;
      }
      // Find all records sorted last to first
      coll.find({}, {sort:{entryTime: -1}}, function(err, items){
        if(err){
          throw err;
          console.log("Unable to execute find on blog collection");
        }
        // Convert the cursor to an array and return
        items.toArray(function(err, arr){
          console.log("Retreived %d blog posts", arr.length);
          callback(err, arr);
        });
      });
    });
  });
}

//
exports.formatBodyText = function(bodyText){
  var body = bodyText;
  body = body.replace('<p>', '%><p><%');
  return body;
}
