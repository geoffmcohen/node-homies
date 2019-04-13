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
    var dbo = db.db();

    // Add the entry time if object has none
    if(!blogPost.entryTime) {
      blogPost.entryTime = Date.now();
    }

    // Check if the post has an image that needs to uploaded first
    if(blogPost.image_file){
      console.log("Attempting to upload image file '%s'...", blogPost.image_file);
      // TODO: We should probably add some real validation to make sure the image is legit
      // Upload the image first
      var cloudinary = require('cloudinary');
      cloudinary.v2.uploader.upload(blogPost.image_file, {folder: "blog"}, function(err, result){
        if(err){
          console.log("Image failed to upload");
          console.log(err);
          return callback(err, false);
        }

        // Delete the local temp image file
        fs = require('fs');
        fs.unlink(blogPost.image_file, function(err){
          console.log("Unable to remove file '%s'", blogPost.image_file);
          console.log(err);
        });

        // Get the image url
        blogPost.image_url = result.url;
        console.log("Uploaded blog image to '%s'", blogPost.image_url);

        // Remove the image_file element
        delete blogPost.image_file;

        // Now add the blog post
        dbo.collection("blog").insertOne(blogPost, function(err, res){
          if(err) {
            return callback(err, false);
          } else {
            console.log("Successfully inserted new blog post!");
            db.close();
            callback(err, true);
          }
        });
      });
    } else {
      // Add the blog post
      dbo.collection("blog").insertOne(blogPost, function(err, res){
        if(err) {
          return callback(err, false);
        } else {
          console.log("Successfully inserted new blog post!");
          db.close();
          callback(err, true);
        }
      });
    }
  });
}

// Function to retrieve blog posts
// TODO: Add paging as inputs to this function
exports.getBlogPosts = function(input, callback) {
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

        // Get paged data
        items = items.skip(input.postsPerPage * (input.page - 1)).limit(input.postsPerPage);

        // Convert the cursor to an array
        items.toArray(function(err, arr){
          // Create return JSON with the array and information about paging
          var ret = {blogPosts: arr, pageInfo: {currentPage: parseInt(input.page)}};

          // Perform a count to determine how many pages total
          coll.countDocuments(function(err, count){
            ret.pageInfo.pageCount = Math.ceil(count / input.postsPerPage);
            return callback(err, ret);
          });
        });
      });
    });
  });
}
