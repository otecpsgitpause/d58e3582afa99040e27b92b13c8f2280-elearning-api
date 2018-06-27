var mongoose = require('mongoose');
var schema = mongoose.Schema;

var modelSchema = new schema({
    cliente:{type:schema.Types.ObjectId,ref:'clientes'},
    inscripcionCursos:[{type:schema.Types.ObjectId,ref:'inscripcionCursosCliente'}]
})

module.exports = mongoose.model('clientesCursosSustituidos', modelSchema);