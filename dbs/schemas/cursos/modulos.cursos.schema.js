var mongoose = require('mongoose');
var schema = mongoose.Schema;


var modelSchema= new schema({
    numero:Number,
    nombre:String,
    descripcion:String,
    descripcionCorta:String,
    totalHoras:Number,
    estado:Boolean,
    fechaCreacion:Number,
    pruebas:[{type:schema.Types.ObjectId,ref:'pruebas'}],
    clases:[{type:schema.Types.ObjectId,ref:'clases'}]
});

module.exports = mongoose.model('modulos', modelSchema);