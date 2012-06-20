
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , underscore = require('underscore');

var app = module.exports = express.createServer();

var responseSet = [
  {
    id: 1,
    type: "text",
    back: null, 
    next: 2, 
    location: "Pizza Palace", 
    html:"<em>Here is the start of the text...</em><p>Here is the middle of the text, posing a question. <strong>How</strong> will this page end?</p><p>Turns out... here.</p>"
  },{
    id: 2,
    type: "poll", 
    back: 1,
    next: 3, 
    location: "School", 
    question:"Is this a question?", 
    answers:["Yes", "No", "Maybe"]
  },{
    id: 3,
    type: "image", 
    back: 2,
    next: null, 
    location: "Newspaper", 
    url: "http://haileerustad.files.wordpress.com/2011/08/high-five.jpg", 
    html: "<strong>Thank you</strong> for watching my presentation today!"
  }
]

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/demo', function(req, res){
  res.sendfile("combo.html");
});

app.get('/demo/*', function(req, res){
  //res.sendfile("combo.html");
});

app.get('/api/:id', function(req, res){
  console.log("Requesting page", req.params.id);
  res.json(underscore.find(responseSet, function(mem){ return mem.id === parseInt(req.params.id) }));
})

app.get('/api', function(req, res){
  console.log("Requesting all pages");
  res.json(responseSet);
})

app.get('')

app.get('/*', function(req, res){
  res.sendfile(req.params);
});
app.get('/', routes.index);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
