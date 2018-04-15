var express = require('express');
var app = express();

app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });

});

// es para que se pueda usar app en otros archivos
module.exports = app;