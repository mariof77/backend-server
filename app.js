// Requires. Referencias a las librerias
var express = require('express');
var mongoose = require('mongoose');




// Inicializar variables
var app = express();


// Conexión a la base de datos
mongoose.connect('mongodb://localhost:27017/hospitalDB');

var db = mongoose.connection;

// db.on('error: ', console.error.bind(console, 'connection error: '));

db.on('error', function() {
    console.log('\x1b[31m%s\x1b[0m ', 'Connection error: ');
});

db.once('open', function() {
    console.log('Base de datos: \x1b[32m%s\x1b[0m', ' online');
});


// Rutas

app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    })

});


// Escuchar peticiones
// \x1b[32m%s\x1b[0m (defino el color verde)
app.listen(3000, () => {
    console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', ' online');
});