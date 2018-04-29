var express = require('express');
var bcrypt = require('bcryptjs'); // https://github.com/dcodeIO/bcrypt.js
var jwt = require('jsonwebtoken'); // https://github.com/auth0/node-jsonwebtoken
 
var SEED = require('../config/config').SEED;
var CADUCIDAD_TOKEN = require('../config/config').CADUCIDAD_TOKEN;
 
var app = express();
 
var Usuario = require('../models/usuario');

// Google
const {OAuth2Client} = require('google-auth-library');

var CLIENT_ID = require('../config/config').CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

//=============================
// Autenticación de Google
//=============================
app.post('/google', async (req, res) => {
    let token = req.body.token;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    }).catch(e => {
        return res.status(403).json({
            ok: false,
            mensaje: 'Token no válido',
            err: e
        });
    })
 
    const googleUser = ticket.getPayload(); 
 
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            } else {
                console.log('No existe usuario');
 
                let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: CADUCIDAD_TOKEN });
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        } else {
            // Si el usuario no existe en nuestra base de datos
            let usuario = new Usuario();
            usuario.nombre = googleUser.name;
            usuario.email = googleUser.email;
            usuario.img = googleUser.picture;
            usuario.google = true;
            usuario.password = ':)';
            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };
                let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: CADUCIDAD_TOKEN });
                //var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas 
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            });
        }
    });
});
 






// ==============================================
// Autenticación normal
// ==============================================
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Usuario',
                errors: err
            });
        }

        // sino existe el usuario en la base de datos, envio error
        if (!usuarioDB) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });

        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un token
        usuarioDB.password = ':)';

        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    });

});

module.exports = app;