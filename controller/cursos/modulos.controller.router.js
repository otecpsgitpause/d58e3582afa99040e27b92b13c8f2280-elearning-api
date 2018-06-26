'use strict'

var express = require('express');
var secureRouter = express.Router();
var respuesta = require('../respuesta');
var rutas = require('./modulos.controller.router.json');
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
     * Método registra un módulo
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;
        let moduloSave = new schemaModulo();
        moduloSave = param.modulo;
        schemaModulo.create(moduloSave).then((docModulo) => {
            schemaCurso.findOne({ "_id": param.cursoId }).then((docCurso) => {
                docCurso.modulos.push(docModulo._id);
                schemaCurso.findOneAndUpdate({ "_id": docCurso._id }, docCurso).then((docCursoUpdate) => {
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: { docCursoUpdate: docCurso, docModulo: docModulo } });
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
     * Método actualiza un módulo
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;


        schemaModulo.findOneAndUpdate({ "_id": param.moduloDoc._id }, param.moduloDoc).then((docUpdate) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: param.moduloDoc });
        }).catch(err => {
            console.log({ errorCatch: err });
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })


    } catch (e) {
        console.log({ errorCatchtry: e });
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }

}).post(rutas[2].ruta, (req, res, next) => {
    /**
     * Método envia módulos de un curso
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;

        schemaCurso.findOne({ "_id": param.cursoId }).populate('modulos').populate('area').exec().then((doc) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: doc });
        }).catch(err => {

            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })


    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }

}).post(rutas[3].ruta, (req, res, next) => {
    /**
     * Método envia un módulo de un curso
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;

        schemaModulo.findOne({ "_id": param }).populate('clases').populate('pruebas').then((doc) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: doc });
        }).catch(err => {

            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[4].ruta, (req, res, next) => {
    /**
     * Método elimina un módulo
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;
        console.log({ paramDelete: param });
        schemaModulo.findOne({ "_id": param.moduloId }).populate('clases').populate('pruebas').exec()
            .then((docModulo) => {

                let secuencia = {
                    updateCurso: () => {
                        return new Promise((resolve, reject) => {
                            schemaCurso.findOne({ "_id": param.cursoId }).populate('modulos').exec().then((docCurso) => {
                                console.log({ docCurso: docCurso, docModulo: docModulo });
                                let idxModulo = _.findIndex(docCurso.modulos, (o) => {
                                    return o._id.toString() == docModulo._id.toString();
                                })


                                if (idxModulo > -1) {
                                    docCurso.modulos.splice(idxModulo, 1);
                                    schemaCurso.updateOne({ "_id": docCurso._id }, docCurso).then((docCursoUpdate) => {
                                        resolve(true);
                                    })
                                } else {
                                    resolve(false);
                                }
                            })
                        })
                    },
                    deleteModulo: () => {
                        return new Promise((resolve, reject) => {
                            schemaModulo.deleteOne({ "_id": param.moduloId }).then((docDelete) => {
                                resolve(true);
                            })
                        })
                    },
                    populatePrueba: () => {
                        return new Promise((resolve, reject) => {
                            let contador = 0;
                            docModulo.pruebas.forEach((prueba, idx) => {
                                contador = contador + 1;
                                schemaPrueba.findOne({ "_id": prueba._id }).populate('preguntas').exec()
                                    .then((docPrueba) => {
                                        docModulo.pruebas.splice(idx, 1, docPrueba);
                                    })
                                if (contador == docModulo.pruebas == 0) {
                                    resolve(true);
                                }
                            });
                            if (docModulo.pruebas == 0) {
                                resolve(true);
                            }
                        })

                    },
                    deletePrueba: () => {
                        return new Promise((resolve, reject) => {
                            let contador = 0;
                            docModulo.pruebas.forEach((prueba, idx) => {
                                contador = contador + 1;
                                schemaPrueba.deleteOne({ "_id": prueba._id });
                                if (contador == docModulo.pruebas.length) {
                                    resolve(true);
                                }
                            })
                            if (docModulo.pruebas.length == 0) {
                                resolve(true);
                            }
                        })
                    },
                    deletePreguntas: () => {
                        return new Promise((resolve, reject) => {
                            let contador = 0;
                            docModulo.pruebas.forEach((prueba, idx) => {
                                contador = contador + 1;
                                prueba.preguntas.forEach((pregunta) => {
                                    schemaPregunta.deleteOne({ "_id": pregunta._id });
                                })

                                if (contador == docCurso.pruebas.length) {
                                    resolve(true);
                                }
                            })
                            if (docModulo.pruebas.length == 0) {
                                resolve(true);
                            }
                        })
                    },
                    deleteAlternativas: () => {
                        return new Promise((resolve, reject) => {
                            let contador = 0;
                            docModulo.pruebas.forEach((prueba, idx) => {
                                contador = contador + 1;
                                prueba.preguntas.forEach((pregunta) => {
                                    pregunta.alternativas.forEach((alternativa) => {
                                        schemaAlternativa.deleteOne({ "_id": alternativa._id });
                                    })

                                })

                                if (contador == docModulo.pruebas.length) {
                                    resolve(true);
                                }
                            })
                            if (docModulo.pruebas.length == 0) {
                                resolve(true);
                            }
                        })
                    },
                    deleteClase: () => {
                        return new Promise((resolve, reject) => {
                            let contador = 0;
                            docModulo.clases.forEach((clase, idx) => {

                                console.log({ deleteClase: clase });
                                contador = contador + 1;
                                schemaClase.deleteOne({ "_id": clase._id }).then((resDelete) => {

                                    console.log({ resDeleteClase: resDelete });
                                }).catch(err => {

                                    console.log({ errorEliminarClase: true });

                                });

                                if (contador == docModulo.clases.length) {
                                    resolve(true);
                                }
                            })

                            if (docModulo.clases.length == 0) {
                                resolve(true);
                            }
                        })
                    },
                    deleteContenido: () => {
                        return new Promise((resolve, reject) => {
                            let contador = 0;
                            docModulo.clases.forEach((clase, idx) => {
                                contador = contador + 1;
                                console.log({ deleteContenido: clase.contenidos });
                                clase.contenidos.forEach((contenido) => {
                                    schemaContenido.deleteOne({ "_id": contenido }).then((resDelete) => {
                                        console.log({ resDeleteContenido: resDelete });
                                    }).catch(err => {

                                        console.log({ errorEliminarContenido: true });

                                    });
                                })

                                if (contador == docModulo.clases.length) {
                                    resolve(true);
                                }
                            })

                            if (docModulo.clases.length == 0) {
                                resolve(true);
                            }
                        })
                    }
                }


                const steps = [
                    secuencia.populatePrueba, secuencia.deleteAlternativas, secuencia.deletePreguntas,
                    secuencia.deletePrueba, secuencia.deleteContenido, secuencia.deleteClase, secuencia.updateCurso,
                    secuencia.deleteModulo
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
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
    }
}).post(rutas[5].ruta, (req, res, next) => {
    /**
     * Método registra orden módulo
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;

        schemaCurso.findOne({ "_id": param.cursoId }).populate('modulos').exec().then((docCurso) => {
            let secuencia = {

                updateModulos: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        param.modulos.forEach((modulo, idx) => {
                            contador = contador + 1;
                            schemaModulo.updateOne({ "_id": modulo._id }, modulo).then((docUpdate) => {

                            })

                            if (contador == param.modulos.length) {
                                resolve(true);
                            }
                        })

                        if (param.modulos.length == 0) {
                            resolve(false);
                        }
                    })
                }


            }

            const steps = [
                secuencia.updateModulos
            ];
            const sequence = new Sequence(steps, { interval: 1000 });
            sequence.on('success', (data, index) => {
                if (index == 0) {
                    console.log({ ordenModuloData: data, idx: index });
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

                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: true });


            });
        });


    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[6].ruta, (req, res, next) => {
    /**
     * Método verifica si se puede activar un módulo
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;

        schemaModulo.findOne({'_id':param}).populate('clases').populate('pruebas').exec().then((docModulo)=>{
            let validaciones = [];
            let secuencia={
                validacionRegister: (param) => {
                    let valida = {
                        type: param.type,
                        estado: param.estado,
                        motivo: param.motivo
                    }
                    validaciones.push(valida);
                },
                existenciaClases:()=>{
                    return new Promise((resolve,reject)=>{
                        if(docModulo.clases.length==0){
                            secuencia.validacionRegister({ type: 'Clases', estado: 'Fallo', motivo: 'Sin clases' });
                            resolve(true);
                        }
                        else{
                            secuencia.validacionRegister({ type: 'Clases', estado: 'Ok', motivo: 'Clases registradas' });
                            resolve(true);
                        }
                    })
                },
                existenciaContenidosClase:()=>{
                    return new Promise((resolve,reject)=>{
                        let contador=0;
                        let existenciaContenido= new Array();
                        docModulo.clases.forEach((clase)=>{
                            contador=contador+1;
                            existenciaContenido.push(clase.contenidos.length);
                            if(contador==docModulo.clases.length){
                                if(existenciaContenido.indexOf(0)>-1){
                                    secuencia.validacionRegister({ type: 'Contenidos', estado: 'Fallo', motivo: 'Hay clases sin contenidos' });
                                    resolve(true);
                                }else if(existenciaContenido.indexOf(0)==-1){
                                    secuencia.validacionRegister({ type: 'Contenidos', estado: 'Ok', motivo: 'Clases con sus contenidos' });
                                    resolve(true);
                                }
                            }
                        })
                        if(docModulo.clases.length==0){
                            secuencia.validacionRegister({ type: 'Contenidos', estado: 'Fallo', motivo: 'Sin contenidos' });
                            resolve(true);
                        }
                    })
                },
                enviaData:()=>{
                    return new Promise((resolve,reject)=>{
                        resolve({docModulo:docModulo,validaciones:validaciones});
                    })
                }
            }

            const steps = [
                secuencia.existenciaClases,secuencia.existenciaContenidosClase,secuencia.enviaData
            ];
            const sequence = new Sequence(steps, { interval: 1000 });
            sequence.on('success', (data, index) => {
                if (index == 2) {
                    console.log({ activarModulo: data.value, idx: index });
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
})

module.exports = secureRouter;