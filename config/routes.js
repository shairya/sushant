var home = require('../app/controllers/home');
var scrape = require('../app/controllers/scrape');
var order = require('../app/controllers/order');

//you can include all your controllers

module.exports = function (app, passport) {

    app.get('/', scrape.index, scrape.index);//home
    app.get('/pushorders', order.index, order.index);
    app.get('/scrape', scrape.index, scrape.index);
    app.get('/push/gps', order.gps, order.gps);//home
    app.get('/push/anscommerce', order.anscommerce, order.anscommerce);//home
    app.get('/push/jerado', order.jerado, order.jerado);//home
    app.get('/push/markmediums', order.markmediums, order.markmediums);//home
    app.get('/push/secretwish', order.secretwish, order.secretwish);//home
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
