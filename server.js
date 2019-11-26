
// Require stuff
var path    = require('path');
var express = require('express');
var hb      = require('express-handlebars');
var fs      = require('fs');

// Set stuff
const publicDir    = path.join(__dirname, 'public');
const port	       = process.env.PORT || 3000;

// Server app stuff
var app	= express();
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

// Context for html rendering
var indexContext = {
  siteTitle:  "Playground",
  logoSource: "/benny.jpg",
  styles:     [{src: "/style.css"},
               {src: "https://use.fontawesome.com/releases/v5.11.2/css/all.css"},
               {src: "https://fonts.googleapis.com/css?family=Roboto|Roboto+Slab:100"}],
  scripts:    [{src: "/index.js"}, {src: "/canvas.js"}, {src: "/neural.js"},
               {src: "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.0.0/dist/tf.min.js"}]
};

// Middleware functions
app.use(express.static(publicDir));
app.get('/', function(req, res, next) { res.render('index', indexContext) });
app.get('*', function(req, res, next) { res.render('404', indexContext)   });

// Listen on port
app.listen(port, function() {
  console.log(` ~=> Server is a go on port ${port}`);
});
