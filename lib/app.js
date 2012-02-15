var express = require('express');

var app = express.createServer();

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use('/assets',express.static(__dirname + '/assets'));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', { layout:false });
app.use(app.router);

//pages
app.get('/', function(req, res){
    res.render('index');
});

//twitter login
//log into twitter page
app.get('/session/new', function(req, res){
    res.render('session/new');
});
//post endpoint for twitter auth
app.post('/session', function(req, res){
    //something with oauth
    //redirect
});

//user page after log in -- main app page
app.get('/user', function(req, res){
    
});

app.listen(1337);
