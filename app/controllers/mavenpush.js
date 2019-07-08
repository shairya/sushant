var request = require("request");
var OrderModel = require('../models/order');
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
    await OrderModel.countDocuments({Pushed_To_Server:null,Tenant_Code:'secretwish',Import_Date:{'$gte':new Date(today)}})
    .then(secretwish => {
        OrderModel.countDocuments({Pushed_To_Server:null,Tenant_Code:'grandpitspot2',Import_Date:{'$gte':new Date(today)}})
        .then(gps => {
        OrderModel.countDocuments({Pushed_To_Server:null,Tenant_Code:'jeradobrandsprivatelimited',Import_Date:{'$gte':new Date(today)}})
            .then(jerado => {
                OrderModel.countDocuments({Pushed_To_Server:null,Tenant_Code:'markmediums',Import_Date:{'$gte':new Date(today)}})
                .then(markmediums => {
                    OrderModel.countDocuments({Pushed_To_Server:null,Tenant_Code:'anscommerce',Import_Date:{'$gte':new Date(today)}})
                    .then(anscommerce => {
                        secretwishCount = secretwish;
                        gpsCount = gps;
                        jeradoCount = jerado;
                        markmediumsCount = markmediums;
                        anscommerceCount = anscommerce;
                        res.render('maven.ejs',{
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