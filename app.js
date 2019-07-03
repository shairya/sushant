var express = require('express');
const cron = require("node-cron");
var url = require('url') ;
var request = require('request');
// console.log(url.URL
var app = express();
var multer = require('multer')
var constants = require('constants');
var constant = require('./config/constants');


var port = process.env.PORT || constant.PORT || 8042;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var path = require('path');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
// var dateFormat = require('dateformat');
// var now = new Date();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


/***************Mongodb configuratrion********************/
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
//configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database


require('./config/passport')(passport); // pass passport for configuration

//set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
//app.use(bodyParser()); // get information from html forms

//view engine setup
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');
//app.set('view engine', 'ejs'); // set up ejs for templating


//required for passport
//app.use(session({ secret: 'iloveyoudear...' })); // session secret

// app.use(session({
//     secret: 'I Love India...',
//     resave: true,
//     saveUninitialized: true
// }));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./config/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

cron.schedule("2 * * * *",()=> {
    console.log("download data from unicommerce");
    // request( constant.host+'/scrape', function (error, response, body) {
    //    if (error){
    //     console.log('error.....'+error)
    //    }
    //    else{
    //       console.log(body) // Print the google web page.
    //    }
    // });
});

cron.schedule("2 * * * *",()=> {
    console.log("push data to maven");
    // request( constant.host+'/pushorders', function (error, response, body) {
    //    if (error){
    //     console.log('error.....'+error)
    //    }
    //    else{
    //       console.log(body) // Print the google web page.
    //    }
    // });
});

//launch ======================================================================
var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
 });
//console.log('The magic happens on port ' + port);

//catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404).render('404', {title: "Sorry, page not found", session: req.sessionbo});
});

app.use(function (req, res, next) {
    res.status(500).render('404', {title: "Sorry, page not found"});
});
exports = module.exports = app;