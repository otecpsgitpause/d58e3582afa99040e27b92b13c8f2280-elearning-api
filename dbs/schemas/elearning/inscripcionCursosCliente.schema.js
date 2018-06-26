var mongoose = require('mongoose');
var schema = mongoose.Schema;

var modelSchema = new schema({
    fechaInscripcion:{type:String,default:'sindefinir'},
    fechaTermino:{type:String,default:'sindefinir'},
    curso:{type:schema.Types.ObjectId,ref:'cursos'},
    aprovado:{type:Boolean,default:false},
    avancescurso:{type:schema.Types.ObjectId,ref:'avancescurso'},
    terminado:{type:Boolean,default:false},
    fechaCreacion:Number
})

module.exports = mongoose.model('inscripcionCursosCliente', modelSchema);