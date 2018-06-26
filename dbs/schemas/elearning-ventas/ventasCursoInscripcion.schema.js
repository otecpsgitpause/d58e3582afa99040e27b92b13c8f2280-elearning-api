var mongoose = require('mongoose');
var schema = mongoose.Schema;

var modelSchema = new schema({
    curso:{type:schema.Types.ObjectId,ref:'cursos'},
    precio:Number,
    fechaIncripcion:String
})

module.exports = mongoose.model('ventaCursoIncripcion', modelSchema);