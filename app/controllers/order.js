var request = require("request");
var OrderModel = require('../models/order');
var constant = require('../../config/constants');
var logModel = require('../models/log');
var tenantCode = '';
var mavenLoginDomain = '';
var serverCookie = '';

exports.index = async function(req, res, next)
{
    for(var i in constant.uniCommerceProjects){
        if(constant.uniCommerceProjects[i].pushOrders==true){
            tenantCode = constant.uniCommerceProjects[i].name;
            mavenLoginDomain = constant.uniCommerceProjects[i].mavenLoginDomain;
            await sendAuthRequest();
        }
    }
    
    res.send('are we done........?');
    return;
}

sendAuthRequest = async function(){
    console.log('lets call auth api first...........')
    var options = { 
        method: 'POST',
        rejectUnauthorized: false, 
        url: 'https://'+mavenLoginDomain+'.gscmaven.com/api/auth/authservice/webapi/login/authenticate',
        headers: 
        { 
            'cache-control': 'no-cache',
            'Connection': 'keep-alive',
            'content-length': '61',
            'accept-encoding': 'gzip, deflate',
            'Host': mavenLoginDomain + '.gscmaven.com',
            'Postman-Token': 'bcd22405-b1af-4352-a303-c8efa122df3d,0c6e18b7-934e-43c3-aefa-61c71d7c0b58',
            'Cache-Control': 'no-cache',
            'Accept': '/',
            'User-Agent': 'PostmanRuntime/7.15.0',
            'Referer': 'https://'+mavenLoginDomain+'.gscmaven.com',
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
        console.log(tenantCode)
    await OrderModel.find({Pushed_To_Server:null, Tenant_Code: tenantCode}).sort({
        Display_Order_Code: 1,Item_SKU_Code:1}).exec(function(err, docs){
            console.log('records fetched: .........'+docs.length);
            //console.log(docs);
            prepareData(docs)
        }); 
    }else{
        console.log('authentication failed..............!');
    }
}

getName = async function(name){
    var customerName = [];
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
    
    for( var i=0; i<data.length; i++ ){
        if(data[i].Display_Order_Code=='171-2054635-2128327'){
            console.log(data);
        }
        if(previousOrderId!=data[i].Display_Order_Code){
            var customerName = getName(data[i].Shipping_Address_Name);
            
            if(previousOrderId != data[i].Display_Order_Code && p!=0)
            {
                sendData(order);
            }
          
            var shippingCity = data[i].Shipping_Address_City.replace(/[^\w\s]/gi, ' ');
            shippingCity = shippingCity.replace(/\d/g, "");
            shippingCity = shippingCity.replace(/_/g, "");
            var shippingAddress1 = data[i].Shipping_Address_Line_1.replace(/[^\w\s]/gi, ' ');
            var shippingAddress2 = data[i].Shipping_Address_Line_2.replace(/[^\w\s]/gi, ' ');

            var billingCity = data[i].Billing_Address_City.replace(/[^\w\s]/gi, ' ');
            billingCity = billingCity.replace(/\d/g, "");
            billingCity = billingCity.replace(/-/g, "");
            var billingAddress1 = data[i].Billing_Address_Line_1.replace(/[^\w\s]/gi, ' ');
            var billingAddress2 = data[i].Billing_Address_Line_2.replace(/[^\w\s]/gi, ' ');
            if(data[i].Shipping_Address_Phone.indexOf('X') >= 0){
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

            // customer details
            order.custDetails.customerCode = null;
            order.custDetails.firstName                     = data[i].Shipping_Address_Name.replace(/[^\w\s]/gi, '');
            order.custDetails.lastName                      = 'ans';//customerName[1] ? customerName[1].replace(/[^\w\s]/gi, '') : '';
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
        }

        if(previousItemId==data[i].Item_SKU_Code && previousOrderId==data[i].Display_Order_Code){
            if(data[i].Display_Order_Code=='408-4099223-7393146')
            {
                console.log('in quantity.......')
            }
            item.quantity               = parseInt(item.quantity) + 1;
        }else{
            if(data[i].Display_Order_Code=='408-4099223-7393146')
            {
                console.log('in else part.......')
            }
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
        previousItemId=data[i].Item_SKU_Code;
        previousOrderId     = data[i].Display_Order_Code;
        
        if((i+1)==data.length){
            sendData(order);
        }
    }
    console.log('total orders............'+p);
}

sendData = async function(postData){
    console.log('send to server...................'+postData.orderId);
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
    if(postData.orderId=='8649003110'){
        console.log(postData);
    }
    request(options, function (error, response, body) {
        if (error) 
        {
            console.log(error);
        }else{
            console.log(postData.orderId)
            if(body.errorCode==200){
                logModel.findOneAndUpdate({
                    objectId:postData.orderId,status:'pending'
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
                    objectId:postData.orderId,status:'pending'
                },{$set:{status:"duplicate", responseData:JSON.stringify(body)}},function(err, d) {
                    OrderModel.update(
                        {Display_Order_Code:postData.orderId}, 
                        { Pushed_To_Server: 2 }, 
                        { multi: true }, 
                        function(err, res) {
                            if (err) { 
                                console.log(err);
                            } else { 
                            }
                        }
                    );
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