var mongoose = require('mongoose');
var schema = mongoose.Schema;


var modelSchema= new schema({
    nombre:String,
    descripcion:String,
    descripcionCorta:String,
    numero:Number,
    totalHoras:Number,
    totalHorasSegundos:{type:Number,default:0},
    estado:Boolean,
    fechaCreacion:Number,
    pruebas:[{type:schema.Types.ObjectId,ref:'pruebas'}],
    contenidos:[{type:schema.Types.ObjectId,ref:'contenidos'}]
});

module.exports = mongoose.model('clases', modelSchema);
