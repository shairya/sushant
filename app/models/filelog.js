const moment = require('moment-timezone');
const dateTimezone = moment.tz(Date.now(), "Asia/Kolkata");

// Define schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var filelogSchema = new Schema({ 
    createAt            : {type: Date, default:new Date(+new Date() + 1000 * 60 * 330)},
    tenantCode          : {type: String},
    originalFileName    : {type: String},
    localFileName       : {type: String},
});

var Filelog = mongoose.model('Filelog', filelogSchema);
module.exports = Filelog;