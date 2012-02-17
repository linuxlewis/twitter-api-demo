var express = require('express');

var twitter = require('ntwitter');

var twit = new twitter({
    consumer_key: '4KpJiyPgPjGBXR2vSHqXyg',
    consumer_secret: 'jWvN4ROLBNiOPuDNbiK4ByuFkueWCpC4uzr8tGTevA',
    access_token_key: '28822804-4AtwpOmpeTjOybV8Jjo2cj1rvH7PWAWxJwluQs6RZ',
    access_token_secret: 'GBmZYRHHf8S7hloCyS0c6fjUiavy4S0lNl4WLrPW2A'
});

var app = express.createServer();

var io = require('socket.io').listen(app);

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use('/assets',express.static(__dirname + '/assets'));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', { layout:false });
app.use(app.router);

var twitterID = '';

twit.verifyCredentials(function(err, data) {
    twitterID = data.id;
    console.log('INFO:Twitter ID set...'+twitterID);
    console.log(data);
});

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
   res.render('user'); 
   twit.getPublicTimeline(function(err, data){
        io.sockets.emit('tweet-public-timeline', data);
   });
   twit.getHomeTimeline(function(err, data){
       io.sockets.emit('tweet-home-timeline', data);
    });
   twit.getUserTimeline(function(err, data){
       io.sockets.emit('tweet-user-timeline', data);
   });
   twit.getMentions(function(err, data){
       io.sockets.emit('tweet-mentions', data);
   });
   twit.getRetweetedByMe(function(err, data){
       io.sockets.emit('tweet-retweet', data);
   });
   twit.getRetweetedToMe(function(err, data){
       io.sockets.emit('tweet-retweet-me', data);
    });
   twit.getRetweetsOfMe(function(err, data){
       io.sockets.emit('tweet-retweet-of-me',data);
    });

});

    

app.listen(1337);
