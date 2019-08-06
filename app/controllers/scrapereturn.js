var https = require('https');
const csv = require('csv-parser');  
const fs = require('fs');
const puppeteer = require('puppeteer');
var ReturnModel = require('../models/return');
var constant = require('../../config/constants');
var FilelogModel = require('../models/filelog')
var tenantCode = '';
var projectId = '';
var page = '';
var browser = '';
exports.secretwish = async function(req, res, next){
    projectId = 5;
    if(constant.uniCommerceProjects[projectId].enable==true){
        tenantCode = constant.uniCommerceProjects[projectId].name;
        await login(tenantCode);
    }else{
        console.log('import is not enable for.....' + tenantCode)
    }
    
    res.redirect('/returns');
    return;
}

exports.gps = async function(req, res, next){
    projectId = 2;
    if(constant.uniCommerceProjects[projectId].enable==true){
        tenantCode = constant.uniCommerceProjects[projectId].name;
        await login(tenantCode);
    }else{
        console.log('import is not enable for.....' + tenantCode)
    }
    console.log('are we done.....?');
    res.redirect('/returns');
    return;
}

exports.jerado = async function(req, res, next){
    projectId = 3;
    if(constant.uniCommerceProjects[projectId].enable==true){
        tenantCode = constant.uniCommerceProjects[projectId].name;
        await login(tenantCode);
    }else{
        console.log('import is not enable for.....' + tenantCode)
    }
    console.log('are we done.....?');
    res.redirect('/returns');
    return;
}

exports.markmediums = async function(req, res, next){
    projectId = 4;
    if(constant.uniCommerceProjects[projectId].enable==true){
        tenantCode = constant.uniCommerceProjects[projectId].name;
        await login(tenantCode);
    }else{
        console.log('import is not enable for.....' + tenantCode)
    }
    console.log('are we done.....?');
    res.redirect('/returns');
    return;
}

exports.anscommerce = async function(req, res, next){
    projectId = 1;
    if(constant.uniCommerceProjects[projectId].enable==true){
        tenantCode = constant.uniCommerceProjects[projectId].name;
        await login(tenantCode);
    }else{
        console.log('import is not enable for.....' + tenantCode)
    }
    console.log('are we done.....?');
    res.redirect('/returns');
    return;
}

login = async function(tenantCode){
    console.log('lets login for (returns)............' + tenantCode);
    const USERNAME_SELECTOR = '#username';
    const PASSWORD_SELECTOR = '#password';
    const BUTTON_SELECTOR = '#loginForm > input.loginButton';
    
    browser = await puppeteer.launch({
        headless: true
    });
    page = await browser.newPage();
    await page.goto(constant.url);
    await page.waitFor(5*1000);

    try{
        if (await page.waitForSelector(USERNAME_SELECTOR,{timeout:5000})) {
            await page.click(USERNAME_SELECTOR);
            await page.keyboard.type(constant.j_username);
        }
    }
    catch(e) {
        console.log('error, login form not loaded');
        page.close();
        return;
    }

    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(constant.j_password);
    const response = await page.click(BUTTON_SELECTOR);
    console.log('login done..............');
    await scrapereturns();

}

function getDateRange() {
    var today = new Date(date);
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();

    if (dd < 10)
        dd = '0' + dd
    if (mm < 10)
        mm = '0' + mm
    return mm + '/' + dd + '/' + yyyy;
}

scrapereturns = async function(req, res, next)
{
    console.log('scraping returns........')
    await page.waitFor(5*1000);     
    tenantCode = constant.uniCommerceProjects[projectId].name;
    const CUSTOM_DATE_RANGE_SELECTOR = '#filterInput-dateRangeFilter > div.grains > button:nth-child(7)';
    const CUSTOM_DATE_APPLY_BUTTON = '.applyFilter';
    const DATE_RANGE_SELECTOR = '#filterInput-dateRangeFilter > div.grains > button:nth-child(7)';
    const PROJECT_LIST_PAGE = 'https://auth.unicommerce.com';
    const LAST_30_DAYS_SELECTOR = '#filterInput-dateRangeFilter > div.grains > button:nth-child(4)';

    const PROJECT_SELECTOR = '#accountsListContainer > div:nth-child('+projectId+') > div';
    const RETURN_REPORT_URL = 'https://'+tenantCode+'.unicommerce.com/shipments#viewName=New&filters%5B0%5D%5Bid%5D=statusFilter&filters%5B0%5D%5BselectedValues%5D%5B%5D=CREATED&filters%5B0%5D%5BselectedValues%5D%5B%5D=LOCATION_NOT_SERVICEABLE&filters%5B0%5D%5BselectedValues%5D%5B%5D=PICKING&filters%5B0%5D%5BselectedValues%5D%5B%5D=PICKED&filters%5B1%5D%5Bid%5D=putawayPendingFilter&filters%5B1%5D%5Bchecked%5D=false';
    const RETURN_TAB_SELECTOR = '#viewList > div > ul > li:nth-child(9) > a';
    const CUSTOM_DATE_FILTER_SELECTOR = '#tableParentReturns > div > div.hDiv > div > table > thead > tr > th.sortable.sorted > div > div.filterButtonDiv.rfloat > span > i';
    const EXPORT_JOBS_URL = 'https://'+tenantCode+'.unicommerce.com/data/user/exportJobs';
    const EXPORT_JOB_SELECTOR = '#newModules > div.shipmentList > div.uni-module-header.clearfix > div.rfloat10.clearfix > div > span.exportItem.icon.icon_export-item';
    const DATE_FROM = new Date();
    const DATE_TO = new Date(+new Date() - (1000 * 60 * 60 *24 * 2));
    // const DATE_RANGE = getDateRange();
    console.log('lets select project '+ tenantCode + '..............');
    try{
        await page.click(PROJECT_SELECTOR);
    }catch(e){
        console.log('Unable to select project ' + tenantCode + '......!');
        return;
    }
    await page.waitFor(10*1000);

    console.log('lets go to return report page...........');
    await page.goto(RETURN_REPORT_URL);
    await page.waitFor(10000);

    console.log('Got to return tab.............');
    await page.click(RETURN_TAB_SELECTOR)
    await page.waitFor(5*1000);
    console.log('click date filter icon..............');
    await page.click(CUSTOM_DATE_FILTER_SELECTOR);
    await page.waitFor(2*1000);
    await page.click(LAST_30_DAYS_SELECTOR);
    await page.waitFor(2*1000);
    // await page.evaluate(() => {
    //     let dom = document.querySelector('.startDate');
    //     dom.innerHTML = "2018-02-06";
    //  });
    //  await page.evaluate(() => {
    //     let dom = document.querySelector('.endDate');
    //     dom.innerHTML = "2019-07-14";
    //  });
    //  await page.waitFor(5000);
     await page.click(CUSTOM_DATE_APPLY_BUTTON);
    console.log('apply button clicked.........');
    await page.waitFor(2*1000);
    console.log('lets export job..........');
    await page.click(EXPORT_JOB_SELECTOR);
    await page.waitFor(10*1000);
    console.log('lets get the latest completed job............');
    console.log('get all the jobs in json.................')
    await page.goto(EXPORT_JOBS_URL);
    await page.waitFor(3000);

    innerText = await page.evaluate(() =>  {
        return JSON.parse(document.querySelector("body").innerText); 
    }); 
    console.log('get the latest report file...............');
    var fileUrl = '';
    if(innerText.successful==true){
        innerText.exportJobs.forEach(function(data, index) {
            if(data.name=='DATATABLE_CUSTOMER_RETURN' && data.statusCode=='COMPLETE' && fileUrl==''){
                {
                    fileUrl = data.exportFilePath;
                    return;
                }
            }
        });
    }

    await page.waitFor(5000);
    console.log('read csv file.............');
    var filename = tenantCode + '_Return_Orders_' + Math.round((new Date()).getTime() / 1000) + '.csv';
    console.log(fileUrl)
    var dest = __dirname.replace('/app/controllers','') + '/public/downloads/returns/' + filename;
    console.log(dest);
    var file = await download(fileUrl, dest, filename);
    await page.waitFor(5000);
    const results=[];
    fs.createReadStream(dest)
        .pipe(csv())
        .on('data', (data) => {
            results.push(data)
        })
        .on('end', () => {
            pushDataInDB(results);
    });
    page.close();
    return;
}

pushDataInDB = async function(data){
    var updatedRecord = 0;
    
    ReturnModel.deleteMany({Tenant_Code:tenantCode}, function(err) {
        if(err) throw err;
    });  
    for (var key in data) {
        var elem={};
        for(var k in data[key])
        {
            elem.Channel = data[key]['Channel'];
            elem.Reverse_Pickup_Number = data[key]['Reverse Pickup #'];
            elem.Order_Number = data[key]['Order #'];
            elem.Products = data[key]['Products'];
            elem.Required_Action = data[key]['Required Action'];
            elem.Status = data[key]['Status'];
            elem.Pickup_Provider = data[key]['Pickup Provider'];
            elem.Tracking_Number = data[key]['Tracking #'];
            elem.Return_Reason = data[key]['Return Reason'];
            elem.Created_Date = data[key]['Created Date'];
            elem.Shipment = data[key]['Shipment'];
            elem.Display_Order_number = data[key]['Display Order #'];
            elem.Item_Type_SKUs = data[key]['Item Type SKUs'];
            elem.Item_Type_Ids = data[key]['Item Type Ids'];
            elem.Seller_SKUs = data[key]['Seller SKUs'];
            elem.Item_ID_Details = data[key]['Item Id Details'];
            elem.Order_Item_Ids = data[key]['OrderItemIds'];
            elem.Seller_SKU_Details = data[key]['Seller SKU Details'];
            elem.Tenant_Code = tenantCode;
        }

        updatedRecord = updatedRecord+1;
        var returnData = new ReturnModel(elem);
        returnData.save(function(err){
            if(err) throw err;
        });
    }
    console.log(updatedRecord + ' records updated in DB............');
}

getTodayDate = function() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

download = async function(url, dest, filename){
    console.log('download function called..........');
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest, { flags: "wx" });
        const request = https.get(url, response => {
            if (response.statusCode === 200) {
                response.pipe(file);
            } else {
                try{
                    file.close();
                    fs.unlink(dest, () => {}); // Delete temp file
                    reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
                }catch(e){
                    console.log('file close/unlick error.........')
                }
            }
        });

        request.on("error", err => {
            file.close();
            fs.unlink(dest, () => {}); // Delete temp file
            reject(err.message);
        });

        file.on("finish", () => {
            console.log('file download done............?');
            var filelogData = new FilelogModel({tenantCode:tenantCode, originalFileName:url, localFileName: filename});
            filelogData.save(function(err){
                if(err) throw err;
            });
            resolve();
        });

        file.on("error", err => {
            console.log(err);
            console.log('file download error............?');
            file.close();

            if (err.code === "EXIST") {
                reject("File already exists");
            } else {
                fs.unlink(dest, () => {}); // Delete temp file
                reject(err.message);
            }
        });
    });
}