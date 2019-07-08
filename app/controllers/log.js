var request = require("request");
var OrderModel = require('../models/order');
var constant = require('../../config/constants');
var LogModel = require('../models/log');
var tenantCode = '';
var mavenLoginDomain = '';
var serverCookie = '';

exports.index = async function(req, res, next){
    var recordType = req.query.recordType;
    var currentYear = new Date().getFullYear();
    var currentMonth = ("0" + (new Date().getMonth() + 1)).slice(-2);
    var currentDate = new Date().getDate();
    var today = currentYear +'-'+ currentMonth + '-' + currentDate+' 00:00:00.000';
    var logData = '';
    if(recordType=='yes'){
        var q = {edited:'yes',responseData:{'$regex':'"errorCode":400'}, createdAt:{'$gte': new Date(today)}};
    }else if(recordType=='no'){
        var q = {edited:{'$ne': 'yes'},responseData:{'$regex':'"errorCode":400'}, createdAt:{'$gte': new Date(today)}};
    }else{
        var q = {responseData:{'$regex':'"errorCode":400'}, createdAt:{'$gte': new Date(today)}};
    }
    await LogModel.find(q).sort({
        createdAt:1}).exec(function(err, docs){
        if(docs!=='undefined'){
            logData = (docs);
            res.render('log/index.ejs', {
                logData: logData,
                recordType:recordType,
                title:'List'
            });
            return;
        }
    }); 
}

exports.edit = async function(req, res, next){
    var orderId = req.params.orderId;
    var logId = req.params.logId;
    await OrderModel.find({Display_Order_Code:orderId}).limit(1).exec(function(err, doc){
        if(!err){
            if(doc!=='undefined'){
                res.render('log/edit.ejs', {
                    logData: doc,
                    title:'List',
                    logId: logId,
                    found: true
                });
                return;
            }else{
                res.render('log/edit.ejs', {
                    title:'List',
                    logId: logId,
                    found: false
                });
            }
        }else{
            res.render('log/edit.ejs', {
                title:'List',
                found: false
            });
            return;
        }
    }); 
}

exports.update = async function(req, res, next){
    var logId = req.body.logId;
    delete req.body['logId'];
    await OrderModel.updateOne(
        {_id:req.body._id}, 
        req.body, 
        { multi: false }, 
        function(err, res) {
            if (err) { 
            } else { 
                LogModel.updateOne(
                    {_id:logId},
                    {edited:'yes'},
                    {multi:false},
                    function(err, res) {
                        if (err) { 
                            console.log(err);
                        } else { 
                            
                        }
                    }
                )
            }
        }
    );
    res.redirect('/log');
    return;
    
    
}