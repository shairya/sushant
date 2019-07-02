const moment = require('moment-timezone');
const dateTimezone = moment.tz(Date.now(), "Asia/Kolkata");
// Define schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var logSchema = new Schema({ 
    module      : {type: String},
    objectId    : {type: String},
    subObjectId : {type: String, default:null},
    requestData : {type: String, default:null},
    responseData : {type: String, default:null},
    status      : {type: String},
    createdAt   : {type: Date, default:dateTimezone}
});

var Log = mongoose.model('Log', logSchema);
module.exports = Log;