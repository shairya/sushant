var request = require("request");
var OrderModel = require('../models/order');
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
    res.redirect('/orders');
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
    res.redirect('/orders');
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
    res.redirect('/orders');
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
    res.redirect('/orders');
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
    res.redirect('/orders');
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
        await OrderModel.find({Pushed_To_Server:null, Tenant_Code: tenantCode}).sort({
            Display_Order_Code: 1,Item_SKU_Code:1,Tenant_Code:1}).exec(function(err, docs){
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

getName = function(name){
    var customerName = [];
    name = name.trim();
    if(name.indexOf(' ') >= 0)
    {
        var nameArray = name.split(' ');
        if(nameArray[0].length < 3 || nameArray[1].length < 3 ){
            customerName[0] = name.replace(/ /g,"_");
            customerName[1] = name.replace(/ /g,"_");
        }else{
            customerName[0] = nameArray[0];
            customerName[1] = nameArray[1];
        }
    }else{
        customerName[0] = name;
        customerName[1] = '';
    }
    
    return customerName;
}

prepareData = async function(data){
    var previousOrderId = '';
    var previousItemId = '';
    var p=0;
    allData=[];
    for( var i=0; i<data.length; i++ ){
        if(previousOrderId!=data[i].Display_Order_Code){
            var customerName = await getName(data[i].Shipping_Address_Name);
            
            if(previousOrderId != data[i].Display_Order_Code && p!=0)
            {
                console.log('lets send it to server now.........')
                allData.push(order);
            }
          
            var shippingCity = data[i].Shipping_Address_City.replace(/[&\/\\#,‘’+()$~%.'":*?<>{}\n]/g,' ');
            if(shippingCity.length>45){
                shippingCity = shippingCity.substring(0,44);
            }
            var shippingAddress1 = data[i].Shipping_Address_Line_1.replace(/[&\/\\#,‘’+()$~%.'":*?_<>{}\n]/g,' ');
            var shippingAddress2 = data[i].Shipping_Address_Line_2.replace(/[&\/\\#,‘’+()$~%.''":*?_<>{}\n]/g,' ');

            var billingCity = data[i].Billing_Address_City.replace(/[^a-zA-Z0-9]/g,'_');
            var billingAddress1 = data[i].Billing_Address_Line_1.replace(/[&\/\\#,+‘’()$~%.'":*?<>_{}\n]/g,' ');
            var billingAddress2 = data[i].Billing_Address_Line_2.replace(/[&\/\\#,+‘’()$~%.'":*?<>_{}\n]/g,' ');
            if(data[i].Shipping_Address_Phone.indexOf('X') >= 0 || data[i].Shipping_Address_Phone.indexOf(' ') >= 0 || data[i].Shipping_Address_Phone.length != 10){
                phoneNumber = '9999999999';
            }else{
                phoneNumber = data[i].Shipping_Address_Phone;
            }

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
            order.tag                   = data[i].Channel_Name;

            // customer details
            order.custDetails.customerShippingNature        = "";
            order.custDetails.customerBillingNature         = "";
            order.custDetails.gstin                         = "";
            order.custDetails.companyName                   = "";
            order.custDetails.emailId                       = "";
            order.custDetails.phoneNumber                   = phoneNumber;
            order.custDetails.shippingAddressCode           = null;
            order.custDetails.shippingAddressLine1          = shippingAddress1
            order.custDetails.shippingAddressLine2          = shippingAddress2
            order.custDetails.shippingAddressLine3          = "";
            order.custDetails.shippingCity                  = shippingCity;
            order.custDetails.shippingDistrict              = shippingCity;
            order.custDetails.shippingState                 = data[i].Shipping_Address_State;
            order.custDetails.shippingPincode               = data[i].Shipping_Address_Pincode;
            order.custDetails.shippingCountry               = data[i].Shipping_Address_Country;
            order.custDetails.billingAddressCode            = "";
            order.custDetails.billingAddressSameAsShipping  = "Yes",
            order.custDetails.billingAddressLine1           = billingAddress1;
            order.custDetails.billingAddressLine2           = billingAddress2;
            order.custDetails.billingAddressLine3           = "";
            order.custDetails.billingCity                   = billingCity;
            order.custDetails.billingDistrict               = "";
            order.custDetails.billingState                  = data[i].Billing_Address_State;
            order.custDetails.billingPincode                = data[i].Billing_Address_Pincode;
            order.custDetails.billingCountry                = data[i].Billing_Address_Country;
            order.custDetails.billingGstin                  = data[i].Customer_GSTIN;
            order.custDetails.isPrimaryShippingAddress      = "";
            order.custDetails.isPrimaryBillingAddress       = "";
            order.custDetails.customerCode = null;
            order.custDetails.firstName                     = customerName[0];
            order.custDetails.lastName                      = customerName[1];
        }

        if(previousItemId==data[i].Item_SKU_Code && previousOrderId==data[i].Display_Order_Code){
            item.quantity               = parseInt(item.quantity) + 1;
        }else{
            var item = {};
            item.quantity               = 1;
            item.sellingPricePerItem    = parseInt(data[i].Selling_Price);
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
        previousItemId      = data[i].Item_SKU_Code;
        previousOrderId     = data[i].Display_Order_Code;
        
        if((i+1)==data.length){
            allData.push(order);
        }
    }
    await sendFinalData(allData);
    console.log('total orders to send............' + p);
}

async function sendFinalData(allData){
    let a=0;    
    if(allData.length){
        for(const row of allData){
            console.log(row.orderId+" ------------- ");
            await sendData(row,a);
            a++;
        }
        console.log("Finished sending orders");
    }
}

sendData = function(postData){
    console.log('send to server..........' + postData.orderId);
    var logData = {
        module:'Order',
        objectId:postData.orderId,
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
        url: 'https://'+mavenLoginDomain+'.gscmaven.com/api/oms/omsservices/webapi/orders/create',
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
                        objectId:postData.orderId,status:'pending',module:'Order'
                    },{$set:{status:"success", responseData:JSON.stringify(body)}},function(err, d) {
                        OrderModel.update(
                            {Display_Order_Code:postData.orderId}, 
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
                        objectId:postData.orderId,status:'pending',module:'Order'
                    },{$set:{status:"duplicate", responseData:JSON.stringify(body)}},function(err, d) {
                        OrderModel.update(
                            {Display_Order_Code:postData.orderId}, 
                            { Pushed_To_Server: 2 }, 
                            { multi: true }, 
                            function(err, res) { if (err) { console.log(err); } else { }}
                        );
                    });
                }else{
                    logModel.findOneAndUpdate({
                        objectId:postData.orderId,status:'pending',module:'Order'
                    },{$set:{status:"failed", responseData:JSON.stringify(body)}},function(err, d) {});
                }
            }
            console.log(body);
            resolve();
        });
    });
}
