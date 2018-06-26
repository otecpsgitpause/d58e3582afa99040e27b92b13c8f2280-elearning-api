var mongoose = require('mongoose');
var schema = mongoose.Schema;

var modelSchema = new schema({
   prueba:{type:schema.Types.ObjectId,ref:'pruebas'},
   preguntas:[{pregunta:Object,alternativa:Object} ],
   aprovado:{type:Boolean,default:false},
   terminada:{type:Boolean,default:false},
   inicio:String,
   termino:String,
   alumno:{type:schema.Types.ObjectId,ref:'clientes'}
})

module.exports = mongoose.model('pruebaHojaRespuesta', modelSchema);