var configuracion = require('./configuracion.json');
var crypto = require('../../crypto/cryptojs');
var mongoose = require('mongoose');
var mailReport= require('../../mail/mail-info-server');
var dbcon =process.env.configuraciondb;
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
        
            let db=dbcon;
            console.log({dbcon:dbcon});
            if(db.conexionuse==="dev"){
                if(db.conexiondev.encrypt==true){
                    crypto.decode(db.conexiondev.link).then((link)=>{
                        mongoose.connect(link,mongoOptions)
                        .then((status)=>{
                            console.log({mongodbstatus:'ok'});
                        },err=>{console.log({errorConexion:err});  mailReport.send({from:'sendmailotecpausa@gmail.com',
                    to:'rpemcampos@gmail.com',subject:'Conexion Mongodb Fail',
                text:'A fallado la conexión para mongodb db.conexiondev.link db.conexiondev.encrypt==true error:'+err})})
                    })
                }else{
                    mongoose.connect(db.conexiondev.link,mongoOptions)
                    .then((status)=>{
                        console.log({mongodbstatus:'ok'});
                    },err=>{console.log({errorConexion:err});mailReport.send({from:'sendmailotecpausa@gmail.com',
                    to:'rpemcampos@gmail.com',subject:'Conexion Mongodb Fail',
                text:'A fallado la conexión para mongodb db.conexiondev.link db.conexiondev.encrypt==false error:'+err})})
                }
            }else if(db.conexionuse==="prod"){
                if(db.conexionprod.encrypt==true){
                    crypto.decode(db.conexionprod.link).then((link)=>{
                        mongoose.connect(link,mongoOptions)
                        .then((status)=>{
                            console.log({mongodbstatus:'ok'});
                        },err=>{mailReport.send({from:'sendmailotecpausa@gmail.com',
                        to:'rpemcampos@gmail.com',subject:'Conexion Mongodb Fail',
                    text:'A fallado la conexión para mongodb db.conexionprod.link db.conexionprod.encrypt==true error:'+err})})
                    })
                }else{
                    mongoose.connect(db.conexionprod.link,mongoOptions)
                    .then((status)=>{
                        console.log({mongodbstatus:'ok'});
                    },err=>{mailReport.send({from:'sendmailotecpausa@gmail.com',
                    to:'rpemcampos@gmail.com',subject:'Conexion Mongodb Fail',
                text:'A fallado la conexión para mongodb db.conexionprod.link db.conexionprod.encrypt==false error:'+err})})
                }
            }

        })


    }
}


module.exports= conexion;