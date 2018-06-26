var mongoose = require('mongoose');
var schema = mongoose.Schema;

var modelSchema = new schema({
   modulos:[{mId:String,horas:String,aprovado:Boolean}],
   clases:[{cId:String,horas:String}],
   pruebasHojaRespuesta:[{type:schema.Types.ObjectId,ref:'pruebaHojaRespuesta'}]
})

module.exports = mongoose.model('avancescurso', modelSchema);