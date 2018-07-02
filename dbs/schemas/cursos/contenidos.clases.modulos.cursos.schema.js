var mongoose = require('mongoose');
var schema = mongoose.Schema;



var modelSchema= new schema({
    nombre:String,
    descripcion:String,
    descripcionCorta:String,
    numero:String,
    totalHoras:Number,
    totalHorasSegundos:{type:Number,default:0},
    url:String,
    tipo:String,
    estado:Boolean,
    fechaCreacion:Number
});

module.exports = mongoose.model('contenidos', modelSchema);
