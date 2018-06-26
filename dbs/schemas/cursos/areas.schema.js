var mongoose = require('mongoose');
var schema = mongoose.Schema;

var modelSchema = new schema({
    nombre:String
})

module.exports = mongoose.model('areas', modelSchema);