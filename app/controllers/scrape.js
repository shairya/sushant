var https = require('https');
const csv = require('csv-parser');  
const fs = require('fs');
const puppeteer = require('puppeteer');
var OrderModel = require('../models/order');
var CounterModel = require('../models/counter');
var constant = require('../../config/constants');
var FilelogModel = require('../models/filelog')
var currentCount = 0;
var currentDate = '';
var tenantCode = '';
var isProjectEnabled = false;
exports.index = async function(req, res, next)
{
    console.log('lets start............');
    const USERNAME_SELECTOR = '#username';
    const PASSWORD_SELECTOR = '#password';
    const BUTTON_SELECTOR = '#loginForm > input.loginButton';
    const DATE_RANGE_SELECTOR = 'body > div:nth-child(16) > div.ranges > ul > li:nth-child(5)';
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
        
    console.log('lets login..............');
    await page.goto(constant.url);
    await page.waitFor(5*1000);
    try{    
        await page.click(USERNAME_SELECTOR);
        await page.keyboard.type(constant.j_username);
        await page.click(PASSWORD_SELECTOR);
        await page.keyboard.type(constant.j_password);
        const response = await page.click(BUTTON_SELECTOR);
        console.log('login done..............');
    }catch(e){
        console.log('login failed, try again.....!');
        return;
    }

    await page.waitFor(5*1000);
    for(var i in constant.uniCommerceProjects){
        isProjectEnabled = constant.uniCommerceProjects[i].enable;
        if(isProjectEnabled){       
            tenantCode = constant.uniCommerceProjects[i].name;
            CounterModel.findOne({tenantCode:tenantCode}, function(err,obj) { 
                if(obj!==null && obj.count){
                    currentCount = obj.count;
                    currentDate=obj.date
                }
            });
            
            var PROJECT_LIST_PAGE = 'https://auth.unicommerce.com';
            var PROJECT_SELECTOR = '#accountsListContainer > div:nth-child('+i+') > div';
            var OTHER_REPORT_URL = 'https://' + tenantCode + '.unicommerce.com/tasks/export';
            var EXPORT_JOBS_URL = 'https://' + tenantCode + '.unicommerce.com/data/user/exportJobs';
            
            console.log('lets select project '+ tenantCode +'..............');
            try{
                await page.click(PROJECT_SELECTOR);
            }catch(e){
                console.log('Unable to select project ' + tenantCode + '......!');
                return;
            }
            await page.waitFor(5*1000);

            console.log('lets go to other report page...........');
            
            await page.goto(OTHER_REPORT_URL);
            await page.waitFor(5000);
            const pages = await browser.pages(); // get all open pages by the browser
            const popup = pages[pages.length - 1];
            try {
                await popup.waitForSelector('#remindLater', {timeout:3000});
                if(await popup.$('#remindLater')!=null){
                    await popup.click('#remindLater');
                }
                console.log('close pop..........')
            } catch (error) {
                console.log("popup didn't appear this time.........")
            }
            
            await page.waitFor(25*1000);
            const frame = await page.frames().find(f => f.name() === 'iframe1');
            await frame.select('#configName','Sale Orders');
            await frame.waitFor(4000);
            await frame.click('#all');
            await frame.click('#filter-1');
            await frame.click('#filter-addedOn');
            
            await frame.click(DATE_RANGE_SELECTOR);
            
            await frame.click('#filter-5');
            await frame.select('#filter-status', 'CREATED','FULFILLABLE','UNFULFILLABLE');
            await frame.click('#createJob');
            await page.waitFor(10000);
        
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
                    if(data.name=='Sale Orders' && data.statusCode=='COMPLETE' && fileUrl==''){
                        {
                            fileUrl = data.exportFilePath;
                            return;
                        }
                    }
                });
            }

            await page.waitFor(5000);
            console.log('read csv file.............');
            var filename = tenantCode + '_Sale_Orders_' + Math.round((new Date()).getTime() / 1000) + '.csv';
            var file = await download(fileUrl,__dirname + '../../../public/downloads/orders/' + filename, filename);
            const results=[];

            await fs.createReadStream(__dirname + '../../../public/downloads/orders/' + filename)
                .pipe(csv())
                .on('data', (data) => {
                    results.push(data)
                })
                .on('end', () => {
                    pushDataInDB(results);
            });
            console.log('go back to project list page..............');
            await page.goto(PROJECT_LIST_PAGE);
            await page.waitFor(5000);
        }
    }
    
    page.close();
    res.send('index.ejs');
}

pushDataInDB = async function(data){
    var updatedRecord = 0;
    var today = getTodayDate();
    
    var counter = 0;
    if(currentDate!=today){
        CounterModel.deleteMany({tenantCode:tenantCode}, function(err) {
            if(err) throw err;
        });
        currentCount = 0;
    }
    
    for (var key in data) {
        // check if the property/key is defined in the object itself, not in parent
        var elem={};
        for(var k in data[key])
        {
            if(counter>currentCount || currentCount==0){
                elem.Sale_Order_Item_Code = data[key]['Sale Order Item Code'];
                elem.Display_Order_Code = data[key]['Display Order Code'];
                elem.Reverse_Pickup_Code = data[key]['Reverse Pickup Code'];
                elem.Reverse_Pickup_Created_Date = data[key]['Reverse Pickup Created Date'];
                elem.Reverse_Pickup_Reason = data[key]['Reverse Pickup Reason'];
                elem.Notification_Email = data[key]['Notification Email'];
                elem.Notification_Mobile = data[key]['Notification Mobile'];
                elem.Require_Customization = data[key]['Require Customization'];
                elem.COD = data[key]['COD'];
                elem.Shipping_Address_Id = data[key]['Shipping Address Id'];
                elem.Category = data[key]['Category'];
                elem.Invoice_Code = data[key]['Invoice Code'];
                elem.Invoice_Created = data[key]['Invoice Created'];
                elem.Shipping_Address_Name = data[key]['Shipping Address Name'];
                elem.Shipping_Address_Line_1 = data[key]['Shipping Address Line 1'];
                elem.Shipping_Address_Line_2 = data[key]['Shipping Address Line 2'];
                elem.Shipping_Address_City = data[key]['Shipping Address City'];
                elem.Shipping_Address_State = data[key]['Shipping Address State'];
                elem.Shipping_Address_Country = data[key]['Shipping Address Country'];
                elem.Shipping_Address_Pincode = data[key]['Shipping Address Pincode'];
                elem.Shipping_Address_Phone = data[key]['Shipping Address Phone'];
                elem.Billing_Address_Id = data[key]['Billing Address Id'];
                elem.Billing_Address_Name = data[key]['Billing Address Name'];
                elem.Billing_Address_Line_1 = data[key]['Billing Address Line 1'];
                elem.Billing_Address_Line_2 = data[key]['Billing Address Line 2'];
                elem.Billing_Address_City = data[key]['Billing Address City'];
                elem.Billing_Address_State = data[key]['Billing Address State'];
                elem.Billing_Address_Country = data[key]['Billing Address Country'];
                elem.Billing_Address_Pincode = data[key]['Billing Address Pincode'];
                elem.Billing_Address_Phone = data[key]['Billing Address Phone'];
                elem.Shipping_Method = data[key]['Shipping Method'];
                elem.Item_SKU_Code = data[key]['Item SKU Code'];
                elem.Channel_Product_Id = data[key]['Channel Product Id'];
                elem.Item_Type_Name = data[key]['Item Type Name'];
                elem.Item_Type_Color = data[key]['Item Type Color'];
                elem.Item_Type_Size = data[key]['Item Type Size'];
                elem.Item_Type_Brand = data[key]['Item Type Brand'];
                elem.Channel_Name = data[key]['Channel Name'];
                elem.SKU_Require_Customization = data[key]['SKU Require Customization'];
                elem.Gift_Wrap = data[key]['Gift Wrap'];
                elem.Gift_Message = data[key]['Gift Message'];
                elem.HSN_Code = data[key]['HSN Code'];
                elem.MRP = data[key]['MRP'];
                elem.Total_Price = data[key]['Total Price'];
                elem.Selling_Price = data[key]['Selling Price'];
                elem.Cost_Price = data[key]['Cost Price'];
                elem.Prepaid_Amount = data[key]['Prepaid Amount'];
                elem.Subtotal = data[key]['Subtotal'];
                elem.Discount = data[key]['Discount'];
                elem.GST_Tax_Type_Code = data[key]['GST Tax Type Code'];
                elem.CGST = data[key]['CGST'];
                elem.IGST = data[key]['IGST'];
                elem.SGST = data[key]['SGST'];
                elem.UTGST = data[key]['UTGST'];
                elem.CESS = data[key]['CESS'];
                elem.CGST_Rate = data[key]['CGST Rate'];
                elem.IGST_Rate = data[key]['IGST Rate'];
                elem.SGST_Rate = data[key]['SGST Rate'];
                elem.UTGST_Rate = data[key]['UTGST Rate'];
                elem.CESS_Rate = data[key]['CESS Rate'];
                elem.Tax = data[key]['Tax %'];
                elem.Tax_Value = data[key]['Tax Value'];
                elem.Voucher_Code = data[key]['Voucher Code'];
                elem.Shipping_Charges = data[key]['Shipping Charges'];
                elem.Shipping_Method_Charges = data[key]['Shipping Method Charges'];
                elem.COD_Service_Charges = data[key]['COD Service Charges'];
                elem.Gift_Wrap_Charges = data[key]['Gift Wrap Charges'];
                elem.Packet_Number = data[key]['Packet Number'];
                elem.Order_Date = data[key]['Order Date as dd/mm/yyyy hh:MM:ss'];
                elem.Sale_Order_Code = data[key]['Sale Order Code'];
                elem.On_Hold = data[key]['On Hold'];
                elem.Sale_Order_Status = data[key]['Sale Order Status'];
                elem.Priority = data[key]['Priority'];
                elem.Currency = data[key]['Currency'];
                elem.Currency_Conversion_Rate = data[key]['Currency Conversion Rate'];
                elem.Sale_Order_Item_Status = data[key]['Sale Order Item Status'];
                elem.Cancellation_Reason = data[key]['Cancellation_Reason'];
                elem.Shipping_provider = data[key]['Shipping provider'];
                elem.Shipping_Arranged_By = data[key]['Shipping Arranged By'];
                elem.Shipping_Package_Code = data[key]['Shipping_Package_Code'];
                elem.Shipping_Package_Creation_Date = data[key]['Shipping Package Creation Date'];
                elem.Shipping_Package_Status_Code = data[key]['Shipping_Package_Status_Code'];
                elem.Shipping_Package_Type = data[key]['Shipping_Package_Type'];
                elem.Length = data[key]['Length(mm)'];
                elem.Width = data[key]['Width(mm)'];
                elem.Height = data[key]['Height(mm)'];
                elem.Delivery_Time = data[key]['Delivery Time'];
                elem.Tracking_Number = data[key]['Tracking Number'];
                elem.Dispatch_Date = data[key]['Dispatch Date'];
                elem.Facility = data[key]['Facility'];
                elem.Return_Date = data[key]['Return Date'];
                elem.Return_Reason = data[key]['Return Reason'];
                elem.Created = data[key]['Created'];
                elem.Updated = data[key]['Updated'];
                elem.Combination_Identifier = data[key]['Combination Identifier'];
                elem.Combination_Description = data[key]['Combination_Description'];
                elem.Transfer_Price = data[key]['Transfer_Price'];
                elem.Item_Code = data[key]['Item Code'];
                elem.IMEI = data[key]['IMEI'];
                elem.Weight = data[key]['Weight'];
                elem.GSTIN = data[key]['GSTIN'];
                elem.Customer_GSTIN = data[key]['Customer_GSTIN'];
                elem.TIN = data[key]['TIN'];
                elem.Payment_Instrument = data[key]['Payment_Instrument'];
                elem.Fulfillment_TAT = data[key]['Fulfillment_TAT'];
                elem.Channel_Shipping = data[key]['Channel_Shipping'];
                elem.Item_Details = data[key]['Item_Details'];
                elem.Tenant_Code = tenantCode;
            }
        }
        counter = counter + 1;
        if(counter>currentCount){
            updatedRecord = updatedRecord+1;
            var orderData = new OrderModel(elem);
            orderData.save(function(err){
                if(err) throw err;
            });
        }
    }
    CounterModel.deleteMany({tenantCode:tenantCode}, function(err) {
        if(err) throw err;
    });
    var counterData = new CounterModel({tenantCode:tenantCode, date:today, count: counter});
    counterData.save(function(err){
        if(err) throw err;
    });
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
            var filelogData = new FilelogModel({tenantCode:tenantCode, originalFileName:url, localFileName: filename});
            filelogData.save(function(err){
                if(err) throw err;
            });
            resolve();
        });

        file.on("error", err => {
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