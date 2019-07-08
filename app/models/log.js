const moment = require('moment-timezone');
const dateTimezone = moment.tz(Date.now(), "Asia/Kolkata");
// Define schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var logSchema = new Schema({ 
    module      : {type: String},
    tenantCode  : {type: String},
    objectId    : {type: String},
    subObjectId : {type: String, default:null},
    requestData : {type: String, default:null},
    responseData : {type: String, default:null},
    status      : {type: String},
    edited      : {type: String, default:'no'},
    createdAt   : {type: Date, default:new Date(+new Date() + 1000 * 60 * 330)}
});

var Log = mongoose.model('Log', logSchema);
module.exports = Log;