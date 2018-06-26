'use strict'

var express = require('express');
var secureRouter = express.Router();
var respuesta = require('../respuesta');
var rutas = require('./contenidos.controller.router.json');
var schemaCurso = require('../../dbs/schemas/cursos/cursos.schema');
var schemaModulo = require('../../dbs/schemas/cursos/modulos.cursos.schema');
var schemaClase = require('../../dbs/schemas/cursos/clases.modulos.cursos.schema');
var schemaContenido = require('../../dbs/schemas/cursos/contenidos.clases.modulos.cursos.schema');
var schemaPrueba = require('../../dbs/schemas/cursos/pruebas.cursos.modulos.clases.schema');
var schemaPregunta = require('../../dbs/schemas/cursos/preguntas.pruebas.curso.schema');
var schemaAlternativa = require('../../dbs/schemas/cursos/alternativas.preguntas.pruebas.curso.schema');
var schemaArea = require('../../dbs/schemas/cursos/areas.schema');
var _ = require('lodash');
const Sequence = require('@lvchengbin/sequence');

secureRouter.post(rutas[0].ruta, (req, res, next) => {
    /**
             * Método envía un contenido
             * @param param
             */


    try {

        let data = req.body.data;
        let param = data.param


        schemaContenido.findOne({ "_id": param.contenidoId }).then((docContenido) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docContenido });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }

}).post(rutas[1].ruta, (req, res, next) => {
    /**
             * Método registra un contenido
             * @param param
             */

    try {

        let data = req.body.data;
        let param = data.param

        schemaClase.findOne({ "_id": param.claseId }).then((docClase) => {



            let saveContenido = new schemaContenido();
            saveContenido = param.contenido;
            schemaContenido.create(saveContenido).then((docContenido) => {
                docClase.contenidos.push(docContenido._id);
                schemaClase.findOneAndUpdate({ "_id": param.claseId }, docClase).then((docUpdateclase) => {
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docContenido });
                })
            }).catch(err => {
                respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
            })




        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })


    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[2].ruta, (req, res, next) => {
    /**
             * Método actualiza un contenido
             * @param param
             */

    try {

        let data = req.body.data;
        let param = data.param;



        schemaContenido.findOneAndUpdate({ "_id": param.contenido._id }, param.contenido).then((docUpdateContenido) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: param.contenido });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })


    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }

}).post(rutas[3].ruta, (req, res, next) => {
    /**
             * Método envía todos los contenidos clase
             * @param param
             */

    try {

        let data = req.body.data;
        let param = data.param


        schemaClase.findOne({ "_id": param.claseId }).populate('contenidos').exec().then((docClase) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docClase });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }

}).post(rutas[3].ruta, (req, res, next) => {
    /**
             * Método elimina un contenido
             * @param param
             */

    try {

        let data = req.body.data;
        let param = data.param

        schemaContenido.deleteOne({"_id":param.contenidoId}).then((resDelete)=>{
            console.log({resDelete:resDelete});


            
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })

     } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
})


module.exports = secureRouter;