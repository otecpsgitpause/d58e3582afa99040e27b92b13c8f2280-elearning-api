var mongoose = require('mongoose');
var schema = mongoose.Schema;

var modelSchema = new schema({
    ventaCursoIncripcion:{type:schema.Types.ObjectId,ref:'ventaCursoIncripcion'},
    fecha:String,
    cliente:{type:schema.Types.ObjectId,ref:'clientes'},
    cuotas:[{type:schema.Types.ObjectId,ref:'cuotasPagos'}]
})

module.exports = mongoose.model('ventaCurso', modelSchema);