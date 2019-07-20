// Define schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var returnSchema = new Schema({ 
        Channel                 : {type: String},
        Reverse_Pickup_Number   : {type: String},
        Order_Number            : {type: String},
        Products                : {type: String},
        Required_Action         : {type: String},
        Status                  : {type: String},
        Pickup_Provider         : {type: String},
        Tracking_Number         : {type: String},
        Return_Reason           : {type: String},
        Created_Date            : {type: String},
        Shipment                : {type: String},
        Display_Order_number    : {type: String},
        Item_Type_SKUs          : {type: String},
        Item_Type_Ids           : {type: String},
        Seller_SKUs             : {type: String},
        Item_ID_Details         : {type: String},
        Order_Item_Ids          : {type: String},
        Seller_SKU_Details      : {type: String},
        Tenant_Code             : {type: String},
        Pushed_To_Server        : {type: String, default:null},
        Import_Date             : {type: Date, default:new Date(+new Date() + 1000 * 60 * 330)}
  });

  var Return = mongoose.model('Return', returnSchema);
  module.exports = Return;