// Define schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var inventorySchema = new Schema({ 
      tenantCode    : {type: String},
      skuCode       : {type: String},
      quantity      : {type: Number},
      status        : {type: String, default:'pending'},
      date          : {type: String},
  });

  var Inventory = mongoose.model('Inventory', inventorySchema);
  module.exports = Inventory;