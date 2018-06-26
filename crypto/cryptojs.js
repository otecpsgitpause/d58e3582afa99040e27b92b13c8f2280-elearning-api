var crypto = require('crypto-js');
var hasCodeEnv = process.env.codeEncry;
var jCode = process.env.jCode
const cryptoFunction = {
    encrypto: function(data) {
        var jData = JSON.stringify(data);
        console.log(jData);
        var tdes = crypto.TripleDES.encrypt(jData, jCode);
        var rbd = crypto.Rabbit.encrypt(tdes.toString(), jCode);
        return rbd.toString();
    },
    encode: function(d) {
        let k, ena, enb, hashCode;
        hashCode = hasCodeEnv;

        return new Promise((resolve, reject) => {
            k = crypto.enc.Base64.parse(hashCode).toString();
            ena = crypto.TripleDES.encrypt(d, k);
            enb = crypto.Rabbit.encrypt(ena.toString(), k);
            resolve(enb.toString());
        }).catch(() => {
            //throw reject;
            console.log('fallo en el encode');
        })
    },
    decode: function(d) {
        let k, dna, dnb;
        hashCode = hasCodeEnv;
        return new Promise((resolve, reject) => {
            k = crypto.enc.Base64.parse(hashCode).toString();
            dnb = crypto.Rabbit.decrypt(d, k);
            dna = crypto.TripleDES.decrypt(dnb.toString(crypto.enc.Utf8), k);
            resolve(dna.toString(crypto.enc.Utf8));
        }).catch((reason) => {
            throw reason;
            console.log('fallo en el decode');
        })
    },
    generateCode: function() {
        let p = 'moco clave';
        return new Promise((resolve, reject) => {
            var salt = crypto.lib.WordArray.random(128 / 8);
            let code = crypto.PBKDF2(p, salt, { keySize: 512 / 32, iterations: 1000 });
            resolve(code.toString());
        })
    }

}

module.exports = cryptoFunction;