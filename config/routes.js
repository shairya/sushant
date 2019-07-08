var home = require('../app/controllers/home');
var scrape = require('../app/controllers/scrape');
var order = require('../app/controllers/order');
var log = require('../app/controllers/log');
var test = require('../app/controllers/test');
var maven = require('../app/controllers/mavenpush');

//you can include all your controllers

module.exports = function (app, passport) {

    // app.get('/', scrape.index, scrape.index);//home
    app.get('/pushorders', order.index, order.index);
    app.get('/log', log.index, log.index);
    app.get('/log/edit/:orderId/:logId', log.edit, log.edit);
    app.get('/scrape/secretwish', scrape.secretwish, scrape.secretwish);
    app.get('/scrape/gps', scrape.gps, scrape.gps);
    app.get('/scrape/jerado', scrape.jerado, scrape.jerado);
    app.get('/scrape/markmediums', scrape.markmediums, scrape.markmediums);
    app.get('/scrape/anscommerce', scrape.anscommerce, scrape.anscommerce);
    app.post('/log/update', log.update, log.update);
    
    
    app.get('/orders', maven.index, maven.index);
    app.get('/mavenpush/gps', order.gps, order.gps);
    app.get('/mavenpush/anscommerce', order.anscommerce, order.anscommerce);
    app.get('/mavenpush/jerado', order.jerado, order.jerado);
    app.get('/mavenpush/markmediums', order.markmediums, order.markmediums);//home
    app.get('/mavenpush/secretwish', order.secretwish, order.secretwish);//home
    app.get('/login', home.login);
    app.get('/signup', home.signup);

    app.get('/', home.loggedIn, home.home);//home
    app.get('/home', home.loggedIn, home.home);//home

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

}
