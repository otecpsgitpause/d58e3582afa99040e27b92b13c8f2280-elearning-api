'use strict'

var express = require('express');
var secureRouter = express.Router();
var respuesta = require('../respuesta');
var rutas = require('./preguntas.controller.router.json');
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
     * Método envia las preguntas de una prueba con sus alternativas
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;

        schemaPrueba.findOne({ "_id": param.prueba._id }).populate('preguntas').exec().then((docPrueba) => {
            let secuencia = {

                populatePreguntas: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docPrueba.preguntas.forEach((pregunta, idx) => {
                            contador = contador + 1;
                            schemaPregunta.findOne({ "_id": pregunta._id }).populate('alternativas').exec().then((docPregunta) => {
                                docPrueba.preguntas.splice(idx, 1, docPregunta);
                                console.log({ docPreguntaPopulate: docPregunta });
                                docPregunta.alternativas.forEach((alternativa) => {
                                    console.log({ alternativa: alternativa });
                                })

                            })


                            if (contador == docPrueba.preguntas.length) {
                                resolve(true);
                            }
                        })
                        if (docPrueba.preguntas.length == 0) {
                            resolve(true);
                        }

                    })
                }
            }

            const steps = [
                secuencia.populatePreguntas
            ];

            const sequence = new Sequence(steps, { interval: 50 });
            sequence.on('success', (data, index) => {
                console.log({ success: data, index: index });
                // execute when each step in sequence succeed
            });

            sequence.on('failed', (data, index) => {
                console.log({ failed: data, index: index });
                // execute when each step in sequence failed
            });

            sequence.on('end', () => {
                // execute after finishing all steps in the sequence
                console.log('e terminado');
                setTimeout(() => {
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docPrueba });
                }, 3000);



            });
        })



    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }

}).post(rutas[1].ruta, (req, res, next) => {
    /**
         * guarda una pregunta
         * @param param
         */

    try {

        let data = req.body.data;
        let param = data.param;
        let savePregunta = new schemaPregunta();
        savePregunta = param.pregunta;
        schemaPregunta.create(savePregunta).then((docPregunta) => {
            schemaPrueba.findOne({ "_id": param.pruebaId }).then((docPrueba) => {
                docPrueba.preguntas.push(docPregunta._id);
                schemaPrueba.findOneAndUpdate({ "_id": param.pruebaId }, docPrueba).then((docPruebaUpdate) => {
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docPregunta });
                })
            })

        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })


    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }


}).post(rutas[2].ruta, (req, res, next) => {
    /**
             * Método actualiza una pregunta
             * @param param
             */

    try {
        let data = req.body.data;
        let param = data.param

        schemaPregunta.findOneAndUpdate({ "_id": param.pregunta._id }, param.pregunta).then((docPreguntaUpdate) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: param.pregunta });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[3].ruta, (req, res, next) => {
    /**
         * Método elimina una pregunta
         * @param param
         */

    try {

        let data = req.body.data;
        let param = data.param;
        let docPrueba=null;
        let secuencia = {
            deletePregunta: () => {
                return new Promise((resolve, reject) => {
                    
                        schemaPrueba.findOne({"_id":param.pruebaId}).populate('preguntas').exec().then((docPruebaItem)=>{
                            docPruebaItem.preguntas.forEach((pregunta)=>{
                                console.log({preguntaPrueba:pregunta});
                            })
                            let idxPregunta = _.findIndex(docPruebaItem.preguntas,(o)=>{
                                return o._id.toString() == param.docPregunta._id.toString();
                            })

                            if(idxPregunta>-1){
                                docPruebaItem.preguntas.splice(idxPregunta,1);
                                schemaPrueba.updateOne({"_id":docPruebaItem._id},docPruebaItem).then((docUpdatePrueba)=>{
                                    console.log('pregunta encontrada y eliminada');
                                    schemaPregunta.deleteOne({"_id":param.docPregunta._id}).then((docDelete)=>{
                                        resolve(true);
                                    })
                                    
                                })
                                
                            }else{
                                console.log('no se encontro la pregunta a eliminar');
                                resolve(true);
                            }

                        })
                    
                })
            },
            deleteAlternativas:()=>{
                return new Promise((resolve, reject) => {
                    
                    schemaPregunta.findOne({"_id":param.docPregunta._id}).populate('alternativas').exec().then((docPregunta)=>{
                        let contador=0;
                        docPregunta.alternativas.forEach((alternativa)=>{
                            contador=contador+1;
                            schemaAlternativa.deleteOne({"_id":alternativa._id}).then((docDelete)=>{

                            })

                            if(contador==docPregunta.alternativas.length){
                                resolve(true);
                            }
                        })

                        if(docPregunta.alternativas.length==0){
                            resolve(true);
                        }
                    })
                    
                })  
            }
        }

        const steps = [
            secuencia.deleteAlternativas,secuencia.deletePregunta
        ];

        const sequence = new Sequence(steps, { interval: 50 });
        sequence.on('success', (data, index) => {
            console.log({ success: data, index: index });
            // execute when each step in sequence succeed
        });

        sequence.on('failed', (data, index) => {
            console.log({ failed: data, index: index });
            // execute when each step in sequence failed
        });

        sequence.on('end', () => {
            // execute after finishing all steps in the sequence
            console.log('e terminado');
            setTimeout(() => {
                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: true });
            }, 3000);



        });




    } catch (e) {
        console.log({error:e});
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
    }
})

module.exports = secureRouter;