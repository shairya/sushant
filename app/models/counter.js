// Define schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var counterSchema = new Schema({ 
      tenantCode: {type: String},
      date: {type: String},
      count: {type: String},
  });

  var Counter = mongoose.model('Counter', counterSchema);
  module.exports = Counter;