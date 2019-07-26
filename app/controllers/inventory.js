const puppeteer = require('puppeteer');
var LogModel = require('../models/log');
var InventoryModel = require('../models/inventory');
var request = require('request-promise');
var constant = require('../../config/constants');

var tenantCode = '';
var projectId = '';
var mavenLoginDomain = '';
var serverCookie = '';
var inventoryData = {};
var page = '';
var browser = '';

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

async function getInventoryData(){
    await InventoryModel.find({tenantCode: tenantCode, status:'pending'}).limit(100).exec(function(err, docs){
            console.log('records fetched: .........' + docs.length);
            if(docs.length>0){
                inventoryData = docs;
            }else{
                console.log('no records found for ' + tenantCode);
            }
        }); 
}

async function syncInventoryData(){
    if(inventoryData.length){
        console.log('lets login for inventory............');
        const USERNAME_SELECTOR = '#username';
        const PASSWORD_SELECTOR = '#password';
        const BUTTON_SELECTOR = '#loginForm > input.loginButton';
        
        browser = await puppeteer.launch({
            headless: true,
            ignoreHTTPSErrors: true
        });
        page = await browser.newPage();
        LogModel.deleteMany({tenantCode:tenantCode,module:'InventorySync'}, function(err) {
            if(err) throw err;
        });  
        
        await page.goto(constant.url);
        await page.waitFor(4*1000);
        
        await page.click(USERNAME_SELECTOR);
        await page.keyboard.type(constant.j_username);
        await page.click(PASSWORD_SELECTOR);
        await page.keyboard.type(constant.j_password);
        const response = await page.click(BUTTON_SELECTOR);
        console.log('login done..............');
        await page.waitFor(4000);
        console.log('select project.......' + tenantCode);
        var PROJECT_SELECTOR = '#accountsListContainer > div:nth-child('+projectId+') > div';
        await page.click(PROJECT_SELECTOR);
        await page.waitFor(3000);
        // delete previous logs
        LogModel.deleteMany({module:'InventorySync',tenantCode:tenantCode}, function(err) {
            if(err) throw err;
        });
        for(let row of inventoryData){
            page = await browser.newPage();
            await pushInventoryData(row);
        }
        page.close();
        console.log("Finished sending orders");
    }else{
        console.log('errrrrrr...........')
    }
}

pushInventoryData = async function(row){
    
    var p = {inventoryAdjustment:{itemSKU:row.skuCode,quantity:row.quantity,shelfCode:"DEFAULT",inventoryType:"GOOD_INVENTORY",adjustmentType:"REPLACE",remarks:"mavensync"}};
    var logData = {module:'InventorySync',requestData: JSON.stringify(p),objectId: row.skuCode,tenantCode:tenantCode,status:'pending'};

    var log = new LogModel(logData);
    log.save(function(err){
        if(err) console.log(err);
    });
    await page.setRequestInterception(true);
    await page.on('request', interceptedRequest => {
        var data = {
            'method': 'POST',
            'headers': { "Content-Type": "application/json" },
            'postData': JSON.stringify(p)
        };
        interceptedRequest.continue(data);
    });

    response = await page.goto('https://'+tenantCode+'.unicommerce.com/data/inflow/inventory/adjust',{waitUntil: "load" });

    const responseBody = await response.text();
    console.log(responseBody);
    var r = JSON.parse(responseBody);
    if(r['successful']==true){
        LogModel.findOneAndUpdate({
            objectId:row.skuCode,status:'pending',module:'InventorySync'
        },{$set:{status:"success", responseData:JSON.stringify(responseBody)}},function(err, d) {});
        InventoryModel.findOneAndUpdate({
            skuCode:row.skuCode,status:'pending'
        },{$set:{status:"success"}},function(err, d) {});
    }else{
        LogModel.findOneAndUpdate({
            objectId:row.skuCode,status:'pending',module:'InventorySync'
        },{$set:{status:"fail", responseData:JSON.stringify(responseBody)}},function(err, d) {});
        InventoryModel.findOneAndUpdate({
            skuCode:row.skuCode,status:'pending'
        },{$set:{status:"fail"}},function(err, d) {});
    }
}

exports.syncSecretwishInventory = async function(req, res, next){
    projectId = 5;
    tenantCode = constant.uniCommerceProjects[projectId].name;
    mavenLoginDomain = constant.uniCommerceProjects[projectId].mavenLoginDomain;
    await getInventoryData();
    await syncInventoryData();
    res.redirect('/inventory');
    return;
}

exports.syncGPSInventory = async function(req, res, next){
    projectId = 2;
    tenantCode = constant.uniCommerceProjects[projectId].name;
    mavenLoginDomain = constant.uniCommerceProjects[projectId].mavenLoginDomain;
    await getInventoryData();
    await syncInventoryData();
    res.redirect('/inventory');
    return;
}

exports.syncJeradoInventory = async function(req, res, next){
    projectId = 3;
    tenantCode = constant.uniCommerceProjects[projectId].name;
    mavenLoginDomain = constant.uniCommerceProjects[projectId].mavenLoginDomain;
    await getInventoryData();
    await syncInventoryData();
    res.redirect('/inventory');
    return;
}

exports.syncMarkmediumsInventory = async function(req, res, next){
    projectId = 4;
    tenantCode = constant.uniCommerceProjects[projectId].name;
    mavenLoginDomain = constant.uniCommerceProjects[projectId].mavenLoginDomain;
    await getInventoryData();
    await syncInventoryData();
    res.redirect('/inventory');
    return;
}

exports.syncAnscommerceInventory = async function(req, res, next){
    projectId = 1;
    tenantCode = constant.uniCommerceProjects[projectId].name;
    mavenLoginDomain = constant.uniCommerceProjects[projectId].mavenLoginDomain;
    await getInventoryData();
    await syncInventoryData();;
    res.redirect('/inventory');
    return;
}

exports.importSecretwishInventory = async function(req, res, next){
    projectId = 2;
    tenantCode = constant.uniCommerceProjects[projectId].name;
    mavenLoginDomain = constant.uniCommerceProjects[projectId].mavenLoginDomain;
    await inventoryAuthRequest(tenantCode);
    await getInventory();
    await saveInventory();
    res.redirect('/inventory');
    return;
}

exports.importGPSInventory = async function(req, res, next){
    projectId = 2;
    tenantCode = constant.uniCommerceProjects[projectId].name;
    mavenLoginDomain = constant.uniCommerceProjects[projectId].mavenLoginDomain;
    await inventoryAuthRequest(tenantCode);
    await getInventory();
    await saveInventory();
    res.redirect('/inventory');
    return;
}

exports.importJeradoInventory = async function(req, res, next){
    projectId = 3;
    tenantCode = constant.uniCommerceProjects[projectId].name;
    mavenLoginDomain = constant.uniCommerceProjects[projectId].mavenLoginDomain;
    await inventoryAuthRequest(tenantCode);
    await getInventory();
    await saveInventory();
    res.redirect('/inventory');
    return;
}

exports.importMarkmediumsInventory = async function(req, res, next){
    projectId = 4;
    tenantCode = constant.uniCommerceProjects[projectId].name;
    mavenLoginDomain = constant.uniCommerceProjects[projectId].mavenLoginDomain;
    await inventoryAuthRequest(tenantCode);
    await getInventory();
    await saveInventory();
    res.redirect('/inventory');
    return;
}

exports.importAnscommerceInventory = async function(req, res, next){
    projectId = 1;
    tenantCode = constant.uniCommerceProjects[projectId].name;
    mavenLoginDomain = constant.uniCommerceProjects[projectId].mavenLoginDomain;
    await inventoryAuthRequest(tenantCode);
    await getInventory();
    await saveInventory();
    res.redirect('/inventory');
    return;
}

inventoryAuthRequest = async function(){
    console.log('auth call for inventory...........' + tenantCode)
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
    // return new Promise(resolve=>{
        await request(options, function (error, response, body) {
            if (error) 
            {
                console.log(error)
            }else{
                serverCookie = response.headers.cookie;
            }
        });
    // });
}

async function getInventory(){
    console.log('get inventory data for...........' + tenantCode)
    var url = 'https://'+mavenLoginDomain+'.gscmaven.com/api/oms/omsservices/webapi/inventory?start=0&size=3000&warehouseid=1';
    var options = { 
        headers: 
            { 
                'Cookie': serverCookie,
                'Referer': 'https://'+mavenLoginDomain+'.gscmaven.com',
                'Origin': 'https://'+mavenLoginDomain+'.gscmaven.com',
                'Content-Type': 'application/json' 
            },
        method: 'GET',
        rejectUnauthorized: false, 
        url: url
    };

    await request(options, function (error, response, body) {
        if (error) 
        {
            console.log(error)
        }else{
            inventoryData = JSON.parse(body);
            var logData = {
                module:'Inventory',
                requestData: url,
                responseData: JSON.stringify(body),
                tenantCode:tenantCode
            }
            var log = new LogModel(logData);
            log.save(function(err){
                if(err) throw err;
            });
        }
    });
}

async function saveInventory(req, res, next){
    // delete previous data
    console.log('save stock in DB.....')
    InventoryModel.deleteMany({tenantCode:tenantCode}, function(err){
        if(err)
        {
            console.log(err);
        }
    });
    for(let row of inventoryData){
        var inventoryRecord = {
            tenantCode: tenantCode,
            skuCode: row.skuCode,
            quantity: row.available,
        }
        var inventory = new InventoryModel(inventoryRecord);
        inventory.save(function(err){
            if(err){
                console.log(err);
            }
        });
    }
    console.log(inventoryData.length+' records imported!')
}

exports.index = async function(req, res, next){
    var secretwishCount = 0;
    var gpsCount = 0;
    var jeradoCount = 0;
    var markmediumsCount = 0;
    var anscommerceCount = 0;
    await InventoryModel.countDocuments({tenantCode:'secretwish'})
    .then(secretwish => {
        InventoryModel.countDocuments({tenantCode:'grandpitstop2'})
        .then(gps => {
            InventoryModel.countDocuments({tenantCode:'jeradobrandsprivatelimited'})
                .then(jerado => {
                    InventoryModel.countDocuments({tenantCode:'markmediums'})
                        .then(markmediums => {
                            InventoryModel.countDocuments({tenantCode:'anscommerce'})
                                .then(anscommerce => {
                                        secretwishCount=secretwish;
                                        gpsCount = gps;
                                        jeradoCount = jerado;
                                        markmediumsCount = markmediums;
                                        anscommerceCount = anscommerce;
                                });
                            });     
                        });
                    });
                });  
                
                await InventoryModel.countDocuments({tenantCode:'secretwish',status:{'$ne':'success'}})
                .then(secretwish => {
                    InventoryModel.countDocuments({tenantCode:'grandpitstop2',status:{'$ne':'success'}})
                    .then(gps => {
                        InventoryModel.countDocuments({tenantCode:'jeradobrandsprivatelimited',status:{'$ne':'success'}})
                            .then(jerado => {
                                InventoryModel.countDocuments({tenantCode:'markmediums',status:{'$ne':'success'}})
                                    .then(markmediums => {
                                        InventoryModel.countDocuments({tenantCode:'anscommerce',status:{'$ne':'success'}})
                                            .then(anscommerce => {
                                                res.render('inventory/index.ejs',{
                                                    title:'Import/Export',
                                                    remainingSecretwishCount:secretwish,
                                                    remainingGpsCount : gps,
                                                    remainingJeradoCount : jerado,
                                                    remainingMarkmediumsCount : markmediums,
                                                    remainingAnscommerceCount : anscommerce,
                                                    secretwishCount : secretwishCount,
                                                    gpsCount : gpsCount,
                                                    jeradoCount : jeradoCount,
                                                    markmediumsCount : markmediumsCount,
                                                    anscommerceCount : anscommerceCount,
                                                });
                                                return;
                                            });
                                        });     
                                    });
                                });
                            });  
}
