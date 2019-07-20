var OrderModel = require('../models/order');
var LogModel = require('../models/log');

exports.index = async function(req, res, next){
    var recordType = req.query.recordType;

    var logData = '';
    if(recordType=='yes'){
        var q = {module:'Return',edited:'yes',responseData:{'$regex':'"errorCode":400'}};
    }else if(recordType=='no'){
        var q = {module:'Return',edited:{'$ne': 'yes'},responseData:{'$regex':'"errorCode":400'}};
    }else{
        var q = {module:'Return',responseData:{'$regex':'"errorCode":400'}};
    }
    await LogModel.find(q).sort({
        createdAt:1}).exec(function(err, docs){
        if(docs!=='undefined'){
            logData = (docs);
            res.render('log/return.ejs', {
                logData: logData,
                recordType:recordType,
                title:'List',
                msg:''
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
                res.render('log/return-edit.ejs', {
                    logData: doc,
                    title:'List',
                    logId: logId,
                    found: true
                });
                return;
            }else{
                res.render('log/return-edit.ejs', {
                    title:'List',
                    logId: logId,
                    found: false
                });
            }
        }else{
            res.render('log/return-edit.ejs', {
                title:'List',
                found: false
            });
            return;
        }
    }); 
}

exports.deletesqllog = async function(req, res, next){
    LogModel.deleteMany({module:'Return',responseData:{'$regex':'could not execute statement'}}, function(err) {
        if(err) {
            console.log(err);
            res.redirect('/returnslog');
            return;
        }else{
            res.redirect('/returnslog');
            return;
        }
    }); 
}

exports.deletealllog = async function(req, res, next){
    LogModel.deleteMany({module:'Return'}, function(err) {
        if(err) {
            console.log(err);
            res.redirect('/returnslog');
            return;
        }else{
            res.redirect('/returnslog');
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
    res.redirect('/returnslog');
    return;   
}