var nodemailer = require('nodemailer');
var configuracion= require('./configuracion-mail.json');
var mail = {

    

    send:(mailOption)=>{

        /**
         *  
         * param require mailOption = from, to, subject, text
         *  
         */

        var transporter = nodemailer.createTransport(configuracion);
        
        return transporter.sendMail(mailOption)

    }


}

module.exports=mail;