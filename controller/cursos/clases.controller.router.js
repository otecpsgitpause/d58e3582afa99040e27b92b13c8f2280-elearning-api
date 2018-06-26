'use strict'

var express = require('express');
var secureRouter = express.Router();
var respuesta = require('../respuesta');
var rutas = require('./clases.controller.router.json');
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
         * Método registra una clase
         * @param param
         */

    try {

        let data = req.body.data;
        let param = data.param;

        let saveClase = new schemaClase();
        saveClase = param.clase;

        schemaClase.create(saveClase).then((docClase) => {
            schemaModulo.findOne({ "_id": param.moduloId }).then((docModulo) => {
                docModulo.clases.push(docClase._id);
                schemaModulo.findOneAndUpdate({ "_id": docModulo._id }, docModulo).then((docClaseUpdate) => {
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docClase });
                }).catch(err => {
                    respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
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
}).post(rutas[1].ruta, (req, res, next) => {
    /**
    * Método envía una clase con los contenidos
    * @param param
    */

    try {

        let data = req.body.data;
        let param = data.param;

        schemaClase.findOne({ "_id": param.claseId }).populate('contenidos').exec().then((docClase) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docClase });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })


    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[2].ruta, (req, res, next) => {
    /**
    * Método actualiza una clase
    * @param param
    */

    try {
        let data = req.body.data;
        let param = data.param;

        console.log({ paramUpdate: param });
        schemaClase.findOneAndUpdate({ "_id": param.clase._id }, param.clase).then((docUpdate) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: param.clase });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[3].ruta, (req, res, next) => {
    /**
    * Método envía las clases de un módulo con los contenidos
    * @param param
    */

    try {

        let data = req.body.data;
        let param = data.param;
        console.log({ oaram: param });
        schemaModulo.findOne({ "_id": param.moduloId }).populate('clases').exec().then((docModulo) => {
            let secuencia = {
                populateContenidos: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docModulo.clases.forEach((clase, idx) => {
                            contador = contador + 1;
                            schemaClase.findOne({ "_id": clase._id }).populate('contenidos').exec().then((docClase) => {
                                docModulo.clases.splice(idx, 1, docClase);
                            })

                            if (docModulo.clases.length == contador) {
                                resolve(true);
                            }

                        });

                        if (docModulo.clases.length == 0) {
                            resolve(true);
                        }
                    })
                }
            }
            const steps = [
                secuencia.populateContenidos, null
            ];
            const sequence = new Sequence(steps, { interval: 1000 });
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
                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docModulo });


            });

        })





    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[4].ruta, (req, res, next) => {
    /**
    * Método elimina una clase con sus contenidos
    * @param param
    */

    try {
        let data = req.body.data;
        let param = data.param;

        schemaClase.findOne({ "_id": param.claseId }).populate('contenidos').exec().then((docClase) => {
            let secuencia = {
                deleteContenidos: () => {
                    console.log({ docClase: docClase });
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docClase.contenidos.forEach((contenido) => {
                            contador = contador + 1;
                            schemaContenido.deleteOne({ "_id": contenido._id }).then((docDelete) => {

                            })

                            if (contador == docClase.contenidos.length) {
                                resolve(true);
                            }
                        })


                        if (docClase.contenidos.length == 0) {
                            resolve(true);
                        }
                    })
                },
                deleteClase: () => {
                    return new Promise((resolve, reject) => {
                        schemaClase.deleteOne({ "_id": param.claseId }).then((docDelete) => {
                            resolve(true);
                        })
                    })
                },
                deleteRefModulo: () => {
                    return new Promise((resolve, reject) => {
                        schemaModulo.findOne({ "_id": param.moduloId }).populate('clases').then((docModulo) => {
                            let idxClase = _.findIndex(docModulo.clases, (o) => {
                                return o._id == param.claseId;
                            })
                            console.log({ idxClaseFind: idxClase });

                            if (idxClase > -1) {
                                docModulo.clases.splice(idxClase, 1);
                                schemaModulo.findOneAndUpdate({ "_id": param.moduloId }, docModulo).then((docModuloUpdate) => {
                                    resolve(true);
                                })
                            } else {
                                resolve(false);
                            }


                        })
                    })
                }
            }

            const steps = [
                secuencia.deleteContenidos, secuencia.deleteRefModulo, secuencia.deleteClase
            ];
            const sequence = new Sequence(steps, { interval: 1000 });
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
                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: true });


            });


        })

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 200, respuesta: false });
    }


}).post(rutas[5].ruta, (req, res, next) => {
    /**
    * Método elimina una clase con sus contenidos
    * @param param
    */

    try {

        let data = req.body.data;
        let param = data.param;

        schemaClase.findOne({ "_id": param }).populate('contenidos').exec().then((docClase) => {
            let validaciones = [];
            let secuencia = {
                validacionRegister: (param) => {
                    let valida = {
                        type: param.type,
                        estado: param.estado,
                        motivo: param.motivo
                    }
                    validaciones.push(valida);
                },
                verificarExistenciaContenidos: () => {
                    return new Promise((resolve, reject) => {
                        if (docClase.contenidos.length == 0) {
                            secuencia.validacionRegister({ type: 'Contenidos', estado: 'Fallo', motivo: 'Sin contenidos' });
                            resolve(true);
                        }else if(docClase.contenidos.length > 0){
                            secuencia.validacionRegister({ type: 'Contenidos', estado: 'Ok', motivo: 'Clase con contenidos' });
                            resolve(true);
                        }
                    })
                },
                enviaData:()=>{
                    return new Promise((resolve,reject)=>{
                        resolve({docClase:docClase,validaciones:validaciones});
                    })
                }
            }

            const steps = [
                secuencia.verificarExistenciaContenidos,secuencia.enviaData
            ];
            const sequence = new Sequence(steps, { interval: 1000 });
            sequence.on('success', (data, index) => {
                if (index == 1) {
                    console.log({ activarClase: data.value, idx: index });
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: data.value });
                }
                // execute when each step in sequence succeed
            });

            sequence.on('failed', (data, index) => {
                console.log({ failed: data, index: index });
                // execute when each step in sequence failed
            });

            sequence.on('end', () => {
                // execute after finishing all steps in the sequence



            });
        })

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[6].ruta, (req, res, next) => {
    /**
    * Método ordena las clases
    * @param param
    */

    try{

        let data = req.body.data;
        let param = data.param;

        let secuencia={
            updateClases:()=>{
                return new Promise((resolve,reject)=>{
                    let contador=0;
                    param.clases.forEach((clase)=>{
                        contador=contador+1;
                        schemaClase.updateOne({"_id":clase._id},clase).then((docClaseUpdate)=>{
                            
                        })

                        if(contador==param.clases.length){
                            resolve(true);
                        }
                    })

                    if(param.clases.length){
                        resolve(true);
                    }
                })
            }
        }


        const steps = [
            secuencia.updateClases
        ];
        const sequence = new Sequence(steps, { interval: 1000 });
        sequence.on('success', (data, index) => {
            if (index == 0) {
             
                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: true });
            }
            // execute when each step in sequence succeed
        });

        sequence.on('failed', (data, index) => {
            console.log({ failed: data, index: index });
            // execute when each step in sequence failed
        });

        sequence.on('end', () => {
            // execute after finishing all steps in the sequence



        });



    }catch(e){
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
    }

})
module.exports = secureRouter;
