var configuracion = require('./configuracion.json');
var crypto = require('../../crypto/cryptojs');
var mongoose = require('mongoose');
var mailReport= require('../../mail/mail-info-server');
var dbcon =process.env.conexiondb;
const mongoOptions={
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
}
var conexion= {

    conectar:()=>{
        
        mongoose.disconnect().then(()=>{
            console.log('conectando db');
            mongoose.connect(dbcon,mongoOptions).then((status)=>{
                if(status!=null){
                    console.log('base de datos conextado');
                }
                
            },err=>{console.log({errorconexion:err});})
            

        })


    }
}


module.exports= conexion;