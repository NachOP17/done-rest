require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const validator = require('validator');
const {ObjectId} = require('mongodb');

var {tareaCompletada} = require('./middleware/tareaCompletada');
var {mongoose} = require('./db/mongoose');
var {Tarea} = require('./modelos/tarea');
var {Usuario} = require('./modelos/usuario');
var {Categoria} = require('./modelos/categoria');
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
  if (req.body.categoria) {
    Categoria.findByCategory(req.body.categoria).then((categoria) => {
      var tarea = new Tarea({
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        fechaParaSerCompletada: req.body.fechaParaSerCompletada,
        _creador: req.usuario.id,
        _categoria: categoria.id
      });

      tarea.save().then(() => {
        res.send(Errores.correcto);
      }).catch((e) => {
        res.status(400).send(Errores.validarErroresDeTareas(e));
      });
    }).catch((e) => {
      res.status(404).send(Errores.categoriaNoExiste);
    })
  } else {
    var tarea = new Tarea({
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      fechaParaSerCompletada: req.body.fechaParaSerCompletada,
      _creador: req.usuario.id,
    });

    tarea.save().then(() => {
      res.send(Errores.correcto);
    }).catch((e) => {
      res.status(400).send(Errores.validarErroresDeTareas(e));
    });
  }
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

app.get('/tareas/:categoria', autenticar, (req, res) => {
  Categoria.find({
    categoria: req.params.categoria,
    activo: true
  }).then((categoria) => {
    if (!(categoria[0] == undefined)) {
      Tarea.find({
        _categoria: categoria[0]._id,
        _creador: req.usuario.id
      }).then((tarea) => {
        if (tarea[0] == undefined) {
          res.send(Errores.noHayTareas);
        } else {
          res.send({tarea});
        }
      }, (e) => {
        res.status(400).send(e);
      });
    } else {
      res.status(404).send(Errores.categoriaNoExiste);
    }
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/tareas/id/:id', autenticar, (req, res) => {
  Tarea.findOne({
    _id: req.params.id,
    _creador: req.usuario.id
  }).then((tarea) => {
    res.status(200).send(tarea);
  }).catch((e) => {
    res.status(404).send(Errores.idTareaNoEncontrado);
  })
});

app.patch('/tareas/:id', autenticar, tareaCompletada, (req, res) => {
  var id = req.params.id
  var camposPermitidos = ['titulo', 'descripcion', 'fechaParaSerCompletada', 'completado'];
  var body = _.pick(req.body, camposPermitidos);
  try{
    Errores.validarErroresUpdateTarea(body, id, req.tarea);
    Tarea.findOneAndUpdate({
      _creador: req.usuario._id,
      _id: id
    }, {
      $set: body
    }, {new: true}).then((tarea) => {
      if (tarea == null){
        logger.error(Errores.idNoEncontrado);
        return res.status(404).send(Errores.idNoEncontrado);
      }
      res.status(200).send({tarea});
      logger.info(Errores.correcto)
    }), (e) => {
      res.status(400).send(e)
    }
  } catch(e){
    res.status(400).send(e);
    logger.error(e);
  }
});


// app.post('/categorias', autenticar, (req, res) => {
//   logger.info('POST /categorias');
//   var categoria = new Categoria({
//     categoria: req.body.categoria,
//     activo: req.body.activo
//   });
//   var error = [];
//
//   categoria.save().then(() => {
//     res.status(200).send(Errores.correcto);
//     logger.info(Errores.correcto);
//   }).catch((e) => {
//     res.status(404).send(Errores.categoriaNoExiste);
//     logger.error(Errores.categoriaNoExiste);
//   })
// });


app.get('/categorias', (req, res) => {
  Categoria.find({
    activo: true
  }).then((categorias) => {
    res.send(categorias);
  }, (e) => {
    res.status(400);
  });
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
        var datosAEnviar = {
          codigo : Errores.correcto.codigo,
          mensaje : Errores.correcto.mensaje,
          token : token
        }
        res.header('x-auth', token).send(datosAEnviar);
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


app.post('/usuarios/changepass', (req, res) => {
  logger.info('POST /usuarios/changepass');
  var body = _.pick(req.body, 'email');
  var email = req.body.email;
  var id = "";

  if (email == "") {
    res.status(400).send(Errores.correoNoIngresado);
  } else if (!validator.isEmail(email)) {
    Usuario.findOne({username: email}).then((usuario) => {
      email = usuario.email,
      id = usuario._id;
      logger.info(Errores.correcto);
      res.status(200).send(Errores.correcto);
      Mailer.passwordOlvidada(email, id);
    }).catch((e) => {
      logger.error(Errores.usuarioNoRegistrado);
      res.status(404).send(Errores.usuarioNoRegistrado);
    });
  }
  else {
    Usuario.findOne({email}).then((usuario) => {
      id = usuario._id;
      logger.info(Errores.correcto);
      res.status(200).send(Errores.correcto);
      Mailer.passwordOlvidada(email, id);
    }).catch((e) => {
      logger.error(Errores.correoNoExiste);
      res.status(404).send(Errores.correoNoExiste);
    });
  }
});

//
// Cambiar contraseña

app.patch('/usuarios/pass', (req,res) => {
  var body = _.pick(req.body, 'email');
  logger.info('PATCH /usuarios/pass');
  try{
    Errores.validarErroresForgotPass(body);
    Usuario.findOne({email: body.email}).then((usuario) => {
      if(usuario==null) return res.status(404).send(Errores.correoNoExiste);
      res.status(200).send(Mailer.generateRandomPassword(usuario.id))
    })
  } catch(e){
    logger.error(e)
    res.status(400).send(e)
  }
});

app.patch('/usuarios/me/pass', autenticar, (req,res) => {
  var camposPermitidos = ['passwordViejo', 'password'];
  var body= _.pick(req.body, camposPermitidos);
  // console.log(body);
  var user = req.usuario;
  logger.info('PATCH /usuarios/me/pass');
  // logger.info('Body: \n',body);
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
  }, (e) => {
    res.status(400).send(e);
  });
});

app.delete('/tareas/:id', autenticar, (req, res) => {
  logger.log('DELETE /tareas/:id');
  Tarea.buscarCreador(req.params.id).then((tarea) => {
    if (tarea == null) {
      res.status(400).send(Errores.idNoExiste);
    } else {
      if (tarea._creador == req.usuario.id) {
        Tarea.eliminarTarea(req.params.id).then((resultado) => {
          console.log(resultado);
          if (resultado == null) {
            res.status(404).send(Errores.idNoExiste);
          } else {
            res.status(200).send(Errores.correcto);
          }
        }, (e) => {
          res.status(400).send(e);
        });
      } else {
        res.status(401).send(Errores.usuarioNoAutorizado);
      }
    }
  }, (e) => {
    res.status(400).send(e);
  });
});

app.listen(port, () => {
  console.log(`El servidor está en el puerto ${port}`);
});

module.exports = {app};
