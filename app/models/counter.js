// Define schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var counterSchema = new Schema({ 
        date: {type: String},
        count: {type: String},
  });

  var Counter = mongoose.model('Counter', counterSchema);
  module.exports = Counter;