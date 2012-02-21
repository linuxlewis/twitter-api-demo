//system
var sys = require('util');
//express web framework
var express = require('express');

//node twitter module
var twitter = require('ntwitter');

//OAuth module
var OAuth = require('oauth').OAuth;

//querystring module
var querystring = require('querystring');


//connect-mongo for session store
var MongoStore = require('connect-mongo');

//configuration object 
var settings = {
    db:{
        db:'twitter-demo'
    },
    secret:'yomotherfuckerrrrr',
    twitter: {
        request_token_url: 'https://api.twitter.com/oauth/request_token',
        //request_token_url: 'http://localhost:3000',
        access_token_url: 'https://api.twitter.com/oauth/access_token',
        authenticate_url: 'https://api.twitter.com/oauth/authenticate',
        authorize_url: 'https://api.twitter.com/oauth/authorize',
        consumer_key: '4KpJiyPgPjGBXR2vSHqXyg',
        consumer_secret: 'jWvN4ROLBNiOPuDNbiK4ByuFkueWCpC4uzr8tGTevA'
    }
};

//test object
var twit = new twitter({
    consumer_key: '4KpJiyPgPjGBXR2vSHqXyg',
    consumer_secret: 'jWvN4ROLBNiOPuDNbiK4ByuFkueWCpC4uzr8tGTevA',
    access_token_key: '28822804-4AtwpOmpeTjOybV8Jjo2cj1rvH7PWAWxJwluQs6RZ',
    access_token_secret: 'GBmZYRHHf8S7hloCyS0c6fjUiavy4S0lNl4WLrPW2A'
});

var app = express.createServer();

//socket.io module
var io = require('socket.io').listen(app);


app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use('/assets',express.static(__dirname + '/assets'));
/* FIXME
 * app.use(express.session({
    secret: settings.secret,
    maxAge: new Date(Date.now() + 3600000),
    store: new MongoStore(settings.db)
    })
);*/

app.use(express.cookieParser());
app.use(express.session({ secret:settings.secret }));
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
    var oa = new OAuth(settings.twitter.request_token_url,
                        settings.twitter.access_token_url,
                        settings.twitter.consumer_key,
                        settings.twitter.consumer_secret,
                        "1.0A",
                        "http://localhost:1337/session",
                        "HMAC-SHA1");
    oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
        if(error){
            console.log('ERROR:');
            console.log(error);
        }
        else{
            req.session.oa = oa;
            req.session.oauth_token = oauth_token;
            req.session.oauth_token_secret = oauth_token_secret;
            
            res.redirect(settings.twitter.authenticate_url+"?oauth_token="+req.session.oauth_token);
        }
    });
});

//post endpoint for twitter auth
app.get('/session', function(req, res){
    var oa = new OAuth(req.session.oa._requestUrl,
                        req.session.oa._accessUrl,
                        req.session.oa._consumerKey,
                        req.session.oa._consumerSecret,
                        req.session.oa._version,
                        req.session.oa._authorize_callback,
                        req.session.oa._signatureMethod);
    oa.getOAuthAccessToken(
        req.session.oauth_token,
        req.session.oauth_token_secret,
        req.param('oauth_verifier'),
        function(error, oauth_access_token, oauth_access_token_secret, results2){
            if(error){
                console.log('ERROR:');
                console.log(error);
            }
            else{
                req.session.oauth_access_token = oauth_access_token;
                req.session.oauth_access_token_secret = oauth_access_token_secret;
                req.session.user_id = req.user_id;
                req.session.screen_name = req.screen_name;

                res.redirect('/user');
            }
    });
});

//user page after log in -- main app page
app.get('/user', function(req, res){
    if(req.session.oauth_access_token != null){
    twit = new twitter({
        consumer_key: settings.twitter.consumer_key,
        consumer_secret: settings.twitter.consumer_secret,
        access_token_key:req.session.oauth_access_token,
        access_token_secret:req.session.oauth_access_token_secret
    });
   }
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
