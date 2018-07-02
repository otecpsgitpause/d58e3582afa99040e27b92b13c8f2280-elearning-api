var mongoose = require('mongoose');
var schema = mongoose.Schema;

var modelSchema = new schema({
    nombre:String,
    codigoSence:String,
    imagen:String,
    descripcion:String,
    descripcionCorta:String,
    opcionesTermino:String,
    totalHoras:Number,
    totalHorasSegundos:{type:Number,default:0},
    codigoVenta:String,
    venta:Boolean,
    definido:Boolean,
    estado:Boolean,
    fechaCreacion:Number,
    area:{type:schema.Types.ObjectId,ref:'areas'},
    modulos:[{type:schema.Types.ObjectId,ref:'modulos'}],
    pruebas:[{type:schema.Types.ObjectId,ref:'pruebas'}]
})

module.exports = mongoose.model('cursos', modelSchema);
