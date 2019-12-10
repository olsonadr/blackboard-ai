
// Require stuff
var path        = require('path');
var express     = require('express');
var hb          = require('express-handlebars');
var bodyParser  = require('body-parser');
var fs          = require('fs');

// Set stuff
const publicDir    = path.join(__dirname, 'public');
const port	       = process.env.PORT || 3000;

// Server app stuff
var app	= express();
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: true }));

// Context for html rendering
var indexContext = {
    siteTitle:  "BLK_BOARD",
    logoSource: "/BLK_BOARD_logo.jpg",
    styles:      [{src: "/style.css"},
                  {src: "https://use.fontawesome.com/releases/v5.11.2/css/all.css"},
                  {src: "https://fonts.googleapis.com/css?family=Roboto|Roboto+Slab:100"}],
    scripts:     [{src: "/index.js"}, {src: "/canvas.js"}, {src: "/neural.js"},
                  {src: "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.0.0/dist/tf.min.js"}],
    initData:    "",
    initMessage: ""
};

// Middleware functions
app.use(express.static(publicDir));
app.post('/save', function(req, res, next) {
    console.log(`Saving data in ${req.body.fname}.json`)
    var newEntry = JSON.stringify({ name: req.body.fname, data: req.body.image });
    fs.writeFileSync(`${__dirname}/data/saved-states/${req.body.fname}.json`, newEntry);
    indexContext.initData = req.body.image;
    indexContext.initMessage = `Saved data as \"${req.body.fname}\".`;
    res.render('index', indexContext);
});
app.post('/load', function(req, res, next) {
    console.log(`Loading data in ${req.body.fname}.json`)
    if (fs.existsSync(`data/saved-states/${req.body.fname}.json`)) {
        var data = fs.readFileSync(`data/saved-states/${req.body.fname}.json`);
        let canvasData = JSON.parse(data);
        indexContext.initData = canvasData.data;
        indexContext.initMessage = `Loaded saved data \"${req.body.fname}\".`;
    } else {
        indexContext.initData = "";
        indexContext.initMessage = `No saved data \"${req.body.fname}\" exists.`;
    }
    res.render('index', indexContext);
});
app.get('/', function(req, res, next) {
    indexContext.initData = "";
    indexContext.initMessage = "";
    res.render('index', indexContext);
});
app.get('*', function(req, res, next) {
    indexContext.initData = "";
    indexContext.initMessage = "";
    res.render('404', indexContext);
});

// Listen on port
app.listen(port, function() {
  console.log(` ~=> Server is a go on port ${port}`);
});
