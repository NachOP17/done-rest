require('./config/config');
const express = require('express');
const validator = require('validator');
const bodyParser = require('body-parser');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose');
var {Tarea} = require('./modelos/tarea');
var {Usuario} = require('./modelos/usuario');
var {autenticar} = require('./middleware/autenticar');

var app = express();

var port = process.env.PORT;


app.use(bodyParser.json());

app.post('/tareas', (req, res) => {
  var tarea = new Tarea({
    titulo: req.body.titulo,
    descripcion: req.body.descripcion
  });

  tarea.save().then((doc) => {
    res.send(doc)
  }, (e) => {
    res.status(400).send(e);
  });
});


// POST guarda el usuario en la base de datos
// Crear Usuario
app.post('/usuarios', (req, res) => {
  var camposPermitidos = ['email', 'password', 'username', 'nombre', 'apellido', 'fechaDeNacimiento'];
  // camposPermitidos es utilizada para incrementar la seguridad de la aplicación
  // de esta manera los datos como token o _id no son visibles en la parte de cliente.
  var body = _.pick(req.body, camposPermitidos);
  var usuario = new Usuario(body);

  usuario.save().then(() => {
    return usuario.generarTokenDeAutenticidad();
  }).then((token) => {
    res.header('x-auth', token).send();
  }).catch((e) => {
    switch(e.code) {
      case 11000: res.status(412).send(e);
        break;
      default: res.status(400).send(e);
    };
  });
});


//GET busca un usuario
// Busca los datos del usuario
app.get('/usuarios/me', autenticar, (req, res) => {
  res.send(req.usuario);
});


// Iniciar sesión
app.post('/usuarios/login', (req, res) => {
  var camposPermitidos = ['username', 'password'];
  var body = _.pick(req.body, camposPermitidos);

  Usuario.findByCredentials(body.username, body.password).then((usuario) => {
    usuario.generarTokenDeAutenticidad().then((token) => {
      res.header('x-auth', token).send(usuario);
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});

// Cerrar Sesión
app.delete('/usuarios/me/token', autenticar, (req, res) => {

  req.usuario.eliminarToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`El servidor está en el puerto ${port}`);
});

module.exports = {app};
