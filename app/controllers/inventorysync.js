const puppeteer = require('puppeteer');
var request = require('request-promise');
var constant = require('../../config/constants');
var logModel = require('../models/log');
var tenantCode = '';
var projectId = '';
var mavenLoginDomain = '';
var serverCookie = '';
var inventoryData = {};
var page = '';
var browser = '';

exports.secretwish = async function(req, res, next){
    projectId = 5;
    tenantCode = constant.uniCommerceProjects[projectId].name;
    mavenLoginDomain = constant.uniCommerceProjects[projectId].mavenLoginDomain;
    await sendInventoryAuthRequest(tenantCode);

    res.redirect('/inventory');
    return;
}

exports.gps = async function(req, res, next){
    projectId = 2;
    tenantCode = constant.uniCommerceProjects[projectId].name;
    mavenLoginDomain = constant.uniCommerceProjects[projectId].mavenLoginDomain;
    await sendInventoryAuthRequest(tenantCode);

    res.redirect('/inventory');
    return;
}

exports.jerado = async function(req, res, next){
    projectId = 3;
    tenantCode = constant.uniCommerceProjects[projectId].name;
    mavenLoginDomain = constant.uniCommerceProjects[projectId].mavenLoginDomain;
    await sendInventoryAuthRequest(tenantCode);

    res.redirect('/inventory');
    return;
}

exports.markmediums = async function(req, res, next){
    projectId = 4;
    tenantCode = constant.uniCommerceProjects[projectId].name;
    mavenLoginDomain = constant.uniCommerceProjects[projectId].mavenLoginDomain;
    await sendInventoryAuthRequest(tenantCode);

    res.redirect('/inventory');
    return;
}

exports.anscommerce = async function(req, res, next){
    projectId = 1;
    tenantCode = constant.uniCommerceProjects[projectId].name;
    mavenLoginDomain = constant.uniCommerceProjects[projectId].mavenLoginDomain;
    await sendInventoryAuthRequest(tenantCode);

    res.redirect('/inventory');
    return;
}

sendInventoryAuthRequest = async function(){
    console.log('auth call for inventory...........' + mavenLoginDomain)
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
    // return new Promise((resolve, reject) => {
        await request(options, function (error, response, body) {
            if (error) 
            {
                console.log(error)
            //    reject();
            }else{
                serverCookie = response.headers.cookie;
                getInventory();
          //      resolve();
            }
        });
    // });
}

async function getInventory(){
    console.log(tenantCode);
    console.log('get inventory data...........' + mavenLoginDomain)
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
            var log = new logModel(logData);
            log.save(function(err){
                if(err) throw err;
            });

            loginInventory();
        }
    });
}

updateInventory = async function(row){
    
    var p = {
        inventoryAdjustment:{
            itemSKU:row.skuCode,
            quantity:row.available,
            shelfCode:"DEFAULT",
            inventoryType:"GOOD_INVENTORY",
            adjustmentType:"REPLACE",
            remarks:"mavensync"
        }
    };
    var logData = {
        module:'InventorySync',
        requestData: JSON.stringify(p),
        objectId: row.skuCode,
        tenantCode:tenantCode,
        status:'pending',
    }

    var log = new logModel(logData);
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
        logModel.findOneAndUpdate({
            objectId:row.skuCode,status:'pending',module:'InventorySync'
        },{$set:{status:"success", responseData:JSON.stringify(responseBody)}},function(err, d) {});
    }else{
        logModel.findOneAndUpdate({
            objectId:row.skuCode,status:'pending',module:'InventorySync'
        },{$set:{status:"fail", responseData:JSON.stringify(responseBody)}},function(err, d) {});
    }
}

loginInventory = async function(){
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
            logModel.deleteMany({tenantCode:tenantCode,module:'InventorySync'}, function(err) {
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
            for(let row of inventoryData){
                page = await browser.newPage();
                await updateInventory(row);
            }
            page.close();
        console.log("Finished sending orders");
    }
}