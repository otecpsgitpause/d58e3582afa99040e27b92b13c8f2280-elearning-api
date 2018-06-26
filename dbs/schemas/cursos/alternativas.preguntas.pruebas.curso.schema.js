var mongoose = require('mongoose');
var schema = mongoose.Schema;

var modelSchema = new schema({
    enunciado:String,
    correcta:Boolean,
    fechaCreacion:Number
})

module.exports= mongoose.model('alternativas', modelSchema);;