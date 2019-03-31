var express = require('express');
var ejs = require('ejs');
var port = process.env.PORT || 3000;

var app = express();
app.set('views', './views');
app.engine('html', ejs.renderFile);
app.listen(port);

app.get('*', function(req, res){
  app.render('coming_soon.html', function(err, renderedData){
      res.send(renderedData);
      if(err){
        console.log(err);
      }
  })
});
