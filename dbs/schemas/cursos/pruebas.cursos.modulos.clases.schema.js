var mongoose = require('mongoose');
var schema = mongoose.Schema;

var modelSchema = new schema({
    nombre:String,
    instrucciones:String,
    numero:Number,
    duracion:String,
    porcentajeAprovacion:Number,
    fechaCreacion:Number,
    preguntas:[{type:schema.Types.ObjectId,ref:'preguntas'}],

})

module.exports= mongoose.model('pruebas', modelSchema);;