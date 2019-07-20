var request = require("request");
var ReturnModel = require('../models/return');
var constant = require('../../config/constants');
var logModel = require('../models/log');
var tenantCode = '';
var mavenLoginDomain = '';
var serverCookie = '';
var allData=[];
exports.index = async function(req, res, next){
    var currentYear = new Date().getFullYear();
    var currentMonth = ("0" + (new Date().getMonth() + 1)).slice(-2);
    var currentDate = new Date().getDate();
    var today = currentYear +'-'+ currentMonth + '-' + currentDate+' 00:00:00.000';
    
    var secretwishCount = 0;
    var gpsCount = 0;
    var jeradoCount = 0;
    var markmediumsCount = 0;
    var anscommerceCount = 0;
    await ReturnModel.countDocuments({Pushed_To_Server:null,Tenant_Code:'secretwish'})
    .then(secretwish => {
        ReturnModel.countDocuments({Pushed_To_Server:null,Tenant_Code:'grandpitstop2'})
        .then(gps => {
            ReturnModel.countDocuments({Pushed_To_Server:null,Tenant_Code:'jeradobrandsprivatelimited'})
                .then(jerado => {
                    ReturnModel.countDocuments({Pushed_To_Server:null,Tenant_Code:'markmediums'})
                        .then(markmediums => {
                            ReturnModel.countDocuments({Pushed_To_Server:null,Tenant_Code:'anscommerce'})
                                .then(anscommerce => {
                                    secretwishCount = secretwish;
                                    gpsCount = gps;
                                    jeradoCount = jerado;
                                    markmediumsCount = markmediums;
                                    anscommerceCount = anscommerce;
                                    res.render('return.ejs',{
                                        title:'Import/Export',
                                        secretwishCount:secretwishCount,
                                        gpsCount : gpsCount,
                                        jeradoCount : jeradoCount,
                                        markmediumsCount : markmediumsCount,
                                        anscommerceCount : anscommerceCount
                                    });
                                    return;
                                });
                            });     
                        });
                    });
                });   
}