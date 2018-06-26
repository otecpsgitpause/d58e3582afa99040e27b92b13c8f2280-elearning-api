'use strict'

var express = require('express');
var secureRouter = express.Router();
var respuesta = require('../respuesta');
var rutas = require('./pruebas.controller.router.json');
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
     * Método envía todas las pruebas de un componente
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;
        console.log({ getPruebasParam: param });


        if (param.type == 'Cursos') {

            schemaCurso.findOne({ "_id": param.cursoId }).populate('pruebas').exec().then((docCurso) => {

                let secuencia = {

                    populatePreguntas: () => {
                        return new Promise((resolve, reject) => {
                            let contador = 0;
                            docCurso.pruebas.forEach((prueba, idx) => {
                                contador = contador + 1;
                                prueba.preguntas.forEach((pregunta, idxPregunta) => {
                                    schemaPregunta.findOne({ "_id": pregunta._id }).populate('alternativas').exec().then((docPregunta) => {
                                        docCurso.pruebas[idx].preguntas.splice(idxPregunta, 1, docPregunta);
                                    })
                                })

                                if (contador == docCurso.pruebas.length) {
                                    resolve(true);
                                }

                            });

                            if (docCurso.pruebas.length == 0) {
                                resolve(true);
                            }
                        })
                    }

                }

                const steps = [
                    secuencia.populatePreguntas
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

                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docCurso });


                });


            })

        }else if(param.type=='Modulos'){
            schemaModulo.findOne({ "_id": param.moduloId }).populate('pruebas').exec().then((docModulo) => {
                
                                let secuencia = {
                
                                    populatePreguntas: () => {
                                        return new Promise((resolve, reject) => {
                                            let contador = 0;
                                            docModulo.pruebas.forEach((prueba, idx) => {
                                                contador = contador + 1;
                                                prueba.preguntas.forEach((pregunta, idxPregunta) => {
                                                    schemaPregunta.findOne({ "_id": pregunta._id }).populate('alternativas').exec().then((docPregunta) => {
                                                        docModulo.pruebas[idx].preguntas.splice(idxPregunta, 1, docPregunta);
                                                    })
                                                })
                
                                                if (contador == docModulo.pruebas.length) {
                                                    resolve(true);
                                                }
                
                                            });
                
                                            if (docModulo.pruebas.length == 0) {
                                                resolve(true);
                                            }
                                        })
                                    }
                
                                }
                
                                const steps = [
                                    secuencia.populatePreguntas
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
        }



    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
    }
}).post(rutas[1].ruta, (req, res, next) => {
    /**
     * Método registra una prueba
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;

        console.log({ param: param });
        let savePrueba = new schemaPrueba()
        savePrueba = param.prueba;
        schemaPrueba.create(savePrueba).then((docPrueba) => {
            if (param.paramsReq.type == 'Cursos') {
                schemaCurso.findOne({ "_id": param.paramsReq.cursoId }).then((docCurso) => {
                    docCurso.pruebas.push(docPrueba._id);
                    schemaCurso.findOneAndUpdate({ "_id": docCurso._id }, docCurso).then((docCursoUpdate) => {
                        respuesta.sendDev({ req: req, res: res, code: 200, respuesta: { docActive: docCurso, docPrueba: docPrueba } });
                    })
                })
            }else if(param.paramsReq.type == 'Modulos'){
                schemaModulo.findOne({ "_id": param.paramsReq.moduloId }).then((docModuloFind) => {
                    docModuloFind.pruebas.push(docPrueba._id);
                    schemaModulo.updateOne({ "_id": docModuloFind._id }, docModuloFind).then((docModuloUpdate) => {
                        respuesta.sendDev({ req: req, res: res, code: 200, respuesta: { docActive: docModuloFind, docPrueba: docPrueba } });
                    })
                })
            }


        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })



    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
    }
}).post(rutas[2].ruta, (req, res, next) => {
    /**
     * Método envía una prueba
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;

        schemaPrueba.findOne({ "_id": param.pruebaId }).populate('preguntas').exec().then((docPrueba) => {
            let secuencia = {

                populatePreguntas: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docPrueba.preguntas.forEach((pregunta, idx) => {
                            contador = contador + 1;
                            schemaPregunta.findOne({ "_id": pregunta._id }).populate('alternativas').exec().then((docPregunta) => {
                                docPrueba.preguntas.splice(idx, 1, docPregunta);
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

                respuesta.sendDev({ req: req, res: res, code: 200, respuesta: docPrueba });


            });



        })


    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: false });
    }

}).post(rutas[3].ruta, (req, res, next) => {
    /**
     * Método actualiza una prueba
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;

        schemaPrueba.update({ "_id": param.prueba._id }, param.prueba).then((docUpdatePrueba) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: param.prueba });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })

    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[4].ruta, (req, res, next) => {
    /**
     * Método elimina una prueba
     * @param param
     */

     try{

        let data = req.body.data;
        let param = data.param;

     
            let secuencia ={
                deleteRefPrueba:()=>{
                    return new Promise((resolve,reject)=>{
                        if(param.type=='Cursos'){
                            schemaCurso.findOne({"_id":param.cursoId}).populate('pruebas').exec().then((docCurso)=>{
                                let idxPrueba = _.findIndex(docCurso.pruebas,(o)=>{
                                    return o._id==param.pruebaId;
                                })

                                if(idxPrueba>-1){
                                    docCurso.pruebas.splice(idxPrueba,1);
                                    schemaCurso.updateOne({"_id":param.cursoId},docCurso).then((docUpdatePrueba)=>{
                                        resolve(true);
                                    })
                                }
                            })
                        }else if(param.type=="Modulos"){
                            schemaModulo.findOne({"_id":param.moduloId}).populate('pruebas').exec().then((docModuloFind)=>{
                                let idxPrueba = _.findIndex(docModuloFind.pruebas,(o)=>{
                                    return o._id==param.pruebaId;
                                })

                                if(idxPrueba>-1){
                                    docModuloFind.pruebas.splice(idxPrueba,1);
                                    schemaModulo.updateOne({"_id":param.moduloId},docModuloFind).then((docUpdatePrueba)=>{
                                        resolve(true);
                                    })
                                }
                            })
                        }
                    })
                },
                deletePrueba:()=>{
                    return new Promise((resolve,reject)=>{
                        schemaPrueba.deleteOne({"_id":param.pruebaId}).then((docDelete)=>{
                            resolve(true);
                        })
                    })
                },
                deletePreguntas:()=>{
                    return new Promise((resolve,reject)=>{
                        schemaPrueba.findOne({"_id":param.pruebaId}).populate('preguntas').exec().then((docPrueba)=>{
                            let contador=0;
                            docPrueba.preguntas.forEach((pregunta,idx)=>{
                                contador=contador+1;
                                schemaPregunta.deleteOne({"_id":pregunta._id}).then((docDelete)=>{

                                })

                                if(contador==docPrueba.preguntas.length){
                                    resolve(true);
                                }
                            })

                            if(docPrueba.preguntas.length==0){
                                resolve(true);
                            }

                        })
                    })
                },
                deleteAlternativas:()=>{
                    return new Promise((resolve,reject)=>{
                        schemaPrueba.findOne({"_id":param.pruebaId}).populate('preguntas').exec().then((docPrueba)=>{
                            let contador=0;
                            docPrueba.preguntas.forEach((pregunta,idx)=>{
                                contador=contador+1;
                                
                                pregunta.alternativas.forEach((alternativa,idxAlternativa)=>{
                                    schemaAlternativa.deleteOne({"_id":alternativa}).then((docAlternativa)=>{

                                    })
                                })

                                if(contador==docPrueba.preguntas.length){
                                    resolve(true);
                                }
                            })

                            if(docPrueba.preguntas.length==0){
                                resolve(true);
                            }

                        })
                    })
                },
                obtenerDocActivo:()=>{
                    return new Promise((resolve,reject)=>{
                        if(param.type=='Cursos'){
                            schemaCurso.findOne({"_id":param.cursoId}).populate('pruebas').exec().then((docCurso)=>{
                                resolve(docCurso);
                            })
                        }else if(param.type=="Modulos"){
                            schemaModulo.findOne({"_id":param.moduloId}).populate('pruebas').exec().then((docModulo)=>{
                                resolve(docModulo);
                            })
                        }
                    })
                }
            }

            const steps = [
                secuencia.deleteAlternativas,secuencia.deletePreguntas, secuencia.deleteRefPrueba,secuencia.deletePrueba,secuencia.obtenerDocActivo
            ];
            const sequence = new Sequence(steps, { interval: 1000 });
            sequence.on('success', (data, index) => {
                if(index==4){
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: data });
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
        

        console.log({deletePrueba:param});

     }catch(e){}

})

module.exports = secureRouter;