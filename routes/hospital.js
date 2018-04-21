var express = require('express');

// var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

// ==============================
// Obtener todos los hospitales
// ==============================
app.get('/', (req, res, next) => {

    // Ver de mejorar esto
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospital!',
                        errors: err
                    });

                }

                //Armo funcion para pasar el numero de usuarios que existen
                Hospital.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });

                });

            });

});


// ==============================
// Actualizar hospital
// Para actualizar se puede usar: (put o patch)
// ==============================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar un hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el ID ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        // Asigno los valores del body para actualizarlos en la base de datos
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });

            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });

});

// ==============================
// Crear un nuevo hospital
// ==============================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al Crear un hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
        });

    });

});

// ==============================
// Borrar un hospital por el id
// ==============================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar un hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });

});

// es para que se pueda usar app en otros archivos
module.exports = app;