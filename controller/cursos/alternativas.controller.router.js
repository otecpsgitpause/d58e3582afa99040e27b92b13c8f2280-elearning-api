'use strict'

var express = require('express');
var secureRouter = express.Router();
var respuesta = require('../respuesta');
var rutas = require('./alternativas.controller.router.json');
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
         * Método guarda una alternativa
         * @param param
         */

    try {
        let data = req.body.data;
        let param = data.param;

        let secuencia = {
            saveAlternativa: () => {
                return new Promise((resolve, reject) => {
                    let saveAlternativa = new schemaAlternativa();
                    saveAlternativa = param.alternativa;
                    schemaAlternativa.create(saveAlternativa).then((docAlternativa) => {
                        if (Object.keys(param.docPregunta).indexOf('alternativas') == -1) {
                            param.docPregunta.alternativas = new Array();
                            param.docPregunta.alternativas.push(docAlternativa);
                            schemaPregunta.findOneAndUpdate({ "_id": param.docPregunta._id }, param.docPregunta).then((docUpdatePregunta) => {
                                resolve(true);

                            })
                        } else {
                            param.docPregunta.alternativas.push(docAlternativa._id);
                            schemaPregunta.findOneAndUpdate({ "_id": param.docPregunta._id }, param.docPregunta).then((docUpdatePregunta) => {
                                resolve(true);
                            })
                        }



                    }).catch(err => {
                        console.log({ err: err });
                        resolve(false);

                    })
                })
            },
            updateAlternativas: () => {
                return new Promise((resolve, reject) => {
                    schemaPregunta.findOne({ "_id": param.docPregunta._id }).populate('alternativas').exec().then((docPregunta) => {
                        let contador = 0;
                        param.docPregunta.alternativas.forEach((alternativa, idx) => {
                            contador = contador + 1;
                            schemaAlternativa.updateOne({ "_id": alternativa._id }, alternativa).then((docUpdate) => {

                            })

                            if (contador == docPregunta.alternativas.length) {
                                resolve(true);
                            }
                        })

                        if (docPregunta.alternativas.length == 0) {
                            resolve(true);
                        }

                    })
                })
            },
            populatePregunta: () => {
                return new Promise((resolve, reject) => {
                    schemaPregunta.findOne({ "_id": param.docPregunta._id }).populate('alternativas').exec().then((docPregunta) => {
                        param.docPregunta = docPregunta;
                        resolve(true);
                    })
                })
            }
        }

        const steps = [
            secuencia.saveAlternativa, secuencia.updateAlternativas, secuencia.populatePregunta
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
                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: param.docPregunta });
            }, 3000);



        });



    } catch (e) {

        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[1].ruta, (req, res, next) => {
    /**
         * Método actualiza una alternativa
         * @param param
         */

    try {

        let data = req.body.data;
        let param = data.param;
        console.log({paramUpdate:param});
        let secuencia = {
            updateAlternativa: () => {
                return new Promise((resolve, reject) => {
                    schemaAlternativa.updateOne({ "_id": param.alternativa._id }, param.alternativa).then((docAlternativa) => {
                        resolve(true);
                    })
                })
            },
            updateAlternativasCorrecta: () => {
                return new Promise((resolve, reject) => {
                    let contador = 0;
                    param.docPregunta.alternativas.forEach((alternativa, idx) => {
                        contador = contador + 1;
                        schemaAlternativa.updateOne({ "_id": alternativa._id }, alternativa).then((docUpdate) => {

                        })
                        if (contador == param.docPregunta.alternativas.length) {
                            resolve(true);
                        }
                    });

                    if(param.docPregunta.alternativas.length==0){
                        resolve(true);
                    }

                })
            },
            populatePregunta: () => {
                return new Promise((resolve, reject) => {
                    schemaPregunta.findOne({ "_id": param.docPregunta._id }).populate('alternativas').exec().then((docPregunta) => {
                        param.docPregunta = docPregunta;
                        resolve(true);
                    })
                })
            }
        }

        const steps = [
            secuencia.updateAlternativa, secuencia.updateAlternativasCorrecta, secuencia.populatePregunta
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
                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: param.docPregunta });
            }, 3000);



        });



    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[2].ruta, (req, res, next) => {
    /**
         * Método elimina una alternativa
         * @param param
         */

    try {

        let data = req.body.data;
        let param = data.param;

        let secuencia = {
            deleteAlternativa: () => {
                return new Promise((resolve, reject) => {
                    schemaAlternativa.deleteOne({ "_id": param.alternativa._id }).then((docDeleteAlternativa) => {
                        let idxAlternativa = _.findIndex(param.docPregunta.alternativas, (o) => {
                            return o._id == param.alternativa._id;
                        })

                        if (idxAlternativa > -1) {
                            console.log({idxAlternativaFind:idxAlternativa});
                            param.docPregunta.alternativas.splice(idxAlternativa, 1);
                            schemaPregunta.updateOne({ "_id": param.docPregunta._id }, param.docPregunta).then((docUpdateAlternativa) => {
                                resolve(true);
                            })
                        }

                    })
                })
            },
            populatePregunta: () => {
                return new Promise((resolve, reject) => {
                    schemaPregunta.findOne({ "_id": param.docPregunta._id }).populate('alternativas').exec().then((docPregunta) => {
                        param.docPregunta = docPregunta;
                        resolve(true);
                    })
                })
            },
            correctaAlternativa: () => {
                return new Promise((resolve, reject) => {

                    if(param.docPregunta.alternativas.length>0){
                        let idxAlternativa = _.findIndex(param.docPregunta.alternativas,(o)=>{
                            return o.correcta ==true;
                        })
    
                        if(idxAlternativa==-1){
                            param.docPregunta.alternativas[0].correcta=true;
                            param.docPregunta.alternativas.splice(idxAlternativa,1,param.docPregunta.alternativas[0]);
                            schemaAlternativa.updateOne({"_id":param.docPregunta.alternativas[0]._id},param.docPregunta.alternativas[0]).then((docUpdate)=>{
                                resolve(true);
                            })
                        }
                    }else{
                        resolve(true);
                    }

                    
                    
                })
            }
        }

        const steps = [
            secuencia.deleteAlternativa, secuencia.populatePregunta,secuencia.correctaAlternativa
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
                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: param.docPregunta });
            }, 3000);



        });


    } catch (e) {

        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
})

module.exports = secureRouter;