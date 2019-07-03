var https = require('https');
var request = require("request");
const querystring = require('querystring');    
const fs = require('fs');
const puppeteer = require('puppeteer');
var OrderModel = require('../models/order');
var constant = require('../../config/constants');
var logModel = require('../models/log');

var serverCookie = '';
exports.index = async function(req, res, next)
{
    await sendAuthRequest();
    res.send('are we done........?');
    return;
}

sendAuthRequest = async function(){
    console.log('lets call auth api first...........')
    var options = { 
        method: 'POST',
        rejectUnauthorized: false, 
        url: constant.maven_url + '/api/auth/authservice/webapi/login/authenticate',
        headers: 
        { 
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'content-length': '61',
            'accept-encoding': 'gzip, deflate',
            'Host': 'anssecretwish.gscmaven.com',
            'Postman-Token': 'bcd22405-b1af-4352-a303-c8efa122df3d,0c6e18b7-934e-43c3-aefa-61c71d7c0b58',
            'Cache-Control': 'no-cache',
            'Accept': '/',
            'User-Agent': 'PostmanRuntime/7.15.0',
            'Referer': 'https://anssecretwish.gscmaven.com',
            'Content-Type': 'application/x-www-form-urlencoded' 
        },
        form: 
        { 
            email: constant.maven_auth_email,
            password: constant.maven_auth_password
        } 
    };

    request(options, function (error, response, body) {
        if (error) 
        {
            console.log(error)
        }else{
            serverCookie = response.headers.cookie;
            getDataFromDB();
        }
    });
}

getDataFromDB = async function(){
    if(serverCookie){
    await OrderModel.find({Pushed_To_Server:null}).sort({
        Display_Order_Code: 1}).exec(function(err, docs){
            console.log('records fetched: .........'+docs.length);
            console.log(docs);
            // prepareData(docs)
        }); 
    }else{
        console.log('authentication failed..............!');
    }
}

prepareData = async function(data){
    var previousOrderId = '';
    var previousItemId = '';
    var p=0;
    for( var i=0; i<data.length; i++ ){
        if(previousOrderId!=data[i].Display_Order_Code){
            var name = data[i].Shipping_Address_Name;

            var customerName    = name ? name.split(' ') : [];
            if((customerName[0].length && customerName[0].length<3) ||(customerName[1] && (customerName[1].length && customerName[1].length<3))){
                customerName[0] = name.replace(/ /g,"_");
                customerName[1] = name.replace(/ /g,"_");
                customerName[0] = customerName[0].replace(/[^\w\s]/gi, '');
                customerName[1] = customerName[1].replace(/[^\w\s]/gi, '');
            }
            if(previousOrderId != data[i].Display_Order_Code && p!=0)
            {
                sendData(order);
            }
            previousOrderId     = data[i].Display_Order_Code;
            p=p+1;
            var order = {};
            order.orderItems = [];
            order.custDetails = {};

            order.orderId               = data[i].Display_Order_Code;
            order.recipientFirstName    = "";
            order.recipientLastName     = "";
            order.paymentType           = "";
            order.shippingDate          = "";
            order.deliveryDate          = "";
            order.shippingService       = "";
            order.remarks               = null;
            order.warehouseName         = "";
            order.holdDispatch          = 0;

            // customer details
            order.custDetails.customerCode = null;
            order.custDetails.firstName                     = customerName[0] ? customerName[0].replace(/[^\w\s]/gi, '') : '';
            order.custDetails.lastName                      = customerName[1] ? customerName[1].replace(/[^\w\s]/gi, '') : '';
            order.custDetails.customerShippingNature        = "";
            order.custDetails.customerBillingNature         = "";
            order.custDetails.gstin                         = "";
            order.custDetails.companyName                   = "";
            order.custDetails.emailId                       = "";
            order.custDetails.phoneNumber                   = data[i].Shipping_Address_Phone;
            order.custDetails.shippingAddressCode           = data[i].Shipping_Address_Pincode;
            order.custDetails.shippingAddressLine1          = data[i].Shipping_Address_Line_1;
            order.custDetails.shippingAddressLine2          = data[i].Shipping_Address_Line_2;
            order.custDetails.shippingAddressLine3          = "";
            order.custDetails.shippingCity                  = data[i].Shipping_Address_City;
            order.custDetails.shippingDistrict              = data[i].Shipping_Address_City;
            order.custDetails.shippingState                 = data[i].Shipping_Address_State;
            order.custDetails.shippingPincode               = data[i].Shipping_Address_Pincode;
            order.custDetails.shippingCountry               = data[i].Shipping_Address_Country;
            order.custDetails.billingAddressCode            = "";
            order.custDetails.billingAddressSameAsShipping  = "Yes",
            order.custDetails.billingAddressLine1           = data[i].Billing_Address_Line_1;
            order.custDetails.billingAddressLine2           = data[i].Billing_Address_Line_2;
            order.custDetails.billingAddressLine3           = "";
            order.custDetails.billingCity                   = data[i].Billing_Address_City;
            order.custDetails.billingDistrict               = "";
            order.custDetails.billingState                  = data[i].Billing_Address_State;
            order.custDetails.billingPincode                = data[i].Billing_Address_Pincode;
            order.custDetails.billingCountry                = data[i].Billing_Address_Country;
            order.custDetails.billingGstin                  = data[i].Customer_GSTIN;
            order.custDetails.isPrimaryShippingAddress      = "";
            order.custDetails.isPrimaryBillingAddress       = "";
        }

        if(previousItemId==data[i].Item_SKU_Code){
            item.quantity               = parseInt(item.quantity) + 1;
            item.sellingPricePerItem    = parseInt(item.sellingPricePerItem) + parseInt(data[i].Selling_Price);
        }else{
            var item = {};
            item.quantity               = 0;
            item.sellingPricePerItem    = 0;
            item.quantity               = 1;
            item.sellingPricePerItem    = data[i].Selling_Price;
            item.orderItemId            = data[i].Sale_Order_Item_Code;
            item.sellerSkuId            = data[i].Item_SKU_Code;
            
            item.itemTax                = data[i].Tax_Value;
            item.itemShippingAmount     = null;
            item.itemShippingTax        = null;
            item.itemLoadingAmount      = null;
            item.itemLoadingTax         = null;
            item.giftWrapPrice          = data[i].Gift_Wrap_Charges;
            item.giftWrapTax            = null;
            item.giftWrapLabel          = null;
            item.giftMessageText        = data[i].Gift_Message;
            item.batch                  = "";
            item.mrp                    = "";
            order.orderItems.push(item);
        }
        previousItemId=data[i].Item_SKU_Code;
        
        if((i+1)==data.length){
            sendData(order);
        }
    }
    console.log('total orders............'+p);
}

sendData = async function(postData){
    console.log('send to server...................');
    
    var logData = {
        module:'Order',
        objectId:postData.orderId,
        requestData:JSON.stringify(postData),
        status:'pending'
    }
    var log = new logModel(logData);
    log.save(function(err){
        if(err) throw err;
    });

    var options = { 
        method: 'POST',
        url: constant.maven_url + '/api/oms/omsservices/webapi/orders/create',
        headers: 
        { 
            'Cookie': serverCookie,
            'Referer': 'https://anssecretwish.gscmaven.com',
            'Origin': 'https://anssecretwish.gscmaven.com',
            'Content-Type': 'application/json' 
        },
        json: postData, 
        rejectUnauthorized: false
    };
    
    request(options, function (error, response, body) {
        console.log('success.....?????')
        if (error) 
        {
            console.log(error);
        }else{
            console.log(postData.orderId)
            if(body.errorCode==200){
                logModel.findOneAndUpdate({
                    objectId:postData.orderId,status:'pending'
                },{$set:{status:"success", responseData:JSON.stringify(body)}},function(err, d) {
                    OrderModel.findOneAndUpdate({
                        Display_Order_Code:postData.orderId,
                    },{$set:{Pushed_To_Server:1}},function(err, d) {});
                });
            }else if(body.errorCode==450){
                logModel.findOneAndUpdate({
                    objectId:postData.orderId,status:'pending'
                },{$set:{status:"duplicate", responseData:JSON.stringify(body)}},function(err, d) {
                    OrderModel.findOneAndUpdate({
                        Display_Order_Code:postData.orderId,
                    },{$set:{Pushed_To_Server:2}},function(err, d) {});
                });
            }else{
                logModel.findOneAndUpdate({
                    objectId:postData.orderId,status:'pending'
                },{$set:{status:"failed", responseData:JSON.stringify(body)}},function(err, d) {});
            }
        }
        console.log(body);
    });
}