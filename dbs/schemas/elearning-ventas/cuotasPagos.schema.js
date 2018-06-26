var mongoose = require('mongoose');
var schema = mongoose.Schema;

var modelSchema = new schema({
    fechaPago:String,
    fechaVencimiento:String
})

module.exports = mongoose.model('cuotasPagos', modelSchema);