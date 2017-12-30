require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const validator = require('validator');
const {ObjectId} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Tarea} = require('./modelos/tarea');
var {Usuario} = require('./modelos/usuario');
var {autenticar} = require('./middleware/autenticar');
var {Errores} = require('./modelos/errores');
var {Mailer} = require('./mailer');
var winston = require('winston');


var app = express();

var port = process.env.PORT;

const tsFormat = () => (new Date()).toLocaleTimeString();


const logger = new (winston.Logger)({
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: true,
      //level: 'info'
    }),
    new (require('winston-daily-rotate-file'))({
      filename: `_server.log`,
      timestamp: tsFormat,
      datePattern: 'yyyy-MM-dd',
      prepend: true,
      handleExceptions: true,
      humanReadableUnhandledException: true
      //level: env === 'development' ? 'verbose' : 'info'
    })
  ]
});


app.use(bodyParser.json());

app.post('/tareas', autenticar, (req, res) => {
  var tarea = new Tarea({
    titulo: req.body.titulo,
    descripcion: req.body.descripcion,
    fechaParaSerCompletada: req.body.fechaParaSerCompletada,
    _creador: req.usuario.id
  });

  tarea.save().then(() => {
    res.send(Errores.correcto);
  }).catch((e) => {
    res.status(400).send(Errores.validarErroresDeTareas(e));
  });
});

app.get('/tareas', autenticar, (req, res) =>{
  Tarea.find({
    _creador: req.usuario._id
  }).then((tarea) => {
    res.send({tarea});
  }, (e) => {
    res.status(400).send(e);
  })
});

app.patch('/tareas/completado/:id', autenticar, (req, res) => {
  Tarea.findOneAndUpdate({
    _creador: req.usuario._id,
    _id: req.params.id
  }, {
    $set:{
      completado: true
    }
  }, {new: true}).then((tarea) => {
    console.log(tarea);
    res.status(200).send(tarea);
  }), (e) => {
    res.status(400).send(e)
  }
});
// POST guarda el usuario en la base de datos
// Crear Usuario
app.post('/usuarios', (req, res) => {
  logger.info('POST /usuarios');
  var camposPermitidos = ['email', 'password', 'username', 'nombre', 'apellido', 'fechaDeNacimiento'];
  // camposPermitidos es utilizada para incrementar la seguridad de la aplicación
  // de esta manera los datos como token o _id no son visibles en la parte de cliente.
  var body = _.pick(req.body, camposPermitidos);
  var usuario = new Usuario(body);
  var error = [];

  usuario.save().then(() => {
    res.status(200).send(Errores.correcto);
    logger.info(Errores.correcto);
  }).catch((e) => {
    res.status(400).send(Errores.validarErroresRegistro(e));
    logger.error(Errores.validarErroresRegistro(e));
  });
});


//GET busca un usuario
// Busca los datos del usuario
app.get('/usuarios/me', autenticar, (req, res) => {
  logger.info('GET /usuarios/me');
  res.send(req.usuario);
});


// Iniciar sesión
app.post('/usuarios/login', (req, res) => {
  logger.info('POST /usuarios/login');
  var camposPermitidos = ['username', 'password'];
  var body = _.pick(req.body, camposPermitidos);
  Usuario.findByCredentials(body.username, body.password).then((usuario) => {
    Usuario.findByIdAndUpdate(usuario.id, {
      $set: {
        intentos: 0
      }
    }, {new: true}).then((user) => {
      usuario.generarTokenDeAutenticidad().then((token) => {
        res.header('x-auth', token).send(Errores.correcto);
        logger.info(Errores.correcto);
      })
    });
  }).catch((e) => {
    switch(e.code){
      case 1: res.status(404).send(Errores.usuarioIncorrecto);
              logger.error(Errores.usuarioIncorrecto);
              break;
      case 2: Usuario.findByIdAndUpdate(e.user.id, {
        $inc: {
          intentos: 1
        }
      }, {new: true}).then((usuario) => {
        if (usuario.intentos >= 5) {
          if (usuario.intentos == 5) {
            //console.log(e.user.id)
            Mailer.enviarCorreo(usuario.email, e.user.id);
          }
          res.status(401).send(Errores.usuarioBloqueado);
          logger.error(Errores.usuarioBloqueado);
        } else
          res.status(401).send(Errores.passwordIncorrecta);
          logger.error(Errores.passwordIncorrecta);
      })
      break;
      default: res.status(400).send(Errores.validarErroresRegistro(e));
               logger.error(Errores.validarErroresRegistro(e));
              break;

    }
    //res.status(401).send(e);
  });
});

//
// Cambiar contraseña

app.patch('/usuarios/me/pass', autenticar, (req,res) => {
  var camposPermitidos = ['passwordViejo', 'password'];
  var body= _.pick(req.body, camposPermitidos);
  var user = req.usuario;
  logger.info('PATCH /usuarios/me/pass');
  logger.info('Body: \n',body);
  try{
     Errores.validarErroresCambiaPass(body);
     if (user.password == Usuario.encrypt(body.passwordViejo)){
        Usuario.findByIdAndUpdate(user.id, {
          $set: {
            password: Usuario.encrypt(body.password)
          }
        }, {new:true}).then((usuario) => {
          res.status(200).send(Errores.correcto);
          logger.info(Errores.correcto)
        }).catch((e) => res.status(400).send(e));
    }
    else
      res.status(404).send(Errores.passwordIncorrecta);
      logger.error(Errores.passwordIncorrecta);
  }catch(e){
    res.status(400).send(e);
    logger.error("Error: ", e);
  }
});

//desbloquear usuario por id
app.patch('/usuarios/me/:id', (req,res) => {
  var id = req.params.id;
  var camposPermitidos = ['password'];
  var body = _.pick(req.body, camposPermitidos);
  logger.log(`PATCH /usuarios/me/${id}`);
  if (!ObjectId.isValid(id)) return res.status(404).send();
  Usuario.findByIdAndUpdate(id, {
    $set:{
      intentos: 0,
      password: Usuario.encrypt(body.password)
    }
  }, {new: true}).then((usuario) => {
    if (!usuario) {
      res.status(404).send(Errores.usuarioIncorrecto);
      logger.error(Errores.usuarioIncorrecto);
    }
    else {
      res.status(200).send(Errores.correcto);
      logger.info(Errores.correcto);
    }
  }).catch((e) => {
    res.status(400).send(Errores.validarErroresRegistro(e));
    logger.error(Errores.validarErroresRegistro(e));
  });
});

// Cerrar Sesión
app.delete('/usuarios/me/token', autenticar, (req, res) => {
  logger.log('DELETE /usuarios/me/token');
  req.usuario.eliminarToken(req.token).then(() => {
    res.status(200).send(Errores.correcto);
    logger.info(Errores.correcto);
  }, () => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`El servidor está en el puerto ${port}`);
});

module.exports = {app};
