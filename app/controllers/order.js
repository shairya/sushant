var https = require('https');
var request = require("request");
const querystring = require('querystring');    
const fs = require('fs');
const puppeteer = require('puppeteer');
var OrderModel = require('../models/order');
var constant = require('../../config/constants');
exports.index = async function(req, res, next)
{
    await sendAuthRequest();
    res.send('are we done........?');
}

sendAuthRequest = async function(){
    console.log('lets call auth api first...........')
    var options = { method: 'POST',"rejectUnauthorized": false, 
    url: 'https://anssecretwish.gscmaven.com/api/auth/authservice/webapi/login/authenticate',
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
        'Content-Type': 'application/x-www-form-urlencoded' },
        form: 
        { 
            email: 'apiintegration@anssecretwish.com',
            password: 'abcd@1234' 
        } 
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
        check();
    });
}
check = async function(){
    await OrderModel.find({Pushed_To_Server:null}).sort({
        Display_Order_Code: 1}).limit(3).exec(function(err, docs){
            foo(docs)}); 
}


foo = async function(data){
    var previousOrderId = '';
    var p=0;
    for( var i=0; i<data.length; i++ ){
        if(previousOrderId!=data[i].Display_Order_Code){
            if(previousOrderId!=data[i].Display_Order_Code && p!=0)
            {
                sendData(order);
            }
            p=p+1;
            var order = {};
            order.orderItems = [];
            order.custDetails = {};
            previousOrderId = data[i].Display_Order_Code;

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
            order.custDetails.firstName                     = "";
            order.custDetails.lastName                      = "";
            order.custDetails.customerShippingNature        = "";
            order.custDetails.customerBillingNature         = "";
            order.custDetails.gstin                         = "";
            order.custDetails.companyName                   = "";
            order.custDetails.emailId                       = data[i].Notification_Email;
            order.custDetails.phoneNumber                   = data[i].Shipping_Address_Phone;
            order.custDetails.shippingAddressCode           = "";
            order.custDetails.shippingAddressLine1          = data[i].Shipping_Address_Line_1;
            order.custDetails.shippingAddressLine2          = data[i].Shipping_Address_Line_2;
            order.custDetails.shippingAddressLine3          = "";
            order.custDetails.shippingCity                  = data[i].Shipping_Address_City;
            order.custDetails.shippingDistrict              = "";
            order.custDetails.shippingState                 = data[i].Shipping_Address_State;
            order.custDetails.shippingPincode               = data[i].Shipping_Address_Pincode;
            order.custDetails.shippingCountry               = data[i].Shipping_Address_Country;
            order.custDetails.billingAddressCode            = "";
            order.custDetails.billingAddressSameAsShipping  ="",
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
        var item = {};
        item.orderItemId            = data[i].Sale_Order_Item_Code;
        item.sellerSkuId            = data[i].sellerSkuId;
        item.quantity               = 1;
        item.sellingPricePerItem    = data[i].Selling_Price;
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
        item.mrp                    = data[i].Selling_Price;
        order.orderItems.push(item);
        // 
        if((i+1)==data.length)
        sendData(order);
    }
    console.log('total orders............'+p);
}

updateRecord = async function(apiResponseData){
    OrderModel
}

sendData = async function(postData){
    console.log('send to server...................');

    var options = { 
        method: 'POST',
        url: 'https://anssecretwish.gscmaven.com/api/oms/omsservices/webapi/orders/create',
        rejectUnauthorized: false,
        json:true,
        headers: 
        { 
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'content-length': postData.length,
            'accept-encoding': 'gzip, deflate',
            'cookie': 'JSESSIONID=2BABE77BEAD60C31C4349BFA282DC608',
            'Host': 'anssecretwish.gscmaven.com',
            'Postman-Token': 'fe407c2a-4686-4e08-8337-470dc7b2b0c3,95bda705-fed3-4f90-aa10-d80d6ec164f5',
            'Cache-Control': 'no-cache',
            'Accept': '/',
            'User-Agent': 'PostmanRuntime/7.15.0',
            'Referer': 'https://anssecretwish.gscmaven.com',
            'Origin': 'https://anssecretwish.gscmaven.com',
            'Content-Type': 'application/json' },
            body: JSON.stringify(postData),
            json: true 
        };

        request(options, function (error, response, body) {
            console.log('success.....?????')
            if (error) console.log(error);
            console.log(body);
        });
    // -------------
    // request.post({
    //     "rejectUnauthorized": false,
    //     headers: 
    //     { 
    //         'cache-control': 'no-cache',
    //         'Connection': 'keep-alive',
    //         'content-length': Buffer.byteLength(JSON.stringify(postData)),
    //         'accept-encoding': 'gzip, deflate',
    //         'Host': 'anssecretwish.gscmaven.com',
    //         'Postman-Token': 'bcd22405-b1af-4352-a303-c8efa122df3d,0c6e18b7-934e-43c3-aefa-61c71d7c0b58',
    //         'Cache-Control': 'no-cache',
    //         'Accept': '/',
    //         'User-Agent': 'PostmanRuntime/7.15.0',
    //         'Referer': 'https://anssecretwish.gscmaven.com',
    //         'Origin': 'https://anssecretwish.gscmaven.com',
    //         'Content-Type': 'application/json' 
    //     },
    //     body:JSON.stringify(postData),
    //     url: 'https://anssecretwish.gscmaven.com/api/oms/omsservices/webapi/orders/createposttestserver.com',
    //     qs:    postData
    //     }, function(error, response, body){
    //         console.log(error)
    //         console.log('sssssssssssss.............')
    //         console.log(body);
    //     });
}