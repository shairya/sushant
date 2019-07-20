var request = require("request");
var ReturnModel = require('../models/return');
var constant = require('../../config/constants');
var logModel = require('../models/log');
var tenantCode = '';
var mavenLoginDomain = '';
var serverCookie = '';
var allData=[];
exports.anscommerce = async function(req, res, next){
        var id = 1;
        if(constant.uniCommerceProjects[id].pushOrders==true){
            tenantCode = constant.uniCommerceProjects[id].name;
            mavenLoginDomain = constant.uniCommerceProjects[id].mavenLoginDomain;
            console.log('call auth api for...........' + tenantCode);
            await sendAuthRequest();
        }else{
            console.log(tenantCode + 'not enable in config.....')
        }
    res.redirect('/returns');
    return;
}

exports.gps = async function(req, res, next){
    var id = 2;
    if(constant.uniCommerceProjects[id].pushOrders==true){
        tenantCode = constant.uniCommerceProjects[id].name;
        mavenLoginDomain = constant.uniCommerceProjects[id].mavenLoginDomain;
        console.log('call auth api for...........' + tenantCode);
        await sendAuthRequest();
    }else{
        console.log(tenantCode + 'not enable in config.....')
    }
    res.redirect('/returns');
    return;
}

exports.jerado = async function(req, res, next){
    var id = 3;
    if(constant.uniCommerceProjects[id].pushOrders==true){
        tenantCode = constant.uniCommerceProjects[id].name;
        mavenLoginDomain = constant.uniCommerceProjects[id].mavenLoginDomain;
        console.log('call auth api for...........' + tenantCode);
        await sendAuthRequest();
    }else{
        console.log(tenantCode + 'not enable in config.....')
    }
    res.redirect('/returns');
    return;
}

exports.markmediums = async function(req, res, next){
    var id = 4;
    if(constant.uniCommerceProjects[id].pushOrders==true){
        tenantCode = constant.uniCommerceProjects[id].name;
        mavenLoginDomain = constant.uniCommerceProjects[id].mavenLoginDomain;
        console.log('call auth api for...........' + tenantCode);
        await sendAuthRequest();
    }else{
        console.log(tenantCode + 'not enable in config.....')
    }
    res.redirect('/returns');
    return;
}

exports.secretwish = async function(req, res, next){
    var id = 5;
    if(constant.uniCommerceProjects[id].pushOrders==true){
        tenantCode = constant.uniCommerceProjects[id].name;
        mavenLoginDomain = constant.uniCommerceProjects[id].mavenLoginDomain;
        console.log('call auth api for...........' + tenantCode);
        await sendAuthRequest();
    }else{
        console.log(tenantCode + 'not enable in config.....')
    }
    res.redirect('/returns');
    return;
}


exports.index = async function(req, res, next)
{
    console.log('ahh haaaa....don\'t call me, i am not going to do anything for you........!');
    return;
}

sendAuthRequest = function(){
    console.log('auth call...........'+mavenLoginDomain)
    var options = { 
        method: 'POST',
        rejectUnauthorized: false, 
        url: 'https://'+mavenLoginDomain+'.gscmaven.com/api/auth/authservice/webapi/login/authenticate',
        headers: 
        { 
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'accept-encoding': 'gzip, deflate',
            'Host': mavenLoginDomain + '.gscmaven.com',
            'Cache-Control': 'no-cache',
            'Accept': '/',
            'Referer': 'https://'+mavenLoginDomain+'.gscmaven.com',
            'Content-Type': 'application/x-www-form-urlencoded' 
        },
        form: 
        { 
            email: constant.maven_auth_email,
            password: constant.maven_auth_password
        } 
    };
    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if (error) 
            {
                console.log(error)
                reject();
            }else{
                serverCookie = response.headers.cookie;
                getDataFromDB();
                resolve();
            }
        });
    });
}

getDataFromDB = async function(){
    if(serverCookie){
        console.log(tenantCode)
        await ReturnModel.find({Pushed_To_Server:null, Tenant_Code: tenantCode}).sort({
            Display_Order_Number: 1,Tenant_Code:1}).limit(50).exec(function(err, docs){
                console.log('records fetched: .........' + docs.length);
                if(docs.length>0){
                    prepareData(docs);
                }else{
                    console.log('no records found for ' + tenantCode);
                }
            }); 
    }else{
        console.log('authentication failed for ' + tenantCode+'..............!');
    }
}
/**
 * [11,22,22,33]
 * [11,11,22,33]
 * [11,22,33,44]
 * 
 */
prepareData = async function(data){
    allData=[];
    for( var i=0; i<data.length; i++ ){ 
        var order = {};
        order.returnSkus = [];
        var skus = data[i].Item_Type_SKUs.split(',');
        skus.sort();
        var prevItem = '';
        for(var j=0; j<skus.length; j++){
            if(prevItem==skus[j]){
                skuObject.skuQuantity = skuObject.skuQuantity + 1;
            }else{
                var skuObject = {};
                skuObject.skuCode = skus[j];
                skuObject.skuQuantity = 1;
            }
            if((j+1)==skus.length){
                prevItem = skus[j];
                order.returnSkus.push(skuObject);
            }else if(skus[j]!=skus[j+1]){
                prevItem = skus[j];
                order.returnSkus.push(skuObject);
            }
        }
        order.orderNo       = data[i].Order_Number;
        order.returnRef     = data[i].Reverse_Pickup_Number;
        order.reason        = data[i].Return_Reason;
        order.remarks       = data[i].Return_Reason;
        order.shippingOwner = data[i].Pickup_Provider;
        order.dropDate      = '';

        allData.push(order);
    }
    await sendFinalData(allData);
    console.log('total orders to send............' + (i));
}

async function sendFinalData(allData){
    let a=0;    
    if(allData.length){
        for(const row of allData){
            await sendData(row,a);
            a++;
        }
        console.log("Finished sending orders");
    }
}

sendData = function(postData){
    console.log('send to server..........' + postData.orderNo);
    console.log('request data....');
    console.log(postData)
    var logData = {
        module:'Return',
        objectId:postData.orderNo,
        requestData:JSON.stringify(postData),
        status:'pending',
        tenantCode: tenantCode
    }
    var log = new logModel(logData);
    log.save(function(err){
        if(err) throw err;
    });

    var options = { 
        method: 'POST',
        url: 'https://'+mavenLoginDomain+'.gscmaven.com/api/oms/omsservices/webapi/salereturn/create',
        headers: 
        { 
            'Cookie': serverCookie,
            'Referer': 'https://'+mavenLoginDomain+'.gscmaven.com',
            'Origin': 'https://'+mavenLoginDomain+'.gscmaven.com',
            'Content-Type': 'application/json' 
        },
        json: postData, 
        rejectUnauthorized: false
    };
    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if (error) 
            {
                console.log(error);
                reject();
            }else{
                if(body.errorCode==200){
                    logModel.findOneAndUpdate({
                        objectId:postData.orderNo,status:'pending',module:'Return'
                    },{$set:{status:"success", responseData:JSON.stringify(body)}},function(err, d) {
                        ReturnModel.update(
                            {Display_Order_Number:postData.orderNo}, 
                            { Pushed_To_Server: 1 }, 
                            { multi: true }, 
                            function(err, res) {
                                if (err) { 
                                    console.log(err);
                                } else { 
                                }
                            }
                        );
                    });
                }else if(body.errorCode==450){
                    logModel.findOneAndUpdate({
                        objectId:postData.orderNo,status:'pending',module:'Return'
                    },{$set:{status:"duplicate", responseData:JSON.stringify(body)}},function(err, d) {
                        ReturnModel.update(
                            {Display_Order_Code:postData.orderNo}, 
                            { Pushed_To_Server: 2 }, 
                            { multi: true }, 
                            function(err, res) { if (err) { console.log(err); } else { }}
                        );
                    });
                }else{
                    logModel.findOneAndUpdate({
                        objectId:postData.orderNo,status:'pending',module:'Return'
                    },{$set:{status:"failed", responseData:JSON.stringify(body)}},function(err, d) {});
                }
            }
            console.log(body);
            resolve();
        });
    });
}