var home = require('../app/controllers/home');
var scrapeorder = require('../app/controllers/scrapeorder');
var order = require('../app/controllers/order');
var log = require('../app/controllers/log');
var returnslog = require('../app/controllers/returnslog');
var test = require('../app/controllers/test');
var maven = require('../app/controllers/mavenpush');
var returns = require ('../app/controllers/return');
var returnpush = require ('../app/controllers/returnpush');
var scrapereturn = require ('../app/controllers/scrapereturn');
var inventory = require ('../app/controllers/inventory');
var inventorysync = require ('../app/controllers/inventorysync');

//you can include all your controllers

module.exports = function (app, passport) {

    // app.get('/', scrape.index, scrape.index);//home
    app.get('/pushorders', order.index, order.index);
    app.get('/log', log.index, log.index);
    app.get('/log/deletesqllog', log.deletesqllog, log.deletesqllog);
    app.get('/log/deletealllog', log.deletealllog, log.deletealllog);
    app.get('/log/edit/:orderId/:logId', log.edit, log.edit);

    app.get('/returnslog', returnslog.index, returnslog.index);
    app.get('/returnslog/deletesqllog', returnslog.deletesqllog, returnslog.deletesqllog);
    app.get('/returnslog/deletealllog', returnslog.deletealllog, returnslog.deletealllog);
    
    app.get('/scrapereturn/secretwish', scrapereturn.secretwish, scrapereturn.secretwish);
    app.get('/scrapereturn/gps', scrapereturn.gps, scrapereturn.gps);
    app.get('/scrapereturn/jerado', scrapereturn.jerado, scrapereturn.jerado);
    app.get('/scrapereturn/markmediums', scrapereturn.markmediums, scrapereturn.markmediums);
    app.get('/scrapereturn/anscommerce', scrapereturn.anscommerce, scrapereturn.anscommerce);

    app.get('/scrapeorder/secretwish/', scrapeorder.secretwish, scrapeorder.secretwish);
    app.get('/scrapeorder/gps/', scrapeorder.gps, scrapeorder.gps);
    app.get('/scrapeorder/jerado/', scrapeorder.jerado, scrapeorder.jerado);
    app.get('/scrapeorder/markmediums/', scrapeorder.markmediums, scrapeorder.markmediums);
    app.get('/scrapeorder/anscommerce/', scrapeorder.anscommerce, scrapeorder.anscommerce);

    app.post('/log/update', log.update, log.update);

    app.get('/returns', returns.index, returns.index);
    app.get('/inventory', inventory.index, inventory.index);
    
    app.get('/inventory/secretwish', inventorysync.secretwish, inventorysync.secretwish);
    app.get('/inventory/gps', inventorysync.gps, inventorysync.gps);
    app.get('/inventory/markmediums', inventorysync.markmediums, inventorysync.markmediums);
    app.get('/inventory/jerado', inventorysync.jerado, inventorysync.jerado);
    app.get('/inventory/anscommerce', inventorysync.anscommerce, inventorysync.anscommerce);

    app.get('/orders', maven.index, maven.index);

    app.get('/mavenpush/gps', order.gps, order.gps);
    app.get('/mavenpush/anscommerce', order.anscommerce, order.anscommerce);
    app.get('/mavenpush/jerado', order.jerado, order.jerado);
    app.get('/mavenpush/markmediums', order.markmediums, order.markmediums);
    app.get('/mavenpush/secretwish', order.secretwish, order.secretwish);

    // returns push
    app.get('/maven/return/push/gps', returnpush.gps, returnpush.gps);
    app.get('/maven/return/push/anscommerce', returnpush.anscommerce, returnpush.anscommerce);
    app.get('/maven/return/push/jerado', returnpush.jerado, returnpush.jerado);
    app.get('/maven/return/push/markmediums', returnpush.markmediums, returnpush.markmediums);
    app.get('/maven/return/push/secretwish', returnpush.secretwish, returnpush.secretwish);

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
