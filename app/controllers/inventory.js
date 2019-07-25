
var LogModel = require('../models/log');
var constant = require('../../config/constants');

exports.log = async function(req, res, next){
    LogModel.find({module:'InventorySync', status:{'$ne':'success'}})
    .then(data => {
        
        res.render('inventory/log.ejs',{
            title:'Inventory Error Log',
            data:data
        });
        return;
    });
}
exports.index = async function(req, res, next){
    
    var secretwishCount = 0;
    var gpsCount = 0;
    var jeradoCount = 0;
    var markmediumsCount = 0;
    var anscommerceCount = 0;
    await LogModel.countDocuments({module:'InventorySync',tenantCode:'secretwish'})
    .then(secretwish => {
        LogModel.countDocuments({module:'InventorySync',tenantCode:'grandpitstop2'})
        .then(gps => {
            LogModel.countDocuments({module:'InventorySync',tenantCode:'jeradobrandsprivatelimited'})
                .then(jerado => {
                    LogModel.countDocuments({module:'InventorySync',tenantCode:'markmediums'})
                        .then(markmediums => {
                            LogModel.countDocuments({module:'InventorySync',tenantCode:'anscommerce'})
                                .then(anscommerce => {
                                    secretwishCount = secretwish;
                                    gpsCount = gps;
                                    jeradoCount = jerado;
                                    markmediumsCount = markmediums;
                                    anscommerceCount = anscommerce;
                                    res.render('inventory/index.ejs',{
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