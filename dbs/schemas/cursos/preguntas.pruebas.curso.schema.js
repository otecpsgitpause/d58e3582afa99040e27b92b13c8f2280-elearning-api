var mongoose = require('mongoose');
var schema = mongoose.Schema;

var modelSchema = new schema({
    enunciado:String,
    fechaCreacion:Number,
    alternativas:[{type:schema.Types.ObjectId,ref:'alternativas'}],

})

module.exports= mongoose.model('preguntas', modelSchema);;