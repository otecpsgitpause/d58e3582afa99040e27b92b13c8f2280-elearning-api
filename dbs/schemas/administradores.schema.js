var mongoose = require('mongoose');
var schema = mongoose.Schema;

var datosPersonales = new schema({
    nombre: String,
    direccion: String,
    telefono: String,
    sexo: String
})


var modelSchema = new schema({
    datosPersonales: datosPersonales,
    rol: String,
    correo: String
})




module.exports = mongoose.model('administradores', modelSchema);