var crypto= require('../crypto/cryptojs');

var respuesta={
    sendDev:(params)=>{

        /**
         * Método acepta como parametros @param req, @param res, @param code, @param respuesta .
         */
        
        params.res.status(params.code).json({
            respuesta:params.respuesta
        })
    },
    sendProd:(params)=>{

        /**
         * Método acepta como parametros @param req, @param res, @param code, @param respuesta .
         */

        crypto.encode(params.respuesta).then((enc)=>{
            params.res.status(params.code).json({
                respuesta:params.respuesta
            })
        })
        
    },
}

module.exports=respuesta;