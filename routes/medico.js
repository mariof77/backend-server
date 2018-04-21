var express = require('express');

// var SEED = require('../config/config').SEED;
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// ==============================
// Obtener todos los medicos
// ==============================
app.get('/', (req, res, next) => {

    // Ver de mejorar esto
    var desde = req.query.desde || 0;
    desde = Number(desde);


    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medico!',
                        errors: err
                    });

                }

                //Armo funcion para pasar el numero de usuarios que existen
                Medico.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });

                });


            });

});


// ==============================
// Actualizar medico
// Para actualizar se puede usar: (put o patch)
// ==============================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar un medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el ID ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        // Asigno los valores del body para actualizarlos en la base de datos
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                });

            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});

// ==========================================
// Crear un nuevo medico
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });


    });

});


// ==============================
// Borrar un medico por el id
// ==============================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar un medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: 'No existe un medico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });

});

// es para que se pueda usar app en otros archivos
module.exports = app;