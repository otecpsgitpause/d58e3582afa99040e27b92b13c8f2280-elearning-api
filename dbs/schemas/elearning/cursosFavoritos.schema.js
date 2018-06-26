var mongoose = require('mongoose');
var schema = mongoose.Schema;

var modelSchema = new schema({
    cursos:[{type:schema.Types.ObjectId,ref:'cursos'}],
    cliente:{type:schema.Types.ObjectId,ref:'clientes'}
})

module.exports = mongoose.model('cursosFavoritos', modelSchema);