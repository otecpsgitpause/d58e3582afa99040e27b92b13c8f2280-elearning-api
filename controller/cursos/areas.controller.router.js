'use strict'

var express = require('express');
var secureRouter = express.Router();
var respuesta = require('../respuesta');
var rutas = require('./areas.controller.router.json');
var schemaArea = require('../../dbs/schemas/cursos/areas.schema');
var _ = require('lodash');
const Sequence = require('@lvchengbin/sequence');

secureRouter.post(rutas[0].ruta,(req, res, next) => {
    /**
     * Método registra un área
     * @param area
     */

     try{
         let data = req.body.data;
         let area = data.area;

         let areaSave = new schemaArea();
         areaSave.nombre = area.nombre;
         schemaArea.create(areaSave).then((doc) => {
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: doc });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })

     }catch(e){
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
     }


}).post(rutas[1].ruta,(req, res, next) => {
    /**
     * Método envía áreas
     * 
     */

     try{

        schemaArea.find({}).then((doc)=>{
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: doc });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })

     }catch(e){
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
     }
}).post(rutas[2].ruta,(req, res, next) => {
    /**
     * Método envía un área
     * @param area
     */

     try{

        let data = req.body.data;
        let area = data.area;

        schemaArea.findOne({"_id":area}).then((doc)=>{
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: doc });
        }).catch(err => {
            respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
        })

     }catch(e){
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
     }
}).post(rutas[3].ruta,(req, res, next) => {
    /**
     * Método actualiza un área
     * @param area
     */

     try{

        let data = req.body.data;
        let area = data.area;

        schemaArea.findOneAndUpdate({"_id":area._id},area).then((doc)=>{
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: true });
        })

     }catch(e){
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
     }
}).post(rutas[4].ruta,(req, res, next) => {
    /**
     * Método elimina un área
     * @param area
     */

     try{

        let data = req.body.data;
        let area = data.area;

        schemaArea.findOneAndRemove({"_id":area}).then((doc)=>{
            respuesta.sendDev({ req: req, res: res, code: 200, respuesta: true });
        })

     }catch(e){
        respuesta.sendDev({ req: req, res: res, code: 500, respuesta: null });
     }
})


module.exports= secureRouter;