'use strict'

var express = require('express');
var secureRouter = express.Router();
var respuesta = require('../respuesta');
var rutas = require('./clientes.controller.router.json');
var schemaCurso = require('../../dbs/schemas/cursos/cursos.schema');
var schemaModulo = require('../../dbs/schemas/cursos/modulos.cursos.schema');
var schemaClase = require('../../dbs/schemas/cursos/clases.modulos.cursos.schema');
var schemaContenido = require('../../dbs/schemas/cursos/contenidos.clases.modulos.cursos.schema');
var schemaPrueba = require('../../dbs/schemas/cursos/pruebas.cursos.modulos.clases.schema');
var schemaPregunta = require('../../dbs/schemas/cursos/preguntas.pruebas.curso.schema');
var schemaAlternativa = require('../../dbs/schemas/cursos/alternativas.preguntas.pruebas.curso.schema');
var schemaArea = require('../../dbs/schemas/cursos/areas.schema');
var schemaCliente = require('../../dbs/schemas/elearning/clientes.schema');
var schemaCursosFavoritos = require('../../dbs/schemas/elearning/cursosFavoritos.schema');
var schemaInscCursoCliente = require('../../dbs/schemas/elearning/inscripcionCursosCliente.schema');
var schemaPruebaHojaRespuesta = require('../../dbs/schemas/elearning/hojarespuesta.prueba.schema');
var schemaAvancesCurso = require('../../dbs/schemas/elearning/avancesCurso.schema');
var _ = require('lodash');
var moment = require('moment-timezone');
var momento = require('moment');
const Sequence = require('@lvchengbin/sequence');

secureRouter.post(rutas[0].ruta, (req, res, next) => {
    /**
     * Método envía un cliente con sus cursos
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;

        schemaCliente.findOne({ "correo": param }).populate('inscripcionCursos').exec().then((docEstudiante) => {
            let secuencia = {
                populateCursos: () => {

                    return new Promise((resolve, reject) => {

                        let contador = 0;
                        docEstudiante.inscripcionCursos.forEach((inscripcion, idx) => {
                            contador = contador + 1;
                            if (inscripcion.fechaTermino === 'sindefinir') {
                                console.log({ findCursoInscripcion: inscripcion.curso });
                                schemaCurso.findOne({ "_id": inscripcion.curso }).populate('area').exec().then((docCurso) => {
                                    console.log({ cursoEncontrado: docCurso });
                                    inscripcion.curso = docCurso;
                                    docEstudiante.inscripcionCursos.splice(idx, 1, inscripcion);
                                })
                            }



                            if (contador == docEstudiante.inscripcionCursos.length) {
                                resolve(true);
                            }
                        })

                        if (docEstudiante.inscripcionCursos.length == 0) {
                            resolve(true);
                        }
                    })
                },
                getData() {
                    return new Promise((resolve, reject) => {
                        resolve(docEstudiante);
                    })
                }
            }

            const steps = [secuencia.populateCursos, secuencia.getData
            ];
            const sequence = new Sequence(steps, { interval: 1000 });
            sequence.on('success', (data, index) => {
                console.log({ data: data, index: index });
                if (index == 1) {
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
                console.log('e terminado en esta lecera');



            });
        })






    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[1].ruta, (req, res, next) => {
    /**
     * Método registra un curso a un cliente
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;




    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
    }
}).post(rutas[2].ruta, (req, res, next) => {
    /**
     * Método envía una inscripcion de un curso
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;


        //
        schemaInscCursoCliente.findOne({ "_id": param.inscripcion }).populate('curso').populate('avancescurso').exec().then((docInscripcion) => {
            let secuencia = {
                populateModulos: () => {
                    return new Promise((resolve, reject) => {
                        console.log({ fechaCreacion: docInscripcion.fechaCreacion });
                        schemaCurso.findOne({ "_id": docInscripcion.curso._id }).populate('modulos')
                            .populate('pruebas').exec().then((docCurso) => {
                                docInscripcion.curso = docCurso;
                                resolve(true);
                            })
                    })
                },
                getData: () => {
                    return new Promise((resolve, reject) => {
                        resolve(docInscripcion);
                    })
                }
            }


            const steps = [secuencia.populateModulos, secuencia.getData
            ];
            const sequence = new Sequence(steps, { interval: 1000 });
            sequence.on('success', (data, index) => {
                console.log({ data: data, index: index });
                if (index == 1) {
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: { doc: data.value, error: null } });
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
        console.log({ cursoInscrito: param });



    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: { doc: null, error: 'Error inesperado' } });
    }
}).post(rutas[3].ruta, (req, res, next) => {
    /**
     * Método envía un módulo con sus clases contenidos y pruebas populadas
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;

        console.log({ paramGetModulo: param });
        schemaModulo.findOne({ "_id": param.moduloId }).populate('clases').populate('pruebas').exec().then((docModulo) => {

            let secuencia = {
                populateContenidos: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docModulo.clases.forEach((clase, idx) => {


                            schemaClase.findOne({ "_id": clase._id }).populate('contenidos').exec().then((docClase) => {
                                console.log({ clasePopulate: docClase.contenidos });
                                docModulo.clases.splice(idx, 1, docClase);
                                contador = contador + 1;
                                if (contador == docModulo.clases.length) {
                                    resolve(true);
                                }
                            })



                        })

                        if (docModulo.clases.length == 0) {
                            resolve(true);
                        }

                    })
                },
                getData: () => {
                    return new Promise((resolve, reject) => {
                        resolve(docModulo);
                    })
                }
            }

            const steps = [secuencia.populateContenidos, secuencia.getData
            ];
            const sequence = new Sequence(steps, { interval: 1000 });
            sequence.on('success', (data, index) => {
                console.log({ data: data, index: index });
                if (index == 1) {
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: { doc: data.value, error: null } });
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
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: { doc: null, error: 'Error inesperado' } });
    }

}).post(rutas[4].ruta, (req, res, next) => {
    /**
     * Metodo inicializa una prueba a responder 
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;

        console.log({ getPruebaParam: param });

        schemaPrueba.findOne({ "_id": param.prueba }).populate('preguntas').exec().then((docPrueba) => {

            let secuencia = {
                populateAlternativas: () => {
                    return new Promise((resolve, reject) => {
                        let contador = 0;
                        docPrueba.preguntas.forEach((pregunta, idx) => {
                            schemaPregunta.findOne({ "_id": pregunta._id }).populate('alternativas').exec().then((docPregunta) => {
                                docPrueba.preguntas.splice(idx, 1, docPregunta);
                                contador = contador + 1;
                                if (contador == docPrueba.preguntas.length) {
                                    resolve(true);
                                }
                            })


                        })

                        if (docPrueba.preguntas.length == 0) {
                            resolve(true);
                        }

                    })
                },
                iniciarPrueba: () => {
                    return new Promise((resolve, reject) => {
                        schemaPruebaHojaRespuesta.findOne({ "prueba": param.prueba, "alumno": param.alumno }).then((docFind) => {
                            console.log({ docFind: docFind });
                            if (docFind == null) {
                                let now = moment().tz('America/Santiago').format();
                                console.log({ now: now });

                                let saveHojaRespuesta = new schemaPruebaHojaRespuesta();
                                let duracionSplit = docPrueba.duracion.split(':');
                                let addTime = momento(now).add(Number.parseInt(duracionSplit[0]), 'h').add(Number.parseInt(duracionSplit[1]), 'm').format();
                                saveHojaRespuesta.prueba = param.prueba;
                                saveHojaRespuesta.inicio = now;
                                saveHojaRespuesta.termino = addTime;
                                saveHojaRespuesta.alumno = param.alumno;

                                schemaPruebaHojaRespuesta.create(saveHojaRespuesta).then((docCreate) => {

                                    resolve(true);
                                })

                            } else {

                                resolve(true);
                            }
                        })
                    })
                },
                validarFechaPrueba: () => {
                    return new Promise((resolve, reject) => {
                        schemaPruebaHojaRespuesta.findOne({ "prueba": param.prueba, "alumno": param.alumno }).then((docHRP) => {
                            let now = moment().tz('America/Santiago').format();
                            let termino = moment(docHRP.termino).tz('America/Santiago').format();
                            let numberValid = momento(now).diff(moment(termino), 'seconds')
                            console.log({ diferenciaFecha: momento(now).diff(moment(termino), 'seconds') });
                            if (numberValid < 0) {
                                resolve({ contestar: true, docHRP: docHRP });
                            } else {
                                resolve({ contestar: false, docHRP: docHRP });
                            }
                        })

                    })
                },
                getData: () => {
                    return new Promise((resolve, reject) => {

                        secuencia.validarFechaPrueba().then((prueba) => {
                            if (prueba.contestar == true) {
                                schemaPruebaHojaRespuesta.findOne({ "prueba": param.prueba, "alumno": param.alumno }).then((docHRP) => {
                                    resolve({ docHRP: docHRP, docPrueba: docPrueba });
                                })

                            } else {
                                prueba.docHRP.terminada = true;
                                schemaPruebaHojaRespuesta.updateOne({ '_id': prueba.docHRP._id }, prueba.docHRP).where('terminada').equals(false).then((docUpdate) => {
                                    console.log({ docHRPUpdate: docUpdate });
                                    schemaPruebaHojaRespuesta.findOne({ "prueba": param.prueba, "alumno": param.alumno }).then((docHRP) => {
                                        resolve({ docHRP: docHRP, docPrueba: docPrueba });
                                    })

                                })

                            }
                        })

                    })
                }

            }





            const steps = [
                secuencia.populateAlternativas, secuencia.iniciarPrueba, secuencia.getData
            ];
            const sequence = new Sequence(steps, { interval: 1000 });
            sequence.on('success', (data, index) => {
                console.log({ data: data, index: index });
                if (index == 2) {
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: { doc: data.value, error: null } });
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
        respuesta.sendDev({ req: req, res: res, code: 200, respuesta: { doc: false, error: 'Error inesperado' } });


    }
}).post(rutas[5].ruta, (req, res, next) => {
    /**
     * Metodo termina una prueba
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;

        console.log({ paramEndPrueba: param });

        schemaPruebaHojaRespuesta.findOne({ "prueba": param.prueba, 'alumno': param.alumno }).populate('prueba').exec().then((docHRP) => {
            let secuencia = {
                calcularAprovacion: () => {
                    return new Promise((resolve, reject) => {
                        if (Object.keys(param).indexOf('preguntas') > -1) {
                            let buenas = 0;
                            let contador = 0;
                            param.preguntas.forEach((respuesta) => {
                                console.log({ respuesta: respuesta.alternativa });
                                if (respuesta.alternativa.correcta == true || respuesta.alternativa.correcta == 'true') {
                                    buenas = buenas + 1;
                                    contador = contador + 1;
                                } else {
                                    contador = contador + 1;
                                }

                                if (contador == param.preguntas.length) {
                                    //set hoja respuesta
                                    let aprovacion = ((docHRP.prueba.porcentajeAprovacion * docHRP.prueba.preguntas.length) / 100);
                                    if (buenas >= Number.parseInt(aprovacion)) {
                                        docHRP.aprovado = true;
                                        resolve(true);
                                    } else {
                                        resolve(true);
                                    }

                                }
                            })
                            console.log({ preguntas: param.preguntas, prueba: docHRP.prueba });

                        } else {
                            resolve(true);
                        }
                    })
                },
                cerrarPrueba: () => {
                    return new Promise((resolve, reject) => {
                        docHRP.preguntas = param.preguntas;
                        docHRP.terminada = true;
                        schemaPruebaHojaRespuesta.updateOne({ "_id": docHRP._id }, docHRP).then((docUpdate) => {
                            resolve(true);
                        }).catch(err => {
                            resolve(true);
                        })
                    })
                }
            }

            const steps = [
                secuencia.calcularAprovacion, secuencia.cerrarPrueba
            ];
            const sequence = new Sequence(steps, { interval: 1000 });
            sequence.on('success', (data, index) => {
                console.log({ data: data, index: index });
                if (index == 1) {
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: { doc: data.value, error: null } });
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

        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: { doc: false, error: 'Error inesperado' } });

    }


}).post(rutas[6].ruta, (req, res, next) => {
    /**
     * Metodo envía información básica de un cliente
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;
        console.log({ clienteParam: param });
        schemaCliente.findOne({ 'correo': param.correo }).then((docCliente) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: { doc: docCliente, error: null } });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: { doc: null, error: 'Error en la petición' } });
        })


    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: { doc: null, error: 'Error inesperado' } });
    }


}).post(rutas[7].ruta, (req, res, next) => {
    /**
     * Metodo envía la hoja de respuesta de una prueba
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;

        schemaPruebaHojaRespuesta.findOne({ '_id': param.resultadoId }).populate('prueba').exec().then((docHRP) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: { doc: docHRP, error: null } });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: { doc: null, error: 'Error en la petición' } });
        })




    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: { doc: null, error: 'Error inesperado' } });
    }
}).post(rutas[8].ruta, (req, res, next) => {
    /**
     * Metodo envía información básica de un cliente
     * @param param
     */

    try {

        let data = req.body.data;
        let param = data.param;

        let secuencia = {
            updateTimeClase: () => {
                return new Promise((resolve, reject) => {
                    schemaClase.findOne({ '_id': param.clase }).then((docClase) => {

                    })
                })
            },
            updateTimeModulo: () => {
                return new Promise((resolve, reject) => {

                })
            }, updateTimeCurso: () => {
                return new Promise((resolve, reject) => {

                })
            }
        }



    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: { doc: null, error: 'Error inesperado' } });
    }
}).post(rutas[9].ruta, (req, res, next) => {
    /**
         * Metodo registra un estudiante en un curso
         * @param param
         */

    try {
        let data = req.body;
        let payStudent = data.payer_email;
        let payCode = data.item_number1;
        console.log({compraPago:data});
        schemaCliente.findOne({"correoPago":payStudent}).populate('inscripcionCursos').then((docCliente)=>{
            if(docCliente!=null){
                schemaCurso.findOne({"codigoVenta":payCode}).then((docCurso)=>{
                    console.log({inscripcionCursos:docCliente.inscripcionCursos});
                    let idxCurso = _.findIndex(docCliente.inscripcionCursos,(o)=>{
                        return o.curso==docCurso._id;
                    })

                    if(idxCurso==-1){
                        let newAvancesCurso = new schemaAvancesCurso();
                        schemaAvancesCurso.create(newAvancesCurso).then((docAvanceCurso)=>{
                            let newInscription = new  schemaInscCursoCliente();
                            newInscription.fechaInscripcion=moment().format('DD-MM-YYYY');
                            newInscription.curso=docCurso._id;
                            newInscription.fechaCreacion=moment().unix();
                            newInscription.avancescurso=newAvancesCurso;
                            schemaInscCursoCliente.create(newInscription).then((newDocInscrip)=>{
                                
                                docCliente.inscripcionCursos.push(newDocInscrip._id);
                                schemaCliente.updateOne({"_id":docCliente._id},docCliente).then((docClienteUpdate)=>{
                                    res.status(200);
                                })
                            })
                        })
                        
                    }else{
                        res.status(200);
                    }

                    
                })
            }else{
                res.status(200);
            }
        })
    } catch (e) {
        res.status(200);
    }
}).post(rutas[10].ruta, (req, res, next) => {
    /**
         * Metodo registra un estudiante
         * @param param
         */

    try {
        let data = req.body.data;
        let param = data.param;
        console.log({paramRecibe:param});
        schemaCliente.findOne({"correo":param.correo}).then((doc)=>{
            console.log({docCliente:doc});
            if(doc==null){
                let newCliente = new schemaCliente();
                newCliente=param;
                schemaCliente.create(newCliente).then((docCreate)=>{
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: { doc: docCreate, error: null } });
                })
            }else if(doc!=null){
                let sello =  Object.seal(doc);
                let update = Object.assign(doc,param);
                schemaCliente.updateOne({"correo":param.correo},update).then((docUpdate)=>{
                    respuesta.sendDev({ req: req, res: res, code: 200, respuesta: { doc: update, error: null } });
                })
            }
        })
    } catch (e) {
        respuesta.sendDev({ req: req, res: res, code: 200, respuesta: { doc: null, error: 'Error inesperado' } });
    }
})

module.exports = secureRouter;